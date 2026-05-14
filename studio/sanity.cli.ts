import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'qm02am13',
    dataset: 'production',
  },
  studioHost: 'wortgetreu-studio',
  autoUpdates: true,
});
