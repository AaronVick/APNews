const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const sharp = require('sharp'); // Import sharp for image manipulation
const fs = require('fs');
const path = require('path');

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

        const articles = await Promise.all(parsedData.rss.channel[0].item.map(async (item) => {
            const title = item.title[0]; // Extract the full title
            const link = item.link[0];
            const description = item.description ? item.description[0] : '';
            const pubDate = item.pubDate[0];
            const author = item.author ? item.author[0] : '';

            // Fetch the article's image
            const imageUrl = await fetchArticleImage(link);

            // Generate an image with the title overlaid
            const finalImageUrl = await generateImageWithOverlay(imageUrl, title);

            return {
                title,
                link,
                description,
                pubDate,
                author,
                imageUrl: finalImageUrl, // Use the image with the overlay
            };
        }));

        console.log(`Articles extracted successfully for category: ${category}`);
        return { articles };
    } catch (error) {
        console.error(`Error fetching or parsing RSS feed for category: ${category}`, error);
        return { error: `Failed to fetch or parse RSS feed for category: ${category}` };
    }
}

// Function to fetch the article's HTML and extract the image
async function fetchArticleImage(link) {
    try {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);

        // Try to find the image from the og:image meta tag
        const imageUrl = $('meta[property="og:image"]').attr('content') || '';
        return imageUrl || ''; // Return the image URL or an empty string if not found
    } catch (error) {
        console.error(`Error fetching image from article link: ${link}`, error);
        return ''; // Return an empty string if there was an error
    }
}

// Function to generate an image with the title overlaid
async function generateImageWithOverlay(imageUrl, title) {
    try {
        // Fetch the image
        const imageResponse = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
        });

        // Load the image into Sharp
        const image = sharp(imageResponse.data);

        // Overlay the title text on the image
        const finalImage = await image
            .composite([
                {
                    input: Buffer.from(
                        `<svg width="1200" height="630">
                            <style>
                                .title { fill: white; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8); }
                            </style>
                            <text x="50%" y="50%" text-anchor="middle" class="title">${title}</text>
                        </svg>`
                    ),
                    gravity: 'south', // Position the text at the bottom
                },
            ])
            .toBuffer();

        // Save the image with overlay to a file or return the buffer directly
        const filePath = path.join(__dirname, 'output', `${Date.now()}-overlay.png`);
        fs.writeFileSync(filePath, finalImage);

        // Return the file path or the URL where the image can be accessed
        return `/output/${Date.now()}-overlay.png`; // Update this path as needed for your environment
    } catch (error) {
        console.error(`Error generating image with overlay: ${error.message}`);
        return ''; // Return an empty string if there was an error
    }
}

module.exports = fetchRSS;



/* const axios = require('axios');
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
