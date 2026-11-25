import { GetSessionServer } from "@/lib/auth_confg";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Só estas rotas do backend passam pelo proxy
const PERMITIDAS = [
  /^construtoras$/,
  /^empreendimentos$/,
  /^indicadores$/,
  /^relatorio\/(certificacao|envelopes)\/(pdf|xlsx)$/,
];

/** Proxy da Área da Construtora (JSON e download de relatórios). */
export async function GET(
  request: NextRequest,
  { params }: { params: { rota: string[] } },
) {
  try {
    const session = await GetSessionServer();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }
    const rota = params.rota.join("/");
    if (!PERMITIDAS.some((r) => r.test(rota))) {
      return NextResponse.json({ message: "Rota inválida" }, { status: 404 });
    }

    const query = request.nextUrl.searchParams.toString();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/area-construtora/${rota}${query ? `?${query}` : ""}`,
      {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      },
    );

    const tipo = response.headers.get("content-type") ?? "";
    if (!response.ok || tipo.includes("application/json")) {
      const data = await response.json().catch(() => ({
        message: "Erro ao consultar a Área da Construtora",
      }));
      return NextResponse.json(data, { status: response.status });
    }

    // Arquivo de relatório (pdf/xlsx)
    const buffer = Buffer.from(await response.arrayBuffer());
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": tipo,
        "Content-Disposition":
          response.headers.get("content-disposition") ?? "attachment",
      },
    });
  } catch (error: any) {
    console.error("Erro no proxy da Área da Construtora:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
