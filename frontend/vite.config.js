import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          utils: ["axios", "framer-motion", "lucide-react"],
        },
      },
    },
    // Use esbuild for minification (built-in, no extra dependency)
    minify: "esbuild",
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "axios", "react-router-dom"],
  },
});
