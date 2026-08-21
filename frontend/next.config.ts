import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera build standalone para uma imagem Docker de producao enxuta.
  output: "standalone",
};

export default nextConfig;
