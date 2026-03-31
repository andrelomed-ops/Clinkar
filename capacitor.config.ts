import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starterkar.app',
  appName: 'StarterKar',
  webDir: 'public',
  server: {
    url: 'https://clinkar.vercel.app',
    cleartext: true
  }
};

export default config;
