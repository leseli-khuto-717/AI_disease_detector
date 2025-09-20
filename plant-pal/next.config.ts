import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    domains: ["zkxvqgavqaeldpetbixx.supabase.co"], // Add your Supabase bucket domain
  },
};

const withNextIntl = createNextIntlPlugin( './src/i18n/requests.ts');
export default withNextIntl(nextConfig);
