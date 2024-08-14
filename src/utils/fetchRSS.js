import axios from 'axios';

const rssUrls = {
    top: 'https://rsshub.app/apnews/topics/ap-top-news',
    world: 'https://rsshub.app/apnews/topics/ap-world-news',
    us: 'https://rsshub.app/apnews/topics/ap-us-news',
    biz: 'https://rsshub.app/apnews/topics/ap-business-news',
};

const parseRSS = async (url) => {
    const response = await axios.get(url);
    const parser = new DOMParser();
    const xml = parser.parseFromString(response.data, 'text/xml');
    const items = xml.querySelectorAll('item');
    const data = Array.from(items).map(item => ({
        title: item.querySelector('title').textContent,
        url: item.querySelector('link').textContent,
        imageUrl: item.querySelector('media\\:content')?.getAttribute('url') || '/default-placeholder.png',
    }));
    return data;
};

const fetchRSS = (category) => {
    return parseRSS(rssUrls[category]);
};

export default fetchRSS;
