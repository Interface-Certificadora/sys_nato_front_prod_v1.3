/**
 * Permissões do usuário (gravadas em user.role).
 * Fonte única para a tela de permissões e para as actions de criar/editar.
 */
export type Permissao = {
  /** Chave gravada em user.role e conferida pelo sistema */
  chave: string;
  label: string;
  categoria: CategoriaPermissao;
};

export const CATEGORIAS_PERMISSAO = [
  "Administração",
  "Cadastros",
  "Solicitações",
  "Atendimento",
  "NatoSign e NatoDoc",
] as const;

export type CategoriaPermissao = (typeof CATEGORIAS_PERMISSAO)[number];

export const PERMISSOES: Permissao[] = [
  {
    chave: "adm",
    label: "Acesso ao painel administrativo",
    categoria: "Administração",
  },
  { chave: "user", label: "Pode criar Usuário", categoria: "Administração" },
  {
    chave: "relatorio",
    label: "Acesso ao relatório",
    categoria: "Administração",
  },

  { chave: "financeiro", label: "Pode criar CCA", categoria: "Cadastros" },
  {
    chave: "construtora",
    label: "Pode criar Construtora",
    categoria: "Cadastros",
  },
  {
    chave: "empreendimento",
    label: "Pode criar Empreendimento",
    categoria: "Cadastros",
  },

  {
    chave: "solicitacao",
    label: "Pode editar Solicitação",
    categoria: "Solicitações",
  },
  { chave: "now", label: "Pode criar Now", categoria: "Solicitações" },
  {
    chave: "direto",
    label: "Acesso ao Nato Direto",
    categoria: "Solicitações",
  },
  {
    chave: "agente_registro",
    label: "Agente de Registro",
    categoria: "Solicitações",
  },

  {
    chave: "alert",
    label: "Pode criar e responder Alerta",
    categoria: "Atendimento",
  },
  {
    chave: "chamado",
    label: "Pode ver e responder Chamado",
    categoria: "Atendimento",
  },
  { chave: "chat", label: "Pode atender o Chat", categoria: "Atendimento" },

  {
    chave: "natosign",
    label: "Pode criar NatoSign",
    categoria: "NatoSign e NatoDoc",
  },
  {
    chave: "natosign_cancelar",
    label: "Pode cancelar envelopes",
    categoria: "NatoSign e NatoDoc",
  },
  {
    chave: "natodoc",
    label: "Acesso ao NatoDoc (imobiliária)",
    categoria: "NatoSign e NatoDoc",
  },
];

/**
 * Nome do checkbox no formulário. Tem prefixo porque o formulário de
 * usuário já usa "construtora" e "empreendimento" para as listas de IDs.
 */
export const campoPermissao = (chave: string) => `perm_${chave}`;

/** Monta o objeto role a partir dos checkboxes do formulário */
export function roleDoFormulario(data: FormData): Record<string, boolean> {
  return Object.fromEntries(
    PERMISSOES.map((p) => [p.chave, !!data.get(campoPermissao(p.chave))])
  );
}
