export default async function handleAction(req, res) {
  const { untrustedData } = req.body;

  try {
    const category = getCategory(untrustedData.inputText);

    if (!category) {
      throw new Error(`Invalid category: ${untrustedData.inputText}`);
    }

    const rssFeed = await fetchRSS(category);

    if (!rssFeed || rssFeed.length === 0) {
      throw new Error(`No articles found for category: ${category}`);
    }

    const firstArticle = rssFeed[0];
    const imageUrl = firstArticle.image || 'https://via.placeholder.com/1200x630.png?text=No+Image+Available';
    const articleTitle = firstArticle.title || 'No Title Available';
    const articleLink = firstArticle.link || '#';

    res.json({
      frames: [
        {
          version: "vNext",
          image: imageUrl,
          buttons: [
            {
              label: "Next",
              action: "post",
              target: `${category}:1`
            },
            {
              label: "Back",
              action: "post",
              target: `${category}:${rssFeed.length}`
            },
            {
              label: "Read",
              action: "link",
              target: articleLink
            },
            {
              label: "Home",
              action: "post"
            }
          ],
          title: articleTitle,
          inputText: `${category}:0`
        }
      ]
    });
  } catch (error) {
    console.error('Error processing request:', error.message);

    res.json({
      frames: [
        {
          version: "vNext",
          image: `https://via.placeholder.com/1200x630.png?text=Error%3A%20${encodeURIComponent(error.message)}`,
          buttons: [
            {
              label: "Home",
              action: "post"
            }
          ],
          title: "Error Occurred",
          error: error.message
        }
      ]
    });
  }
}

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


