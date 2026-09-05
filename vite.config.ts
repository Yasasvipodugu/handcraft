import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'dev-entry',
      apply: 'serve',
      transformIndexHtml(html) {
        return html
          .replace(
            /<script type="module" crossorigin src="\.\/assets\/[^"]+"><\/script>/,
            '<script type="module" src="/src/main.tsx"></script>'
          )
          .replace(/<link rel="stylesheet" crossorigin href="\.\/assets\/[^"]+">/, '');
      },
    },
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: false,
  },
});
