import fetchRSS from '../utils/fetchRSS';

export default async function handleAction(req, res) {
  const { untrustedData } = req.body;

  try {
    // Validate and get the category from the input text
    const category = getCategory(untrustedData.inputText);
    if (!category) {
      throw new Error(`Invalid category: ${untrustedData.inputText}`);
    }

    // Fetch the RSS feed for the category
    const rssFeed = await fetchRSS(category);
    if (!rssFeed || rssFeed.articles.length === 0) {
      throw new Error(`No articles found for category: ${category}`);
    }

    // Get the first article from the RSS feed
    const firstArticle = rssFeed.articles[0];
    const imageUrl = firstArticle.image || 'https://via.placeholder.com/1200x630.png?text=No+Image+Available';
    const articleTitle = firstArticle.title || 'No Title Available';
    const articleLink = firstArticle.link || '#';

    // Construct the JSON response expected by Farcaster
    res.json({
      frames: [
        {
          version: "vNext",
          content: {
            title: articleTitle,
            image: imageUrl,
          },
          buttons: [
            {
              label: "Next",
              action: "post",
              target: `${category}:1`, // Adjust for pagination
            },
            {
              label: "Back",
              action: "post",
              target: `${category}:${rssFeed.articles.length - 1}`, // Adjust for pagination
            },
            {
              label: "Read",
              action: "link",
              target: articleLink,
            },
            {
              label: "Home",
              action: "post",
              target: "home",
            },
          ],
          inputText: `${category}:0`, // Maintain state of the category and pagination
        }
      ]
    });
  } catch (error) {
    console.error('Error processing request:', error.message);

    // Send an error frame with a placeholder image and error message
    res.json({
      frames: [
        {
          version: "vNext",
          content: {
            title: "Error Occurred",
            image: `https://via.placeholder.com/1200x630.png?text=Error%3A%20${encodeURIComponent(error.message)}`,
          },
          buttons: [
            {
              label: "Home",
              action: "post",
              target: "home",
            }
          ],
          error: error.message,
        }
      ]
    });
  }
}

// Helper function to map the input text to a category
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
    default:
      return null;
  }
}
