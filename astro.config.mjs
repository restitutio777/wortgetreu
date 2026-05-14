import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

export default defineConfig({
  site: 'https://www.wortgetreu.com',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    sanity({
      projectId: 'vgln64hw',
      dataset: 'production',
      apiVersion: '2025-02-01',
      useCdn: true,
    }),
  ],
});
