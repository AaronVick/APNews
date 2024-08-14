import fetchRSS from '../../utils/fetchRSS';

export default async function handleAction(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { untrustedData } = req.body;

  try {
    // Determine the category based on the button pressed or input text
    let category = 'top'; // Default category
    let index = 0;

    if (untrustedData.buttonIndex) {
      const categories = ['top', 'world', 'tech', 'business'];
      category = categories[untrustedData.buttonIndex - 1] || 'top';
    } else if (untrustedData.inputText) {
      const [storedCategory, storedIndex] = untrustedData.inputText.split(':');
      category = storedCategory || 'top';
      index = parseInt(storedIndex, 10) || 0;
    }

    // Fetch the RSS feed for the category
    const { articles } = await fetchRSS(category);

    if (!articles || articles.length === 0) {
      throw new Error(`No articles found for category: ${category}`);
    }

    // Get the current article
    const currentArticle = articles[index];
    const nextIndex = (index + 1) % articles.length;
    const prevIndex = (index - 1 + articles.length) % articles.length;

    // Generate a placeholder image URL with the article title
    const imageUrl = `https://via.placeholder.com/1200x630.png?text=${encodeURIComponent(currentArticle.title.slice(0, 50))}`;

    // Construct the response
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
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
          <img src="${imageUrl}" alt="${currentArticle.title}" />
          <script>
            window.addEventListener('message', function(e) {
              if (e.data.action === 'button') {
                if (e.data.buttonIndex === 1) {
                  window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction?category=${category}&index=${nextIndex}';
                } else if (e.data.buttonIndex === 2) {
                  window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction?category=${category}&index=${prevIndex}';
                } else if (e.data.buttonIndex === 3) {
                  window.open('${currentArticle.link}', '_blank');
                } else if (e.data.buttonIndex === 4) {
                  window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}';
                }
              }
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error);

    // Send an error frame
    const errorImageUrl = `https://via.placeholder.com/1200x630.png?text=${encodeURIComponent('Error: ' + error.message)}`;
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