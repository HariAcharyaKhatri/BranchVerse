import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import fs from 'node:fs';
import path from 'node:path';

// Helper to reliably parse .env.local regardless of whether it uses dotenv or raw JS object snippet format
function getFirebaseDefines(): Record<string, string> {
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(localEnvPath)) return {};

  try {
    const content = fs.readFileSync(localEnvPath, 'utf8');
    const extract = (key: string): string => {
      const patterns = [
        new RegExp(`VITE_FIREBASE_${key.toUpperCase()}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'i'),
        new RegExp(`"${key}"\\s*:\\s*["']([^"']+)["']`, 'i'),
        new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`, 'i'),
        new RegExp(`${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'i')
      ];
      for (const p of patterns) {
        const m = content.match(p);
        if (m && m[1]) return m[1].trim();
      }
      return '';
    };

    const apiKey = extract('apiKey');
    const projectId = extract('projectId');
    if (!apiKey || !projectId) return {};

    const defines: Record<string, string> = {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(extract('authDomain') || `${projectId}.firebaseapp.com`),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(projectId),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(extract('storageBucket') || `${projectId}.firebasestorage.app`),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(extract('messagingSenderId')),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(extract('appId'))
    };

    return defines;
  } catch {
    return {};
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: getFirebaseDefines(),
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
