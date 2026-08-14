import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Fallback para fotos de peça enviadas em runtime: o Next.js só serve
// arquivos de public/ que já existiam no momento do `next build` — uploads
// feitos depois (o caso normal aqui, já que a foto é salva em produção)
// caem no roteador do app, que resolve pra cá em vez de 404.
const EXTENSAO_TIPO: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const PASTA_UPLOADS_PECAS = path.join(process.cwd(), "public", "uploads", "pecas");

export async function GET(_request: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;

  if (!/^[\w-]+\.[a-z]+$/i.test(arquivo)) {
    return new NextResponse(null, { status: 404 });
  }
  const extensao = arquivo.split(".").pop()?.toLowerCase() ?? "";
  const tipo = EXTENSAO_TIPO[extensao];
  if (!tipo) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(PASTA_UPLOADS_PECAS, arquivo));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": tipo,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
