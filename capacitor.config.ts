import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitalazizi.app',
  appName: 'DigitalAzizi',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'www.digitalazizi.com',
  },
};

export default config;
