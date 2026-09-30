import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://calcsolver.info',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
