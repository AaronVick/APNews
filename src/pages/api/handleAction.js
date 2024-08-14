import fetchRSS from '../../utils/fetchRSS';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { untrustedData } = req.body;
    const { buttonIndex } = untrustedData;

    const categories = ['top', 'world', 'us', 'biz'];
    const selectedCategory = categories[buttonIndex - 1];

    try {
      const articles = await fetchRSS(selectedCategory);
      const firstArticle = articles[0];

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: firstArticle.imageUrl,
            buttons: [
              { label: 'Next' },
              { label: 'Back' },
              { label: 'Read', action: 'link', target: firstArticle.url },
              { label: 'Home' }
            ],
            title: firstArticle.title
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching RSS:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}