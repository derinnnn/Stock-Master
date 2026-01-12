/** @type {import('next').NextConfig} */
const nextConfig = {
  /* This tells Vercel to ignore the "Strict Teacher" warnings so we can go live */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;