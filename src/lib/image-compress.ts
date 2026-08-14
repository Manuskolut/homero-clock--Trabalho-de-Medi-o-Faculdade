// Comprime/redimensiona uma foto no navegador antes do upload — fotos de
// câmera de celular costumam vir com vários MB, o que estoura o limite de
// tamanho de Server Actions e derruba a requisição no meio do envio (rede
// móvel lenta = conexão cai antes do corpo terminar de subir).
const FOTO_LARGURA_MAX = 1200;
const FOTO_QUALIDADE_JPEG = 0.8;

type ImagemDecodificada = {
  largura: number;
  altura: number;
  desenhavel: CanvasImageSource;
  liberar: () => void;
};

async function decodificarImagem(file: File): Promise<ImagemDecodificada> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      largura: bitmap.width,
      altura: bitmap.height,
      desenhavel: bitmap,
      liberar: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return {
      largura: img.naturalWidth,
      altura: img.naturalHeight,
      desenhavel: img,
      liberar: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

// Devolve o próprio arquivo (sem erro) sempre que não for possível comprimir
// — o formulário ainda valida o tamanho final antes de enviar.
export async function comprimirFotoPeca(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  let imagem: ImagemDecodificada;
  try {
    imagem = await decodificarImagem(file);
  } catch {
    return file;
  }

  try {
    const escala = Math.min(1, FOTO_LARGURA_MAX / imagem.largura);
    const largura = Math.round(imagem.largura * escala);
    const altura = Math.round(imagem.altura * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(imagem.desenhavel, 0, 0, largura, altura);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", FOTO_QUALIDADE_JPEG)
    );
    if (!blob || blob.size >= file.size) return file;

    const nome = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nome, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    imagem.liberar();
  }
}
