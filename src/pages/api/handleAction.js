import fetchRSS from '../../utils/fetchRSS';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { untrustedData } = req.body;
      const buttonIndex = untrustedData?.buttonIndex;
      const inputText = untrustedData?.inputText;

      let category = 'top';
      let storyIndex = 0;

      if (inputText) {
        const [storedCategory, storedIndex] = inputText.split(':');
        category = storedCategory || 'top';
        storyIndex = parseInt(storedIndex) || 0;
      } else if (buttonIndex) {
        const categories = ['top', 'world', 'us', 'biz'];
        category = categories[buttonIndex - 1] || 'top';
      }

      const rssData = await fetchRSS(category);

      if (!rssData || rssData.length === 0) {
        throw new Error('No RSS data available');
      }

      const currentStory = rssData[storyIndex];

      if (!currentStory || !currentStory.title || !currentStory.url) {
        throw new Error('Invalid story data');
      }

      const imageUrl = `${encodeURI(currentStory.imageUrl)}&t=${Date.now()}`;
      const articleUrl = currentStory.url;

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: imageUrl,
            buttons: [
              { label: 'Next', action: 'post', target: `${category}:${(storyIndex + 1) % rssData.length}` },
              { label: 'Back', action: 'post', target: `${category}:${(storyIndex - 1 + rssData.length) % rssData.length}` },
              { label: 'Read', action: 'link', target: articleUrl },
              { label: 'Home', action: 'post' }
            ],
            title: currentStory.title,
            inputText: `${category}:${storyIndex}`
          }
        ]
      });
    } catch (error) {
      console.error('Error processing action:', error);
      console.error('Error details:', error);
      console.error('Current story:', currentStory);
      console.error('Category:', category);
      console.error('Story index:', storyIndex);

      const errorMessage = encodeURIComponent(`Error: ${error.message}`);
      const errorImageUrl = `https://via.placeholder.com/1200x628.png?text=${errorMessage}`;

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: errorImageUrl,
            buttons: [
              { label: 'Home', action: 'post' }
            ],
            title: 'Error Occurred'
          }
        ]
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}