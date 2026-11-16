import { GetSessionServer } from "@/lib/auth_confg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Corrige o email de um signatário pendente (somente ADM) */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await GetSessionServer();
    if (!session?.token) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (session.user?.hierarquia !== "ADM") {
      return NextResponse.json(
        { message: "Somente administradores podem editar o email" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const signatarioId = Number(body?.signatarioId);
    if (!signatarioId) {
      return NextResponse.json(
        { message: "Signatário não informado" },
        { status: 400 }
      );
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/intelesign/${params.id}/signatario/${signatarioId}/email`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ email: body?.email }),
      }
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro ao editar email do signatário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
