import fetchRSS from '../../utils/fetchRSS';

export default async function handleAction(req, res) {
  const { untrustedData } = req.body;

  try {
    // Extract category and article index from input text
    const [category, indexStr] = untrustedData.inputText.split(':');
    const index = parseInt(indexStr, 10) || 0;

    // Validate and get the category
    const validCategory = getCategory(category);
    if (!validCategory) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Fetch the RSS feed for the category
    const rssFeed = await fetchRSS(validCategory);
    if (!rssFeed || rssFeed.articles.length === 0) {
      throw new Error(`No articles found for category: ${validCategory}`);
    }

    // Ensure index is within bounds
    const currentIndex = Math.min(Math.max(index, 0), rssFeed.articles.length - 1);
    const currentArticle = rssFeed.articles[currentIndex];

    // Prepare the response for Farcaster
    res.status(200).setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AP News Farcaster Frame</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${currentArticle.imageUrl || 'https://via.placeholder.com/1200x630.png?text=No+Image+Available'}" />
          <meta property="fc:frame:button:1" content="Next" />
          <meta property="fc:frame:button:2" content="Back" />
          <meta property="fc:frame:button:3" content="Read" />
          <meta property="fc:frame:button:4" content="Home" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction" />
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error.message);

    // Send an error frame with a placeholder image and error message
    res.status(200).setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error - AP News Farcaster Frame</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://via.placeholder.com/1200x630.png?text=Error%3A%20${encodeURIComponent(error.message)}" />
          <meta property="fc:frame:button:1" content="Home" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction" />
        </head>
        <body>
          <h1>Error Occurred</h1>
        </body>
      </html>
    `);
  }
}

// Helper function to map the input text to a valid category
function getCategory(inputText) {
  switch (inputText.toLowerCase()) {
    case 'top':
      return 'top';
    case 'world':
      return 'world';
    case 'tech':
      return 'tech';
    case 'business':
      return 'business';
    case 'home':
      return 'top'; // Default to 'top' when returning to home
    default:
      return null;
  }
}