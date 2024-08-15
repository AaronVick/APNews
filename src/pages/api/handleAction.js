import fetchRSS from '../../utils/fetchRSS';

export default async function handleAction(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { untrustedData } = req.body;

  try {
    // Since there's only one RSS feed, we work with a fixed category
    const category = 'top'; // Fixed category since there's only one feed
    let index = 0;

    if (untrustedData.inputText) {
      index = parseInt(untrustedData.inputText, 10) || 0;
    }

    // Fetch the RSS feed for the single category
    const { articles } = await fetchRSS(category);

    if (!articles || articles.length === 0) {
      throw new Error(`No articles found in the RSS feed.`);
    }

    // Get the current article
    const currentArticle = articles[index];
    const nextIndex = (index + 1) % articles.length;  // Wrap around to the first article
    const prevIndex = (index - 1 + articles.length) % articles.length;  // Wrap around to the last article

    // Generate the placeholder image with the article title
    const imageUrl = `https://placehold.co/1200x630/4B0082/FFFFFF/png?text=${encodeURIComponent(currentArticle.title)}&font=arial&size=50&width=1000&height=500`;

    // Construct the HTML response with the correct meta tags
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
          <meta property="fc:frame:button:3:link" content="${currentArticle.link}" />
          <meta property="fc:frame:button:4" content="Home" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction" />
          <meta property="fc:frame:input_text" content="${nextIndex}" />
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
          <img src="${imageUrl}" alt="${currentArticle.title}" />
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error);

    // Send an error frame with the error message
    const errorImageUrl = `https://placehold.co/1200x630/4B0082/FFFFFF/png?text=${encodeURIComponent('Error: ' + error.message)}&font=arial&size=30&width=1000&height=500`;
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
