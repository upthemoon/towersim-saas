import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // /simulator Route Handler が private/simulator.html を fs.readFile で読むため、
  // Vercel Serverless にこのファイルを同梱する。
  outputFileTracingIncludes: {
    "/simulator": [path.join("private", "simulator.html")],
  },
};

export default nextConfig;
