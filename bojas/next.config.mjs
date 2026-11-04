/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keeps the same URL shape as the reference site (/about/, /services/ ...).
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    // Mongoose must run as a normal Node package, not bundled.
    serverComponentsExternalPackages: ['mongoose'],
  },
};

export default nextConfig;
