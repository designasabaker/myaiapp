/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.auth0.com','lh3.googleusercontent.com'],
  }
}

module.exports = nextConfig
