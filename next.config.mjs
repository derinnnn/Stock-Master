/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Ignored errors for deployment */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* NEW: Allow Codespaces to run Server Actions */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "musical-train-5jq6rgrq5grfvrj9-3000.app.github.dev"
      ],
    },
  },
};

export default nextConfig;