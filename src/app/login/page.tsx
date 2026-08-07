import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/dal";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-heading tracking-wide uppercase font-semibold text-gold">
            Homero Clock
          </h1>
          <p className="text-sm text-gray mt-1">Entre com a conta da sua loja</p>
        </div>
        <LoginForm />
      </Card>
    </div>
  );
}
