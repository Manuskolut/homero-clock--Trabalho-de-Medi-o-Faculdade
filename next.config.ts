import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Padrão é 1MB. A foto de peça já é comprimida no navegador antes do
  // envio (ver src/lib/image-compress.ts), então isto é só uma margem de
  // segurança extra para o caso raro de a compressão não rodar.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
