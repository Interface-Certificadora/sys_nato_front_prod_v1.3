"use server";

import { GetSessionServer } from "@/lib/auth_confg";

export async function getEmpreendimentosAction(filters: any) {
  const session = await GetSessionServer();

  const query = new URLSearchParams(filters);

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_STRAPI_API_URL
    }/empreendimento/query?${query.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Falha ao buscar empreendimentos");
  }

  return res.json();
}

export async function getEmpreendimentoFilterOptions() {
  const session = await GetSessionServer();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empreendimento/filters/options`,
    {
      headers: { Authorization: `Bearer ${session?.token}` },
    }
  );
  if (!res.ok) return { cidades: [], estados: [] };
  return res.json();
}
