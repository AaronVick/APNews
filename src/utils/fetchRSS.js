const axios = require('axios');
const xml2js = require('xml2js');

async function fetchRSS(category) {
    const categoryUrls = {
        'top': 'http://rsshub.app/apnews/topics/ap-top-news',
        'world': 'http://rsshub.app/apnews/topics/ap-world-news',
        'tech': 'http://rsshub.app/apnews/topics/ap-technology-news',
        'business': 'http://rsshub.app/apnews/topics/ap-business-news',
    };

    const url = categoryUrls[category];
    
    if (!url) {
        console.error(`Error: Invalid category provided: ${category}`);
        return { error: `Invalid category: ${category}` };
    }

    console.log(`Fetching RSS feed for category: ${category} from URL: ${url}`);

    try {
        const response = await axios.get(url);
        console.log(`RSS feed fetched successfully for category: ${category}`);

        const parsedData = await xml2js.parseStringPromise(response.data, { mergeAttrs: true });
        console.log(`RSS feed parsed successfully for category: ${category}`);

        const articles = parsedData.rss.channel[0].item.map(item => ({
            title: item.title[0],
            link: item.link[0],
            description: item.description ? item.description[0] : '',
            pubDate: item.pubDate[0],
            author: item.author ? item.author[0] : '',
        }));

        console.log(`Articles extracted successfully for category: ${category}`);
        return { articles };
    } catch (error) {
        console.error(`Error fetching or parsing RSS feed for category: ${category}`, error);
        return { error: `Failed to fetch or parse RSS feed for category: ${category}` };
    }
}

module.exports = fetchRSS;