import fetchRSS from '../../utils/fetchRSS';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received POST request:', req.body);

      const { untrustedData } = req.body;
      if (!untrustedData) {
        console.error('No untrustedData in the request body');
        throw new Error('Missing untrustedData');
      }

      const buttonIndex = untrustedData?.buttonIndex;
      const inputText = untrustedData?.inputText;
      console.log('Button index:', buttonIndex);
      console.log('Input text:', inputText);

      let category = 'top';
      let storyIndex = 0;

      if (inputText) {
        const [storedCategory, storedIndex] = inputText.split(':');
        category = storedCategory.toLowerCase().replace(/\s+/g, '-') || 'top';
        storyIndex = parseInt(storedIndex) || 0;
        console.log('Parsed category and story index from input text:', category, storyIndex);
      } else if (buttonIndex) {
        const categories = ['top', 'world', 'tech', 'biz'];
        category = categories[buttonIndex - 1] || 'top';
        console.log('Selected category based on button index:', category);
      }

      console.log('Fetching RSS data for category:', category);
      const rssData = await fetchRSS(category);

      if (!rssData || rssData.length === 0) {
        console.error('No RSS data available for category:', category);
        throw new Error(`Invalid category: ${category}`);
      }

      console.log('Fetched RSS data:', rssData);

      const currentStory = rssData[storyIndex];

      if (!currentStory || !currentStory.title || !currentStory.url) {
        console.error('Invalid story data:', currentStory);
        throw new Error('Invalid story data');
      }

      console.log('Current story:', currentStory);

      // Ensure the base URL is correctly prefixed
      const imageUrl = currentStory.imageUrl ? currentStory.imageUrl : `https://via.placeholder.com/1200x628.png?text=${encodeURIComponent(currentStory.title)}`;
      const articleUrl = currentStory.url;

      console.log('Constructed image URL:', imageUrl);
      console.log('Constructed article URL:', articleUrl);

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

      const errorMessage = encodeURIComponent(`Error: ${error.message}`);
      const errorImageUrl = `https://via.placeholder.com/1200x630.png?text=${errorMessage}`;

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: errorImageUrl,
            buttons: [
              { label: 'Home', action: 'post' }
            ],
            title: 'Error Occurred',
            error: error.message,
          }
        ]
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    console.error(`Method ${req.method} Not Allowed`);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
