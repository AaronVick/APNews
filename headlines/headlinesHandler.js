import fetchRSS from '../../utils/fetchRSS';  // Adjust the path as needed

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const FONT_SIZE = 50; // Adjust the font size as needed

export default async function handleAction(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const isHeadlinesPage = req.url.includes('/headlines');
    const category = isHeadlinesPage ? 'headlines' : 'top';
    let currentIndex = 0;

    if (req.query.index) {
      currentIndex = parseInt(req.query.index, 10);
    }

    const { articles } = await fetchRSS(category);

    if (!articles || articles.length === 0) {
      throw new Error(`No articles found in the RSS feed.`);
    }

    currentIndex = (currentIndex + articles.length) % articles.length;

    if (isHeadlinesPage) {
      // Display the top 4 headlines with Read buttons
      const headlines = articles.slice(0, 4);
      const formattedTitles = headlines.map((article, idx) => `${idx + 1} - ${article.title}`).join('%0A');
      const headlineButtons = headlines.map((article, idx) => `
        <meta property="fc:frame:button:${idx + 1}" content="Read ${idx + 1}" />
        <meta property="fc:frame:button:${idx + 1}:action" content="post" />
        <meta property="fc:frame:button:${idx + 1}:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction?index=${idx}" />
      `).join('');

      res.status(200).setHeader('Content-Type', 'text/html').send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Top Headlines</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="/public/default-placeholder.png" />

            ${headlineButtons}

            <meta property="fc:frame:button:5" content="Share" />
            <meta property="fc:frame:button:5:action" content="link" />
            <meta property="fc:frame:button:5:target" content="${process.env.NEXT_PUBLIC_BASE_URL}/ap-news/headlines" />
          </head>
          <body>
            <h1>Top Headlines</h1>
            <img src="/public/default-placeholder.png" alt="Headlines" />
            <p>${formattedTitles.replace('%0A', '<br/>')}</p>
          </body>
        </html>
      `);
    } else {
      const currentArticle = articles[currentIndex];
      const nextIndex = (currentIndex + 1) % articles.length;
      const prevIndex = (currentIndex - 1 + articles.length) % articles.length;

      // Generate the placeholder image with the article title using placeholders.dev
      const imageUrl = `https://images.placeholders.dev/?width=${IMAGE_WIDTH}&height=${IMAGE_HEIGHT}&text=${encodeURIComponent(currentArticle.title)}&bgColor=%234B0082&textColor=%23FFFFFF&fontSize=${FONT_SIZE}&textWrap=true`;

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
    }
  } catch (error) {
    console.error('Error processing request:', error);

    const errorImageUrl = `https://images.placeholders.dev/?width=${IMAGE_WIDTH}&height=${IMAGE_HEIGHT}&text=${encodeURIComponent('Error: ' + error.message)}&bgColor=%234B0082&textColor=%23FFFFFF&fontSize=${FONT_SIZE}`;
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
