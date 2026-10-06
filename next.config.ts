import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    trailingSlash: true,
    output: process.env.VERCEL ? undefined : 'standalone'
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);