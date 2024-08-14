import fetchRSS from '../../utils/fetchRSS';

const MAX_STORIES = 10;
const PLACEHOLDER_IMAGE_BASE = 'https://placehold.co/1200x630/png?text=';

function validateUrl(url) {
  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error('Invalid URL:', url, error.message);
    return null;
  }
}

function createPlaceholderImage(title) {
  const encodedTitle = encodeURIComponent(title.slice(0, 50) + (title.length > 50 ? '...' : ''));
  return `${PLACEHOLDER_IMAGE_BASE}${encodedTitle}`;
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

      const stories = rssData.slice(0, MAX_STORIES).map((item, index) => ({
        ...item,
        index: index
      }));

      console.log(`Fetched ${stories.length} stories`);

      const currentStory = stories[0]; // Start with the first story
      const headline = currentStory.title;
      const thumbnailUrl = validateUrl(currentStory.imageUrl);
      const articleUrl = validateUrl(currentStory.url);

      console.log('Current story data:', { headline, thumbnailUrl, articleUrl });

      const imageUrl = thumbnailUrl || createPlaceholderImage(headline);

      res.status(200).json({
        frames: [
          {
            version: 'vNext',
            image: imageUrl,
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
            image: createPlaceholderImage('Error: Failed to load news'),
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