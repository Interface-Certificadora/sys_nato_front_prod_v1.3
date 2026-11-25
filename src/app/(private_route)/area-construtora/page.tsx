export const dynamic = "force-dynamic";

import { GetSessionServer } from "@/lib/auth_confg";
import { redirect } from "next/navigation";
import AreaConstrutoraClient from "@/components/area-construtora/AreaConstrutoraClient";

/**
 * Área restrita da construtora: indicadores e relatórios de movimentação.
 * CONST com a permissão area_construtora vê só as suas; ADM escolhe qualquer uma.
 */
export default async function AreaConstrutoraPage() {
  const session = await GetSessionServer();
  const hierarquia = session?.user?.hierarquia;
  const permitido =
    hierarquia === "ADM" ||
    (hierarquia === "CONST" && !!session?.user?.role?.area_construtora);
  if (!permitido) {
    redirect("/home");
  }
  return <AreaConstrutoraClient isAdm={hierarquia === "ADM"} />;
}
