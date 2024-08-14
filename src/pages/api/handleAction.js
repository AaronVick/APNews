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

    // Construct the response
    res.status(200).json({
      frames: [
        {
          version: 'vNext',
          image: `https://via.placeholder.com/1200x630.png?text=${encodeURIComponent(currentArticle.title.slice(0, 50))}`,
          buttons: [
            { label: 'Next', action: 'post' },
            { label: 'Previous', action: 'post' },
            { label: 'Read', action: 'link', target: currentArticle.link },
            { label: 'Home', action: 'post' }
          ],
          title: currentArticle.title,
          post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction`,
          input: {
            text: `${category}:${nextIndex}`
          }
        }
      ]
    });
  } catch (error) {
    console.error('Error processing request:', error);

    // Send an error frame
    res.status(200).json({
      frames: [
        {
          version: 'vNext',
          image: `https://via.placeholder.com/1200x630.png?text=${encodeURIComponent('Error: ' + error.message)}`,
          buttons: [
            { label: 'Home', action: 'post' }
          ],
          title: 'Error Occurred',
          post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction`
        }
      ]
    });
  }
}