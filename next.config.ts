import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/signup",
        destination: "http://127.0.0.1:8000/api/signup",
      },
      {
        source: "/api/verify",
        destination: "http://127.0.0.1:8000/api/verify",
      },
      {
        source: "/api/profile",
        destination: "http://127.0.0.1:8000/api/profile",
      },
      {
        source: "/api/logout",
        destination: "http://127.0.0.1:8000/api/logout",
      },
      {
        source: "/api/forgot-password",
        destination: "http://127.0.0.1:8000/api/forgot-password",
      },
      {
        source: "/api/reset-password",
        destination: "http://127.0.0.1:8000/api/reset-password",
      },
    ];
  },
};

export default nextConfig;
