import fetchRSS from '../../utils/fetchRSS';

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const MAX_LINES = 6; // Maximum number of lines that can fit in the image
const MAX_CHARS_PER_LINE = 35; // Maximum characters per line

function wrapText(text) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  for (let word of words) {
    if ((currentLine + word).length <= MAX_CHARS_PER_LINE) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }

    if (lines.length === MAX_LINES) {
      lines.push(currentLine);
      currentLine = '';
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function formatTextForPlaceholder(lines) {
  return lines.map(line => encodeURIComponent(line)).join('%0A');
}

export default async function handleAction(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const category = 'top';
    let currentIndex = 0;

    if (req.query.index) {
      currentIndex = parseInt(req.query.index, 10);
    }

    const { articles } = await fetchRSS(category);

    if (!articles || articles.length === 0) {
      throw new Error(`No articles found in the RSS feed.`);
    }

    currentIndex = (currentIndex + articles.length) % articles.length;

    const currentArticle = articles[currentIndex];
    const nextIndex = (currentIndex + 1) % articles.length;
    const prevIndex = (currentIndex - 1 + articles.length) % articles.length;

    // Wrap and format the full title text without truncation
    const wrappedTitleLines = wrapText(currentArticle.title);
    const formattedTitle = formatTextForPlaceholder(wrappedTitleLines);

    // Generate the placeholder image with the wrapped and formatted article title
    const imageUrl = `https://placehold.co/${IMAGE_WIDTH}x${IMAGE_HEIGHT}/4B0082/FFFFFF/png?text=${formattedTitle}&font=arial&size=48`;

    res.status(200).setHeader('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentArticle.title}</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />

          <meta property="fc:frame:button:1" content="Next" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction?index=${nextIndex}" />

          <meta property="fc:frame:button:2" content="Previous" />
          <meta property="fc:frame:button:2:action" content="post" />
          <meta property="fc:frame:button:2:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction?index=${prevIndex}" />

          <meta property="fc:frame:button:3" content="Read" />
          <meta property="fc:frame:button:3:action" content="link" />
          <meta property="fc:frame:button:3:target" content="${currentArticle.link}" />

          <meta property="fc:frame:button:4" content="Home" />
          <meta property="fc:frame:button:4:action" content="post" />
          <meta property="fc:frame:button:4:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}" />
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
          <img src="${imageUrl}" alt="${currentArticle.title}" />
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error);

    const errorImageUrl = `https://placehold.co/${IMAGE_WIDTH}x${IMAGE_HEIGHT}/4B0082/FFFFFF/png?text=${encodeURIComponent('Error: ' + error.message)}&font=arial&size=30`;
    res.status(200).setHeader('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error Occurred</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${errorImageUrl}" />
          <meta property="fc:frame:button:1" content="Home" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}" />
        </head>
        <body>
          <h1>Error Occurred</h1>
          <p>${error.message}</p>
          <img src="${errorImageUrl}" alt="Error" />
        </body>
      </html>
    `);
  }
}
