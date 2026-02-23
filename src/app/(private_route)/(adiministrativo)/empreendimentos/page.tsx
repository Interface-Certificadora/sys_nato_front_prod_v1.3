import EmpreendimentoPageClient from "@/components/empreendimentosClient/RenderComponent";
import { GetSessionServer } from "@/lib/auth_confg";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EmpreendimentoPage() {
  const session = await GetSessionServer();

  const req = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empreendimento/query?page=1&limit=12`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.token}`,
      },
      next: {
        revalidate: 60,
        tags: ["empreendimentos"],
      },
    }
  );

  if (!req.ok) {
    return (
      <EmpreendimentoPageClient
        dados={{
          data: [],
          meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
        }}
      />
    );
  }

  const data = await req.json();

  return (
    <>
      <EmpreendimentoPageClient dados={data} />
    </>
  );
}
