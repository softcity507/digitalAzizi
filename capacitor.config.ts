import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitalazizi.app',
  appName: 'DigitalAzizi',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;