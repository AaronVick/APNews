import axios from 'axios';
import { parseString } from 'xml2js';

const rssUrls = {
    top: 'https://rsshub.app/apnews/topics/ap-top-news',
    world: 'https://rsshub.app/apnews/topics/ap-world-news',
    us: 'https://rsshub.app/apnews/topics/ap-us-news',
    biz: 'https://rsshub.app/apnews/topics/ap-business-news',
};

const DEFAULT_IMAGE = 'https://ap-news.vercel.app/default-placeholder.png';

const parseRSS = async (url) => {
    try {
        const response = await axios.get(url);
        return new Promise((resolve, reject) => {
            parseString(response.data, (err, result) => {
                if (err) reject(err);
                else {
                    const items = result.rss.channel[0].item;
                    const data = items.map(item => ({
                        title: item.title[0],
                        url: item.link[0],
                        imageUrl: item['media:content'] ? item['media:content'][0].$.url : DEFAULT_IMAGE,
                    }));
                    resolve(data);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching or parsing RSS:', error);
        return [];
    }
};

const fetchRSS = async (category) => {
    const url = rssUrls[category.toLowerCase()];
    if (!url) {
        throw new Error(`Invalid category: ${category}`);
    }
    return await parseRSS(url);
};

export default fetchRSS;