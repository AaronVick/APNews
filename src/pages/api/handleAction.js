import fetchRSS from '../../utils/fetchRSS';

function createTextImage(text) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = '#4B0082';
  ctx.fillRect(0, 0, 1200, 630);

  // Set text properties
  ctx.font = '30px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wrap and draw text
  const words = text.split(' ');
  let line = '';
  let y = 315; // Vertical center
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 1100 && i > 0) {
      ctx.fillText(line, 600, y);
      line = words[i] + ' ';
      y += 40;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 600, y);

  return canvas.toDataURL();
}

export default async function handleAction(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { untrustedData } = req.body;

  try {
    let index = 0;

    if (untrustedData.inputText) {
      index = parseInt(untrustedData.inputText, 10) || 0;

      if (untrustedData.buttonIndex === 1) {
        // Next article
        index++;
      } else if (untrustedData.buttonIndex === 2) {
        // Previous article
        index = Math.max(0, index - 1);
      } else if (untrustedData.buttonIndex === 4) {
        // Home button - redirect to the original Vercel URL
        return res.redirect(302, process.env.NEXT_PUBLIC_BASE_URL);
      }
    }

    const { articles } = await fetchRSS('top');

    if (!articles || articles.length === 0) {
      throw new Error('No articles found in the top news feed');
    }

    // Ensure index is within bounds
    index = index % articles.length;
    const currentArticle = articles[index];

    const imageUrl = createTextImage(currentArticle.title);

    res.status(200).setHeader('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentArticle.title}</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="Next" />
          <meta property="fc:frame:button:2" content="Previous" />
          <meta property="fc:frame:button:3" content="Read" />
          <meta property="fc:frame:button:4" content="Home" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction" />
          <meta property="fc:frame:input:text" content="${index}" />
          <meta property="fc:frame:button:3:action" content="link" />
          <meta property="fc:frame:button:3:target" content="${currentArticle.link}" />
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
          <img src="${imageUrl}" alt="${currentArticle.title}" />
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error);
    const errorImageUrl = createTextImage(`Error: ${error.message}`);
    res.status(200).setHeader('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error Occurred</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${errorImageUrl}" />
          <meta property="fc:frame:button:1" content="Home" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction" />
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