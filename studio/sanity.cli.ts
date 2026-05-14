import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'vgln64hw',
    dataset: 'production',
  },
  studioHost: 'wortgetreu-studio',
  autoUpdates: true,
});
