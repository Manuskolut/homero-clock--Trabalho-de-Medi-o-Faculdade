import fs from "fs";
import path from "path";
import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/dal";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";

const LOGO_PATH = "/logohomeroclock.png";

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  const logoExiste = fs.existsSync(path.join(process.cwd(), "public", "logohomeroclock.png"));

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#f2f2f2]" aria-hidden="true" />
      <div className="flex-1 flex flex-col items-center justify-center">
        <Card className="!bg-white w-full max-w-md p-10">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            {logoExiste ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={LOGO_PATH}
                alt="Homero Clock Relojóias"
                className="h-24 w-auto object-contain"
              />
            ) : (
              <div className="h-24 w-64 flex flex-col items-center justify-center rounded-lg border border-dashed border-gold-light/60 text-xs text-gray-light leading-snug px-3">
                <span>Logo da loja</span>
                <span className="font-mono">(public/logohomeroclock.png)</span>
              </div>
            )}
            <p className="text-sm text-gray">Entre com a conta da sua loja</p>
          </div>
          <LoginForm />
        </Card>
      </div>
    </>
  );
}
