import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const config: NextConfig = {
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.gravatar.com" },
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "http", hostname: "localhost", port: "3000" },
    ],
  },
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(config);
