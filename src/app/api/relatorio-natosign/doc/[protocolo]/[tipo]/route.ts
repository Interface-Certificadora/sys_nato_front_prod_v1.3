import { GetSessionServer } from "@/lib/auth_confg";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CONTENT_TYPE: Record<string, string> = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function GET(
  _request: Request,
  { params }: { params: { protocolo: string; tipo: string } }
) {
  try {
    const session = await GetSessionServer();
    if (!session) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 }
      );
    }
    const { protocolo, tipo } = params;
    if (!CONTENT_TYPE[tipo]) {
      return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/relatorio-natosign/download/${tipo}/${protocolo}`,
      { headers: { Authorization: `Bearer ${session.token}` } }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || `Erro ao gerar relatório ${tipo.toUpperCase()}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPE[tipo],
        "Content-Disposition":
          response.headers.get("content-disposition") ?? "attachment",
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
