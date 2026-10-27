"use server";

import { roleDoFormulario } from "@/data/permissoes";
import { GetSessionServer } from "@/lib/auth_confg";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

// Função responsável por criar um novo usuário a partir dos dados do formulário
export default async function UserCreate(_: any, data: FormData) {
  // Extração dos campos do formulário
  const cpf = data.get("cpf") as string;
  const nome = data.get("nome") as string;
  const username = data.get("usuario") as string;
  const telefone = data.get("telefone") as string;
  const telefoneFormat = telefone ? telefone.replace(/\D/g, "") : "";
  const email = data.get("email") as string;
  const construtora = data.get("construtora") as any;
  const empreendimento = data.get("empreendimento") as any;
  const Financeira = data.get("financeira") as any;

  const construtoraArray = construtora
    ? construtora.split(",").map(Number)
    : [];
  const empreendimentoArray = empreendimento
    ? empreendimento.split(",").map(Number)
    : [];
  const FinanceiraArray = Financeira ? Financeira.split(",").map(Number) : [];
  const imobiliaria = data.get("imobiliaria") as string | null;
  const imobiliariaArray = imobiliaria
    ? imobiliaria.split(",").map(Number).filter((id) => id > 0)
    : [];

  const Cargo = data.get("cargo") as string;
  const hierarquia = data.get("hierarquia") as string;
  const password = data.get("senha") as string;
  const passwordConfir = data.get("confirsenha") as string;

  // Permissões marcadas no formulário, já com as chaves usadas no role
  const permissoes = roleDoFormulario(data);

  // Busca a sessão do usuário logado
  const session = await GetSessionServer();
  if (!session) {
    return {
      error: true,
      message: "Usuário não autorizado.",
      id: undefined,
    };
  }

  // Monta o corpo da requisição
  const body = {
    nome: nome.trim(),
    username: username.trim(),
    password: password.trim(),
    telefone: telefoneFormat,
    email: email.trim(),
    cpf: cpf.trim(),
    cargo: Cargo,
    construtora: construtoraArray,
    empreendimento: empreendimentoArray,
    hierarquia: hierarquia,
    Financeira: FinanceiraArray,
    imobiliaria: imobiliariaArray,
    passwordConfir: passwordConfir,
    role: permissoes,
  };

  // Faz a requisição para a API
  const req = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.token}`,
    },
    body: JSON.stringify(body),
  });

  const res = await req.json();

  // Se a requisição falhar, retorna erro padronizado
  if (!req.ok) {
    return {
      error: true,
      message: res.message || "Erro ao cadastrar usuário.",
      id: undefined,
    };
  }
  revalidateTag("user-get");
  revalidateTag("user-role");
  revalidateTag("usuarios_list");
  revalidateTag("Usuarios-list-page");
  revalidateTag("usuarios-list-page");

  redirect(`/usuarios`);
}
