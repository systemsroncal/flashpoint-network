import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
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
  images: {
    remotePatterns: [
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
