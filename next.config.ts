import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desliga auto-geração de arquivos de agent rules no `next dev`
  agentRules: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
