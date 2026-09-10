import { PrismaClient, TipoUsuario } from "@prisma/client";
import { hashSenha } from "../src/lib/hash";

const prisma = new PrismaClient();

function requireEnv(nome: string): string {
  const valor = process.env[nome];
  if (!valor || valor.trim() === "") {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${nome}. Preencha o .env antes de rodar o seed (veja .env.example).`
    );
  }
  return valor;
}

const LOJAS = [
  { id: "mueller", nome: "Mueller", telefone: "(41) 99685-0427" },
  { id: "jockey", nome: "Jockey", telefone: "(41) 99245-4077" },
  { id: "patio-batel", nome: "Pátio Batel", telefone: "(41) 99757-0036" },
];

async function main() {
  for (const loja of LOJAS) {
    await prisma.loja.upsert({
      where: { id: loja.id },
      update: { nome: loja.nome, telefone: loja.telefone },
      create: loja,
    });
  }

  const contas: {
    email: string;
    senha: string;
    nome: string;
    tipo: TipoUsuario;
    lojaId: string | null;
  }[] = [
    {
      email: requireEnv("SEED_ADMIN_EMAIL"),
      senha: requireEnv("SEED_ADMIN_SENHA"),
      nome: "Administrador",
      tipo: "ADMIN",
      lojaId: null,
    },
    {
      email: requireEnv("SEED_LOJA_MUELLER_EMAIL"),
      senha: requireEnv("SEED_LOJA_MUELLER_SENHA"),
      nome: "Mueller",
      tipo: "LOJA",
      lojaId: "mueller",
    },
    {
      email: requireEnv("SEED_LOJA_JOCKEY_EMAIL"),
      senha: requireEnv("SEED_LOJA_JOCKEY_SENHA"),
      nome: "Jockey",
      tipo: "LOJA",
      lojaId: "jockey",
    },
    {
      email: requireEnv("SEED_LOJA_PATIO_BATEL_EMAIL"),
      senha: requireEnv("SEED_LOJA_PATIO_BATEL_SENHA"),
      nome: "Pátio Batel",
      tipo: "LOJA",
      lojaId: "patio-batel",
    },
  ];

  for (const conta of contas) {
    const senhaHash = await hashSenha(conta.senha);
    await prisma.usuario.upsert({
      where: { email: conta.email },
      update: {
        senhaHash,
        nome: conta.nome,
        tipo: conta.tipo,
        lojaId: conta.lojaId,
        ativo: true,
      },
      create: {
        email: conta.email,
        senhaHash,
        nome: conta.nome,
        tipo: conta.tipo,
        lojaId: conta.lojaId,
      },
    });
  }

  console.log(`Seed concluído: ${LOJAS.length} lojas, ${contas.length} contas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
