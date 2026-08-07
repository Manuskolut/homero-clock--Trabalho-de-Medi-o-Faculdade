import { getOptionalSession } from "@/lib/dal";
import { HeaderNav } from "@/components/header-nav";

export default async function Header() {
  const session = await getOptionalSession();
  return <HeaderNav session={session} />;
}
