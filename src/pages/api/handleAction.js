import fetchRSS from '../utils/fetchRSS';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action } = req.body; // Get the action (e.g., "Top", "World")
      const category = action.toLowerCase(); // Convert the action to a lowercase string

      // Fetch the RSS feed based on the category
      const rssData = await fetchRSS(category);

      if (!rssData || rssData.length === 0) {
        return res.status(500).json({ error: 'Failed to fetch RSS feed.' });
      }

      // Get the first article from the RSS feed
      const firstArticle = rssData[0];
      const headline = firstArticle.title;
      const thumbnailUrl = firstArticle.imageUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/default-placeholder.png`;

      // Use a placeholder service to overlay the headline on the thumbnail
      const imageUrl = `https://via.placeholder.com/1024x536.png?text=${encodeURIComponent(headline)}`;

      // Send the response back to Farcaster
      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: imageUrl,
            buttons: [
              { label: 'Back', action: 'back' },
              { label: 'Next', action: 'next' },
              { label: 'Read', action: 'read', url: firstArticle.url },
              { label: 'Home', action: 'home' }
            ],
            title: headline
          }
        ]
      });
    } catch (error) {
      console.error('Error processing action:', error);
      res.status(500).json({ error: 'Failed to process action.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
