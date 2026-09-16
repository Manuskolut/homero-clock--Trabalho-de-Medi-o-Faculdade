import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Evita Server Actions "orfãs": sem isso, uma aba aberta antes de um deploy
// continua chamando actions com o ID do build antigo e falha em silêncio
// (ver investigação do bug "Cadastrar Peça não funciona", set/2026). Com o
// deploymentId, o Next detecta a divergência e força reload automático.
function getDeploymentId(): string | undefined {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  deploymentId: getDeploymentId(),
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
