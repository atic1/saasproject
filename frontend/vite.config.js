import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env variables from system and .env files
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE || 'http://localhost:5000';

  return {
    plugins: [
      react(),
      {
        name: 'replace-api-url',
        transform(code, id) {
          // Replace hardcoded localhost API calls with Vite environment URL at build time
          if (id.includes('src/') && (id.endsWith('.jsx') || id.endsWith('.js') || id.endsWith('.ts') || id.endsWith('.tsx'))) {
            return {
              code: code.replace(/http:\/\/localhost:5000/g, apiBase),
              map: null
            };
          }
        }
      }
    ],
    resolve: {
      tsconfigPaths: true
    }
  };
});