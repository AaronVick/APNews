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
  // Add this section for debugging
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    console.log('Webpack config:', JSON.stringify(config, null, 2));
    return config;
  },
}

console.log('Next.js config:', JSON.stringify(nextConfig, null, 2));

module.exports = nextConfig