/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com'], // Add any other domains you expect images from
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
  // Modify this section for debugging
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom function to handle BigInt serialization
    const customStringify = (obj) => {
      return JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
    };
    
    console.log('Webpack config:', customStringify(config));
    return config;
  },
}

console.log('Next.js config:', JSON.stringify(nextConfig, null, 2));

module.exports = nextConfig