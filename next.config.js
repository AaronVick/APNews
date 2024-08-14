/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'storage.googleapis.com',
      'rsshub.app',
      'apnews.com',
      'ap-news.vercel.app', // Add your Vercel domain here
    ],
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
}

console.log('Next.js config:', JSON.stringify(nextConfig, null, 2));

module.exports = nextConfig;