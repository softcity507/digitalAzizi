import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isMobileBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile';

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export in mobile builds
  },
  output: isMobileBuild ? 'export' : (process.env.VERCEL ? undefined : 'standalone'),
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);