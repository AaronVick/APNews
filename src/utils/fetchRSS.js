import axios from 'axios';

const rssUrls = {
    top: '/api/rss/apnews/topics/ap-top-news',
    world: '/api/rss/apnews/topics/ap-world-news',
    us: '/api/rss/apnews/topics/ap-us-news',
    biz: '/api/rss/apnews/topics/ap-business-news',
};

const DEFAULT_IMAGE = '/default-placeholder.png';

const parseRSS = async (url) => {
    console.log('Fetching RSS from:', url);
    try {
        const response = await axios.get(url);
        console.log('RSS response received');
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');
        const items = xml.querySelectorAll('item');
        const data = Array.from(items).map(item => ({
            title: item.querySelector('title')?.textContent || 'No title',
            url: item.querySelector('link')?.textContent || '#',
            imageUrl: item.querySelector('media\\:content')?.getAttribute('url') || DEFAULT_IMAGE,
        }));
        console.log('Parsed RSS data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching or parsing RSS:', error);
        throw error;
    }
};

const fetchRSS = async (category) => {
    console.log('Fetching RSS for category:', category);
    try {
        const url = rssUrls[category];
        if (!url) {
            throw new Error(`Invalid category: ${category}`);
        }
        return await parseRSS(url);
    } catch (error) {
        console.error('Error in fetchRSS:', error);
        throw error;
    }
};

export default fetchRSS;