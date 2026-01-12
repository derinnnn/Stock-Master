/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        // This allows your specific Codespace to run Server Actions
        'musical-train-5jq6rgrq5grfvrj9-3000.app.github.dev', 
      ],
    },
  },
};

export default nextConfig;