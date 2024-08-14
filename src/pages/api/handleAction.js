import fetchRSS from '../../utils/fetchRSS';

const DEFAULT_IMAGE = 'https://ap-news.vercel.app/trending-news-placeholder.png';

function validateUrl(url) {
  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error('Invalid URL:', url, error.message);
    return DEFAULT_IMAGE;
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { untrustedData } = req.body;
      const buttonIndex = untrustedData?.buttonIndex;

      console.log('Button index:', buttonIndex);

      const categories = ['top', 'world', 'us', 'biz'];
      const category = categories[buttonIndex - 1] || 'top';

      console.log('Selected category:', category);

      const rssData = await fetchRSS(category);

      if (!rssData || rssData.length === 0) {
        throw new Error('Failed to fetch RSS feed.');
      }

      const firstArticle = rssData[0];
      const headline = firstArticle.title;
      const thumbnailUrl = validateUrl(firstArticle.imageUrl);
      const articleUrl = validateUrl(firstArticle.url);

      console.log('First article data:', { headline, thumbnailUrl, articleUrl });

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: thumbnailUrl,
            buttons: [
              { label: 'Next', action: 'post' },
              { label: 'Back', action: 'post' },
              { label: 'Read', action: 'link', target: articleUrl },
              { label: 'Home', action: 'post' }
            ],
            title: headline
          }
        ]
      });
    } catch (error) {
      console.error('Error processing action:', error);

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: DEFAULT_IMAGE,
            buttons: [
              { label: 'Home', action: 'post' }
            ],
            title: 'Error: ' + error.message
          }
        ]
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}