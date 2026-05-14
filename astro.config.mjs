import { defineConfig } from 'astro/config';
import remarkBreaks from 'remark-breaks';

export default defineConfig({
  site: 'https://www.wortgetreu.com',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  markdown: {
    remarkPlugins: [remarkBreaks],
    smartypants: true,
  },
});
