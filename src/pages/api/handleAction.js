import fetchRSS from '../../utils/fetchRSS';

const MAX_STORIES = 10;
const PLACEHOLDER_IMAGE_BASE = 'https://placehold.co/1200x630/png?text=';

function createPlaceholderImage(text) {
  const encodedText = encodeURIComponent(text.slice(0, 100) + (text.length > 100 ? '...' : ''));
  return `${PLACEHOLDER_IMAGE_BASE}${encodedText}`;
}

export default async function handler(req, res) {
  console.log('Received request:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { untrustedData } = req.body;
    const buttonIndex = untrustedData?.buttonIndex;
    const inputText = untrustedData?.inputText;

    console.log('Button index:', buttonIndex, 'Input text:', inputText);

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

    console.log('Selected category:', category, 'Story index:', storyIndex);

    const rssData = await fetchRSS(category);
    console.log('RSS Data length:', rssData.length);

    if (!rssData || rssData.length === 0) {
      throw new Error('No RSS data available');
    }

    const stories = rssData.slice(0, MAX_STORIES);
    const currentStory = stories[storyIndex];

    console.log('Current story:', JSON.stringify(currentStory, null, 2));

    if (!currentStory || !currentStory.title || !currentStory.url) {
      throw new Error('Invalid story data');
    }

    const imageUrl = currentStory.imageUrl || createPlaceholderImage(currentStory.title);

    const nextIndex = (storyIndex + 1) % stories.length;
    const prevIndex = (storyIndex - 1 + stories.length) % stories.length;

    res.status(200).json({
      frames: [
        {
          version: 'vNext',
          image: imageUrl,
          buttons: [
            { label: 'Next', action: 'post', target: `${category}:${nextIndex}` },
            { label: 'Back', action: 'post', target: `${category}:${prevIndex}` },
            { label: 'Read', action: 'link', target: currentStory.url },
            { label: 'Home', action: 'post' }
          ],
          title: currentStory.title,
          inputText: `${category}:${storyIndex}`
        }
      ]
    });
  } catch (error) {
    console.error('Error processing action:', error);
    const errorMessage = `Error: ${error.message}\n\nStack: ${error.stack}`;
    res.status(200).json({
      frames: [
        {
          version: 'vNext',
          image: createPlaceholderImage(errorMessage),
          buttons: [
            { label: 'Home', action: 'post' }
          ],
          title: 'Error Occurred'
        }
      ]
    });
  }
}