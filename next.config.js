/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // remotePatterns is the Next 14 replacement for the deprecated `domains`.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
};

module.exports = nextConfig;
