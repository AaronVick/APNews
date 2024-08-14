import fetchRSS from '../../utils/fetchRSS';

export default async function handleAction(req, res) {
  const { untrustedData } = req.body;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  const placeholderImage = `${baseUrl}/placeholder.png`; // Make sure this image exists in your public folder

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
    const currentArticle = rssFeed.articles[currentArticle];

    // Prepare the response for Farcaster
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${placeholderImage}" />
          <meta property="fc:frame:button:1" content="Next" />
          <meta property="fc:frame:button:2" content="Back" />
          <meta property="fc:frame:button:3" content="Read" />
          <meta property="fc:frame:button:4" content="Home" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/handleAction" />
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error.message);

    // Send an error frame
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${placeholderImage}" />
          <meta property="fc:frame:button:1" content="Home" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/handleAction" />
        </head>
        <body>
          <h1>Error: ${error.message}</h1>
        </body>
      </html>
    `);
  }
}

function getCategory(inputText) {
  switch (inputText.toLowerCase()) {
    case 'top':
    case 'world':
    case 'tech':
    case 'business':
    case 'home':
      return inputText.toLowerCase();
    default:
      return 'top';
  }
}