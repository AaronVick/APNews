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
    res.json({
      frames: [
        {
          version: "vNext",
          content: {
            title: currentArticle.title,
            image: currentArticle.imageUrl || 'https://via.placeholder.com/1200x630.png?text=No+Image+Available',
          },
          buttons: [
            {
              label: "Next",
              action: "post",
              target: `${category}:${currentIndex + 1}`,
              disabled: currentIndex >= rssFeed.articles.length - 1, // Disable if at the last article
            },
            {
              label: "Back",
              action: "post",
              target: `${category}:${currentIndex - 1}`,
              disabled: currentIndex <= 0, // Disable if at the first article
            },
            {
              label: "Read",
              action: "link",
              target: currentArticle.link, // Link to the article URL
            },
            {
              label: "Home",
              action: "post",
              target: "home",
            },
          ],
          inputText: `${category}:${currentIndex}`, // Maintain state of the category and index
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
    default:
      return null;
  }
}