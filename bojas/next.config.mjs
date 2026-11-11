/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keeps the same URL shape as the reference site (/about/, /services/ ...).
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    // Mongoose must run as a normal Node package, not bundled.
    serverComponentsExternalPackages: ['mongoose'],
  },
  // The extra player forms were removed. Old links go to the one player form.
  async redirects() {
    return ['odpl-player-form', 'league-1-ontario', 'ligue-1-quebec'].map((slug) => ({
      source: `/${slug}`,
      destination: '/player-form/',
      permanent: true,
    }));
  },
};

export default nextConfig;
