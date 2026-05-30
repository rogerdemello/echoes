/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the Docker runtime image (node server.js).
  output: "standalone",
  experimental: {
    // Keep ffmpeg-static + fluent-ffmpeg as Node externals so the bundled
    // ffmpeg.exe binary path stays valid at runtime (otherwise Next rewrites
    // the path into .next/server/vendor-chunks where the binary isn't copied).
    serverComponentsExternalPackages: ["ffmpeg-static", "fluent-ffmpeg"],
  },
  // Helps dev on Windows paths (especially folders with spaces)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
