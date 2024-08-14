/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['storage.googleapis.com'], // Add any other domains you expect images from
    },
  }
  
  module.exports = nextConfig