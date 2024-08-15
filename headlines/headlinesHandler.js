import fetchRSS from '../../utils/fetchRSS';  // Adjust the path as needed

const IMAGE_PATH = '/public/default-placeholder.png'; // Path to your fallback image
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const FONT_SIZE = 50; // Font size for the rendered images

function wrapText(text, maxCharsPerLine = 30) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  for (let word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
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

export default async function headlinesHandler(req, res) {
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

    const showHeadlines = req.query.action === 'showHeadlines';

    if (showHeadlines) {
      const headlineImages = articles.slice(0, 4).map((article, i) => {
        const wrappedTitleLines = wrapText(`${i + 1} - ${article.title}`);
        const formattedTitle = formatTextForPlaceholder(wrappedTitleLines);

        return {
          imageUrl: `https://place-hold.it/${IMAGE_WIDTH}x${IMAGE_HEIGHT}/4B0082/FFFFFF/png?text=${formattedTitle}&fontsize=${FONT_SIZE}&align=middle`,
          title: article.title,
          link: article.link,
        };
      });

      res.status(200).setHeader('Content-Type', 'text/html').send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Top Headlines</title>
            <meta property="fc:frame" content="vNext" />
            ${headlineImages.map((image, i) => `
              <meta property="fc:frame:button:${i + 1}" content="Read ${i + 1}" />
              <meta property="fc:frame:button:${i + 1}:action" content="link" />
              <meta property="fc:frame:button:${i + 1}:target" content="${image.link}" />
            `).join('')}
          </head>
          <body>
            ${headlineImages.map(image => `
              <img src="${image.imageUrl}" alt="${image.title}" />
            `).join('')}
          </body>
        </html>
      `);
    } else {
      // Initial page with fallback image and buttons
      res.status(200).setHeader('Content-Type', 'text/html').send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Top Headlines</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${IMAGE_PATH}" />
            <meta property="fc:frame:button:1" content="See Headlines" />
            <meta property="fc:frame:button:1:action" content="post" />
            <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/headlines?action=showHeadlines" />
            <meta property="fc:frame:button:2" content="Share" />
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_BASE_URL}" />
          </head>
          <body>
            <img src="${IMAGE_PATH}" alt="Placeholder" />
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error processing request:', error);

    const errorImageUrl = `https://place-hold.it/${IMAGE_WIDTH}x${IMAGE_HEIGHT}/4B0082/FFFFFF/png?text=${encodeURIComponent('Error: ' + error.message)}&fontsize=${FONT_SIZE}`;
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
