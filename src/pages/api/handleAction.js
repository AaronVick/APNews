import fetchRSS from '../../utils/fetchRSS';

const rssFeeds = {
  top: 'https://rsshub.app/apnews/topics/ap-top-news',
  world: 'https://rsshub.app/apnews/topics/ap-world-news',
  us: 'https://rsshub.app/apnews/topics/ap-us-news',
  biz: 'https://rsshub.app/apnews/topics/ap-business-news'
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action } = req.body;
      const category = action.toLowerCase();

      console.log('Action received:', action);

      // Fetch the appropriate RSS feed based on the category
      const rssUrl = rssFeeds[category];
      if (!rssUrl) {
        throw new Error(`Invalid action: ${action}`);
      }

      const rssData = await fetchRSS(rssUrl);

      if (!rssData || rssData.length === 0) {
        throw new Error('Failed to fetch RSS feed.');
      }

      // Get the first article from the RSS feed
      const firstArticle = rssData[0];
      const headline = firstArticle.title;
      const thumbnailUrl = firstArticle.imageUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/default-placeholder.png`;

      console.log('First article data:', { headline, thumbnailUrl });

      // Construct a valid URL for the placeholder image
      const imageUrl = `https://via.placeholder.com/1024x536.png?text=${encodeURIComponent(headline)}`;
      const articleUrl = firstArticle.url.startsWith('http') ? firstArticle.url : `https://${firstArticle.url}`;

      console.log('Constructed image URL:', imageUrl);
      console.log('Article URL:', articleUrl);

      // Send the response back to Farcaster
      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: imageUrl,
            buttons: [
              { label: 'Back', action: 'back' },
              { label: 'Next', action: 'next' },
              { label: 'Read', action: 'read', url: articleUrl },
              { label: 'Home', action: 'home' }
            ],
            title: headline
          }
        ]
      });
    } catch (error) {
      console.error('Error processing action:', error);

      // Return a placeholder image with the error message wrapped as text
      const errorMessage = encodeURIComponent(`Error: ${error.message}`);
      const errorImageUrl = `https://via.placeholder.com/1024x536.png?text=${errorMessage}`;

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: errorImageUrl,
            buttons: [
              { label: 'Home', action: 'home' }
            ],
            title: 'Error'
          }
        ]
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
