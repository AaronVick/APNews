import fetchRSS from '../../utils/fetchRSS';

export default async function handleAction(req, res) {
  try {
    const { buttonIndex } = req.body.untrustedData || {};
    console.log('Button Index:', buttonIndex);

    let category;
    switch (buttonIndex) {
      case 1:
        category = 'top';
        break;
      case 2:
        category = 'world';
        break;
      case 3:
        category = 'tech';
        break;
      case 4:
        category = 'business';
        break;
      default:
        throw new Error(`Invalid button index: ${buttonIndex}`);
    }

    console.log('Category selected:', category);

    const articles = await fetchRSS(category);
    if (!articles || articles.length === 0) {
      throw new Error(`No articles found for category: ${category}`);
    }

    console.log('Fetched articles:', articles);

    const article = articles[0];
    if (!article) {
      throw new Error(`No article found in fetched articles for category: ${category}`);
    }

    console.log('Selected article:', article);

    const frameResponse = {
      frames: [
        {
          version: 'vNext',
          image: article.image || `https://via.placeholder.com/1200x628.png?text=${encodeURIComponent(article.title)}`,
          buttons: [
            { label: 'Next', action: 'post', target: `${category}:1` },
            { label: 'Back', action: 'post', target: `${category}:${articles.length - 1}` },
            { label: 'Read', action: 'link', target: article.link },
            { label: 'Home', action: 'post' }
          ],
          title: article.title,
          inputText: `${category}:0`
        }
      ]
    };

    console.log('Frame response:', frameResponse);

    res.status(200).json(frameResponse);

  } catch (error) {
    console.error('Error occurred in handleAction:', error.message);

    res.status(400).json({
      frames: [
        {
          version: 'vNext',
          image: `https://via.placeholder.com/1200x630.png?text=${encodeURIComponent(`Error: ${error.message}`)}`,
          buttons: [
            { label: 'Home', action: 'post' }
          ],
          title: 'Error Occurred',
          error: error.message
        }
      ]
    });
  }
}
