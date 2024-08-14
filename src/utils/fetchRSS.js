import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const PLACEHOLDER_IMAGE_BASE = 'https://via.placeholder.com/1200x630.png?text=';

function createPlaceholderImage(text) {
  const encodedText = encodeURIComponent(text.slice(0, 100) + (text.length > 100 ? '...' : ''));
  return `${PLACEHOLDER_IMAGE_BASE}${encodedText}`;
}

export default async function fetchRSS(category) {
  const rssFeedUrl = {
    top: 'https://rsshub.app/apnews/topics/ap-top-news',
    world: 'https://rsshub.app/apnews/topics/ap-world-news',
    us: 'https://rsshub.app/apnews/topics/ap-us-news',
    biz: 'https://rsshub.app/apnews/topics/ap-business-news'
  }[category];

  if (!rssFeedUrl) {
    throw new Error(`Invalid category: ${category}`);
  }

  const { data } = await axios.get(rssFeedUrl);
  
  // Parse the RSS XML data
  const parsedData = await parseStringPromise(data);
  const items = parsedData.rss.channel[0].item;

  return items.map(item => ({
    title: item.title[0],
    url: item.link[0],
    imageUrl: createPlaceholderImage(item.title[0]) // Use the headline for the placeholder image
  }));
}
