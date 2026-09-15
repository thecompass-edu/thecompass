import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cnaksqlmtvrfqimlwbdi.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;