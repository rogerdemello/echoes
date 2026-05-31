/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the Docker runtime image (node server.js).
  output: "standalone",
  experimental: {
    // Keep ffmpeg-static + fluent-ffmpeg as Node externals so the bundled
    // ffmpeg.exe binary path stays valid at runtime (otherwise Next rewrites
    // the path into .next/server/vendor-chunks where the binary isn't copied).
    serverComponentsExternalPackages: ["ffmpeg-static", "fluent-ffmpeg"],
    // Rewrite heavy barrel imports to direct paths so dev compiles far fewer
    // modules (lucide-react + drei otherwise pull thousands of icon/helper files).
    optimizePackageImports: ["lucide-react", "framer-motion", "@react-three/drei"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        // Don't recompile when the app writes generated audio/JSON into data/.
        // That write-triggered rebuild loop was the main dev slowdown.
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/data/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
