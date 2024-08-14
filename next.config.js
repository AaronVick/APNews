/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com'], // Add any other domains you expect images from
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index',
      },
      {
        source: '/api/rss/:path*',
        destination: 'https://rsshub.app/:path*',
      },
    ]
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
  // Add this section to force IPv4
  serverRuntimeConfig: {
    // Will only be available on the server side
    NODE_OPTIONS: '--dns-result-order=ipv4first'
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
}

console.log('Next.js config:', JSON.stringify(nextConfig, null, 2));

module.exports = nextConfig