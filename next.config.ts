import type { NextConfig } from "next";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://medai-backend:8000";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
