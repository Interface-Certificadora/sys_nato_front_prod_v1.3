import { GetSessionServer } from "@/lib/auth_confg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Confirma ou recusa um pedido de cancelamento (ADM responsável) */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await GetSessionServer();
    if (!session?.token) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const acao = body?.acao;
    if (acao !== "confirmar" && acao !== "recusar") {
      return NextResponse.json({ message: "Ação inválida" }, { status: 400 });
    }
    // A permissão é conferida no backend, direto do banco
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/intelesign/${params.id}/cancelamento/${acao}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      }
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro ao responder pedido de cancelamento:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
