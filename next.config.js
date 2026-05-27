// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Recharts uses browser APIs — mark as client bundle only
  transpilePackages: ["recharts"],
};

module.exports = nextConfig;
