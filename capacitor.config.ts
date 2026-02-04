import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clinkar.app',
  appName: 'Clinkar',
  webDir: 'public',
  server: {
    url: 'https://clinkar.vercel.app',
    cleartext: true
  }
};

export default config;
