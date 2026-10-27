declare namespace Session {
  /**
   * AuthUser
   * @param {Financeira[]} Financeira
   * @param {number} id
   * @param {string} nome
   * @param {Construtora[]} construtora
   * @param {string} telefone
   * @param {Empreendimento[]} empreendimento
   * @param {"ADM" | "CCA" | "GRT" | "CONST" | "USER" | "IMOB"} hierarquia
   * @param {string} cargo
   * @param {UserRoler} role
   * @param {boolean} reset_password
   * @param {boolean} termos
   */
  interface AuthUser {
    Financeira: Financeira[];
    id: number;
    nome: string;
    construtora: Construtora[];
    telefone: string;
    empreendimento: Empreendimento[];
    hierarquia: "ADM" | "CCA" | "GRT" | "CONST" | "USER" | "IMOB";
    cargo: string;
    role: UserRoler;
    reset_password: boolean;
    termos: boolean;
    Imobiliaria?: Imobiliaria[];
  }

  /**
   * Imobiliaria
   * @param {number} id
   * @param {string} fantasia
   */
  interface Imobiliaria {
    id: number;
    fantasia: string;
  }

  /**
   * SessionServer
   * @param {string} token
   * @param {AuthUser} user
   * @param {number} iat
   * @param {number} exp
   */
  interface SessionServer {
    token: string;
    user: AuthUser;
    iat: number;
    exp: number;
  }

  /**
   * Construtora
   * @param {number} id
   * @param {string} fantasia
   */
  interface Construtora {
    id: number;
    fantasia: string;
  }

  /**
   * Empreendimento
   * @param {number} id
   * @param {string} nome
   */
  interface Empreendimento {
    id: number;
    nome: string;
    direto: boolean;
  }

  /**
   * Financeira
   * @param {number} id
   * @param {string} fantasia
   */
  interface Financeira {
    id: number;
    fantasia: string;
    direto: boolean;
    Intelesign_price: number;
    Intelesign_status: boolean;
    valor_cert: number;
  }

  /**
   * UserRoler
   * @param {boolean} adm
   * @param {boolean} now
   * @param {boolean} user
   * @param {boolean} alert
   * @param {boolean} direto
   * @param {boolean} chamado
   * @param {boolean} finaceiro
   * @param {boolean} construtora
   * @param {boolean} lista_const
   * @param {boolean} lista_empre
   * @param {boolean} solicitacao
   * @param {boolean} lista_finace
   * @param {boolean} empreendimento
   * @param {boolean} relatorio
   */
  interface UserRoler {
    adm?: boolean;
    now?: boolean;
    user?: boolean;
    alert?: boolean;
    direto?: boolean;
    chamado?: boolean;
    finaceiro?: boolean;
    construtora?: boolean;
    lista_const?: boolean;
    lista_empre?: boolean;
    solicitacao?: boolean;
    lista_finace?: boolean;
    empreendimento?: boolean;
    relatorio?: boolean;
    natosign?: boolean;
    natosign_cancelar?: boolean;
    agente_registro?: boolean;
    natodoc?: boolean;
    chat?: boolean;
  }
}

interface Construtora {
  id: number;
  fantasia: string;
}

interface Empreendimento {
  id: number;
  nome: string;
  direto: boolean;
}

/**
 * Financeira
 * @param {number} id
 * @param {string} fantasia
 */
interface Financeira {
  id: number;
  fantasia: string;
  direto: boolean;
  Intelesign_price: number;
  Intelesign_status: boolean;
  valor_cert: number;
}

interface UserRoler {
  adm?: boolean;
  now?: boolean;
  user?: boolean;
  alert?: boolean;
  direto?: boolean;
  chamado?: boolean;
  finaceiro?: boolean;
  construtora?: boolean;
  lista_const?: boolean;
  lista_empre?: boolean;
  solicitacao?: boolean;
  lista_finace?: boolean;
  empreendimento?: boolean;
  relatorio?: boolean;
  natosign?: boolean;
  natosign_cancelar?: boolean;
  agente_registro?: boolean;
  natodoc?: boolean;
  chat?: boolean;
}

interface AuthUser {
  Financeira: Financeira[];
  id: number;
  nome: string;
  construtora: Construtora[];
  telefone: string;
  empreendimento: Empreendimento[];
  hierarquia: "ADM" | "CCA" | "GRT" | "CONST" | "USER" | "IMOB";
  cargo: string;
  role: UserRoler;
  reset_password: boolean;
  termos: boolean;
  status?: boolean;
  Imobiliaria?: { id: number; fantasia: string }[];
}

// Tipagem retornada ao cliente (useSession)
export type SessionClient = AuthUser;

// Tipagem da carga completa do token no servidor
export interface SessionServer {
  token: string;
  user: AuthUser;
  iat: number;
  exp: number;
}
