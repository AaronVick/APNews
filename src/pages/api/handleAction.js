import fetchRSS from '../../utils/fetchRSS';

export default async function handleAction(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { untrustedData } = req.body;

  try {
    let category = 'top';
    let index = 0;

    if (untrustedData.buttonIndex) {
      const categories = ['top', 'world', 'tech', 'business'];
      category = categories[untrustedData.buttonIndex - 1] || 'top';
    } else if (untrustedData.inputText) {
      const [storedCategory, storedIndex] = untrustedData.inputText.split(':');
      category = storedCategory || 'top';
      index = parseInt(storedIndex, 10) || 0;
    }

    const { articles } = await fetchRSS(category);

    if (!articles || articles.length === 0) {
      throw new Error(`No articles found for category: ${category}`);
    }

    const currentArticle = articles[index];
    const nextIndex = (index + 1) < articles.length ? index + 1 : 0;
    const prevIndex = (index - 1) >= 0 ? index - 1 : articles.length - 1;

    const imageUrl = `https://placehold.co/1200x630/4B0082/FFFFFF/png?text=${encodeURIComponent(currentArticle.title.replace(/ /g, '%20'))}&font=arial&size=30&width=1000`;

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
          <meta property="fc:frame:input:text" content="${category}:${nextIndex}" />
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
          <img src="${imageUrl}" alt="${currentArticle.title}" />
          <a href="${currentArticle.link}" target="_blank">Read Article</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error);
    const errorImageUrl = `https://placehold.co/1200x630/4B0082/FFFFFF/png?text=${encodeURIComponent('Error: ' + error.message)}&font=arial&size=30`;
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