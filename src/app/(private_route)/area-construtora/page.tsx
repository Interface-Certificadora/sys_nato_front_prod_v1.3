export const dynamic = "force-dynamic";

import { GetSessionServer } from "@/lib/auth_confg";
import { redirect } from "next/navigation";
import AreaConstrutoraClient from "@/components/area-construtora/AreaConstrutoraClient";

/**
 * Área restrita da construtora: indicadores e relatórios de movimentação.
 * CONST vê só as suas construtoras; ADM escolhe qualquer uma.
 */
export default async function AreaConstrutoraPage() {
  const session = await GetSessionServer();
  const hierarquia = session?.user?.hierarquia;
  if (hierarquia !== "ADM" && hierarquia !== "CONST") {
    redirect("/home");
  }
  return <AreaConstrutoraClient isAdm={hierarquia === "ADM"} />;
}
