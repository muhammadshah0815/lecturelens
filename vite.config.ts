import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build also works from a subfolder, e.g. GitHub Pages at /lecturelens/.
  base: './',
});
