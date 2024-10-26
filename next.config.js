/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // להפצה סטטית
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
