import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Admin image uploads can exceed the default 1MB Server Action cap.
  // Keep in sync with MAX_BYTES in lib/admin/upload-core.ts (10MB + multipart overhead).
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
      allowedOrigins: ["fptn.com", "www.fptn.com"],
    },
  },
  async redirects() {
    return [
      {
        source: "/ministry-programs",
        destination: "/network-programs",
        permanent: true,
      },
      {
        source: "/ministry-programs/:slug*",
        destination: "/network-programs/:slug*",
        permanent: true,
      },
      {
        source: "/admin/ministry-programs",
        destination: "/admin/network-programs",
        permanent: true,
      },
      {
        source: "/admin/ministry-programs/:path*",
        destination: "/admin/network-programs/:path*",
        permanent: true,
      },
    ];
  },
  // Route /uploads through the Node handler so OLS static docroots cannot 404
  // before the request reaches Next (files still live under public/uploads).
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/media/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fptn.com",
      },
      {
        protocol: "https",
        hostname: "www.fptn.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "znvqeloyubrbwaaxuddu.supabase.co",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
