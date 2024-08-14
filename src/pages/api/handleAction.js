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



/* import fetchRSS from '../../utils/fetchRSS';

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
    const imageUrl = `https://placehold.co/1200x630/4B0082/FFFFFF/png?text=${encodeURIComponent(currentArticle.title.slice(0, 50))}&font=arial&size=30`;

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