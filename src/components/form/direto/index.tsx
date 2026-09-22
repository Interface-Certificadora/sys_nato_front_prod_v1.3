"use client";
import { BtCreateAlertCliente } from "@/components/botoes/bt_create_alert_cliente";
import BtnDevolucao from "@/components/botoes/bt_devolucao";
import BtRemoverDistrato from "@/components/botoes/bt_Remover_Distrato";
import BotaoSisapp from "@/components/botoes/bt_sisapp";
import BtnIniciarAtendimento from "@/components/botoes/btn_iniciar_atendimento";
import BtnLimparFcw from "@/components/botoes/btn_lipar_fcw";
import BotaoPausar from "@/components/botoes/btn_pausar";
import { CriarFcweb } from "@/components/botoes/criarFcweb";
import BoxBasic from "@/components/box/link";
import BtnAlertNow from "@/components/btn_alerta_now";
import ReativarButton from "@/components/buttons/reativar";
import { ResendSms } from "@/components/buttons/resendSms";
import BtnBasicSave from "@/components/buttons/save";
import InputBasic from "@/components/input/basic";
import MaskedInput from "@/components/input/masked";
import SelectBasic from "@/components/input/select-basic";
import SelectMultiItem from "@/components/input/select-multi-itens";
import { RegisterContext } from "@/context/RegisterContex";
import { Session } from "@/types/session";
import { solictacao } from "@/types/solicitacao";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";

import { BeatLoader } from "react-spinners";

interface GetSolicitacao {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  telefone2: string | null;
  dt_nascimento: string;
  id_fcw: number;
  fcweb_unico: string | null;
  cnh: string | null;
  ativo: boolean;
  rela_quest: boolean;
  distrato: boolean;
  dt_distrato: string | null;
  status_aprovacao: boolean;
  distrato_id: number | null;
  andamento: string | null;
  type_validacao: string | null;
  dt_aprovacao: string | null;
  hr_aprovacao: string | null;
  dt_agendamento: string | null;
  hr_agendamento: string | null;
  estatos_pgto: string | null;
  valorcd: number;
  situacao_pg: number;
  freqSms: number;
  alertanow: boolean;
  dt_criacao_now: string | null;
  statusAtendimento: boolean;
  pause: boolean;
  corretorId: number;
  construtoraId: number;
  financeiroId: number;
  empreendimentoId: number;
  createdAt: string;
  updatedAt: string;
  relacionamentos: string[];
  dt_revogacao: string | null;
  direto: boolean;
  txid: string;
  pixCopiaECola: string;
  imagemQrcode: string;
  pg_status: boolean;
  pg_andamento: string;
  pg_date: string | null;
  uploadCnh: string | null;
  uploadRg: string | null;
  obs: any[];
  gov: boolean | null;
  corretor: GetCorretor;
  construtora: null;
  empreendimento: GetEmpreendimentos;
  financeiro: GetFinanceiras;
  conf_devolucao: boolean;
  dt_conf_devolucao: string | null;
  alerts: [];
  tags: [];
}

interface GetEmpreendimentos {
  id: number;
  nome: string;
}

interface GetFinanceiras {
  id: number;
  fantasia: string;
}

interface GetCorretor {
  id: number;
  nome: string;
}

interface FormSolicitacaoProps {
  dados: GetSolicitacao;
  Id: number;
  session: Session.AuthUser;
  token: string;
}

export default function FormSolicitacaoDireto({
  dados,
  Id,
  session,
  token,
}: FormSolicitacaoProps) {
  const { Gov } = useContext(RegisterContext);
  const [form, setForm] = useState({
    cpf: dados.cpf || "",
    nome: dados.nome || "",
    datanascimento: dados.dt_nascimento || "",
    telefone: dados.telefone || "",
    telefone2: dados.telefone2 || "",
    email: dados.email || "",
    empreendimento: dados.empreendimentoId || 0,
    financeira: dados.financeiroId || 0,
    corretor: dados.corretorId || 0,
    relacionamento: dados.relacionamentos || [],
    dt_nascimento: dados.dt_nascimento || "",
    tags: dados.tags || [],
    gov: dados.gov || false,
  });

  const [IsLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();
  const [Empreendimentos, setEmpreendimentos] = useState<GetEmpreendimentos[]>(
    dados.empreendimento ? [dados.empreendimento] : []
  );
  const [Financeiras, setFinanceiras] = useState<GetFinanceiras[]>(
    dados.financeiro ? [dados.financeiro] : []
  );
  const [Corretores, setCorretores] = useState<GetCorretor[]>(
    dados.corretor ? [dados.corretor] : []
  );

  const isAdmin = session?.hierarquia === "ADM";

  useEffect(() => {
    setForm((prev) => ({ ...prev, gov: Gov }));
  }, [Gov]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carrega empreendimentos
        if (isAdmin) {
          const req = await fetch("/api/empreendimento/getall");
          const res = await req.json();
          setEmpreendimentos(res || []);
        } else {
          setEmpreendimentos(session?.empreendimento || []);
        }

        // Carrega financeiras
        if (isAdmin) {
          const req2 = await fetch("/api/financeira/getall");
          const res2 = await req2.json();
          setFinanceiras(res2 || []);
        } else {
          setFinanceiras(session?.Financeira || []);
        }

        // Carrega corretores (todos os usuários para ambos os casos)
        const req3 = await fetch("/api/usuario/getAll");
        const res3 = await req3.json();
        setCorretores(res3 || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, [isAdmin, session]);

  /**
   * A função handleChange é responsável por atualizar o estado do formulário
   * ao alterar um campo de entrada.
   *
   * @param {keyof typeof form} field - O nome do campo do formulário que foi alterado.
   * @param {any} value - O novo valor do campo.
   */
  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const DadosAlert: solictacao.SolicitacaoObjectCompleteType = {
    id: dados.id,
    nome: dados.nome,
    email: dados.email,
    cpf: dados.cpf || "",
    telefone: dados.telefone || "",
    telefone2: dados.telefone2 || "",
    dt_nascimento: dados.dt_nascimento || "",
    id_fcw: dados.id_fcw || 0,
    ativo: dados.ativo || false,
    distrato: dados.distrato || false,
    distrato_id: dados.distrato_id || null,
    andamento: dados.andamento || "",
    dt_aprovacao: dados.dt_aprovacao,
    hr_aprovacao: dados.hr_aprovacao,
    dt_agendamento: dados.dt_agendamento,
    hr_agendamento: dados.hr_agendamento,
    valorcd: dados.valorcd,
    alertanow: dados.alertanow,
    statusAtendimento: dados.statusAtendimento,
    pause: dados.pause,
    createdAt: dados.createdAt,
    tags: [],
  };

  const handlesubmit = async () => {
    try {
      setIsLoading(true);
      const req = await fetch(`/api/solicitacao/update/${Id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          financeiroId: form.financeira,
          empreendimentoId: form.empreendimento,
        }),
      });
      const res = await req.json();
      if (!req.ok) {
        toast({
          title: "Erro ao editar solicitação",
          description: res.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
      toast({
        title: "Solicitação editada com sucesso",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      setTimeout(() => {
        setIsLoading(false);
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao editar solicitação",
        description: "Ocorreu um erro ao editar a solicitação",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <VStack
      spacing={0}
      align="stretch"
      w="full"
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="lg"
      _dark={{ bg: "gray.800", borderColor: "gray.700", shadow: "md" }}
      h="full"
    >
      {/* Título do Formulário */}
      <Flex
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderBottomWidth="2px"
        borderBottomColor="#00713D"
        p={{ base: 3, md: 4 }}
        align="center"
        justify="space-between"
      >
        <Heading
          size={{ base: "sm", md: "md" }}
          color="#023147"
          _dark={{ color: "gray.100" }}
        >
          Dados da Solicitação Direto
        </Heading>
      </Flex>

      {/* Conteúdo do Formulário */}
      <VStack
        spacing={4}
        align="stretch"
        flex={1}
        overflowY="auto"
        p={{ base: 2, md: 3 }}
      >
        {/* Seção 1: Dados Pessoais */}
        <VStack spacing={3} align="stretch">
          <Heading
            size="sm"
            color="#023147"
            _dark={{ color: "gray.100" }}
            fontWeight="semibold"
          >
            Dados Pessoais
          </Heading>

          {/* Linha 1: CPF, Nome, Data Nascimento */}
          <Flex gap={3} flexDir={{ base: "column", md: "row" }} flexWrap="wrap">
            <Box w={{ base: "full", md: "18%" }}>
              <MaskedInput
                id="cpf"
                label="CPF"
                type="text"
                mask="999.999.999-99"
                value={form?.cpf || ""}
                onvalue={(value) => handleChange("cpf", value)}
                required
                Disable={!isAdmin}
              />
            </Box>
            <Box
              w={{ base: "auto", md: "auto" }}
              display="flex"
              alignItems="flex-end"
            >
              <IconButton
                icon={<Icon as={FaCopy} />}
                aria-label="Copiar CPF"
                size="sm"
                colorScheme="green"
                onClick={() => {
                  navigator.clipboard.writeText(
                    form?.cpf?.replace(/\D/g, "") || ""
                  );
                  toast({
                    title: "CPF copiado!",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
              />
            </Box>
            <Box w={{ base: "full", md: "38%" }}>
              <InputBasic
                id="nome"
                type="text"
                label="Nome"
                value={form?.nome || ""}
                onvalue={(value) => handleChange("nome", value)}
                required
                isReadOnly={!isAdmin}
              />
            </Box>
            <Box w={{ base: "full", md: "20%" }}>
              <InputBasic
                id="dt_nascimento"
                type="date"
                label="Data de Nascimento"
                value={
                  form?.dt_nascimento ? form?.dt_nascimento.split("T")[0] : ""
                }
                onvalue={(value) => handleChange("dt_nascimento", value)}
                required
                isReadOnly={!isAdmin}
              />
            </Box>
          </Flex>

          {/* Linha 2: Email, Telefones */}
          <Flex gap={3} flexDir={{ base: "column", md: "row" }} flexWrap="wrap">
            <Box w={{ base: "full", md: "35%" }}>
              <InputBasic
                id="email"
                type="email"
                label="Email"
                value={form?.email || ""}
                onvalue={(value) => handleChange("email", value)}
                required
                isReadOnly={!isAdmin}
              />
            </Box>
            <Box w={{ base: "full", md: "20%" }}>
              <MaskedInput
                id="telefone"
                label="Whatsapp Com DDD"
                type="text"
                mask="(99) 99999-9999"
                value={form?.telefone || ""}
                onvalue={(value) => handleChange("telefone", value)}
                required
                isWhatsapp
                isReadOnly={!isAdmin}
              />
            </Box>
            <Box
              w={{ base: "auto", md: "auto" }}
              display="flex"
              alignItems="flex-end"
            >
              <IconButton
                icon={<Icon as={FaCopy} />}
                aria-label="Copiar número telefone"
                size="sm"
                colorScheme="green"
                onClick={() => {
                  navigator.clipboard.writeText(
                    form?.telefone?.replace(/\D/g, "") || ""
                  );
                  toast({
                    title: "Número copiado!",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
              />
            </Box>
            <Box w={{ base: "full", md: "20%" }}>
              <MaskedInput
                id="telefone2"
                label="Whatsapp Com DDD 2"
                type="text"
                mask="(99) 99999-9999"
                value={form?.telefone2 || ""}
                onvalue={(value) => handleChange("telefone2", value)}
                isWhatsapp
              />
            </Box>
          </Flex>
        </VStack>

        <Divider borderColor="gray.300" _dark={{ borderColor: "gray.600" }} />

        {/* Seção 2: Dados da Solicitação */}
        <VStack spacing={3} align="stretch">
          <Heading
            size="sm"
            color="#023147"
            _dark={{ color: "gray.100" }}
            fontWeight="semibold"
          >
            Dados da Solicitação
          </Heading>

          <Flex gap={3} flexDir={{ base: "column", md: "row" }} flexWrap="wrap">
            <Box w={{ base: "full", md: "30%" }}>
              <SelectBasic
                id="empreendimento"
                label="Empreendimento"
                onvalue={(value) =>
                  handleChange("empreendimento", Number(value))
                }
                value={form?.empreendimento || ""}
                required
                options={Empreendimentos.map((e) => ({
                  id: e.id,
                  fantasia: e.nome,
                }))}
                Disable={!isAdmin}
              />
            </Box>

            <Box w={{ base: "full", md: "30%" }}>
              <SelectBasic
                id="financeira"
                label="Financeira"
                onvalue={(value) => {
                  const id = Number(value);
                  handleChange("financeira", id);
                }}
                value={form?.financeira || ""}
                required
                Disable={!form?.empreendimento || !isAdmin}
                options={Financeiras.map((f) => ({
                  id: f.id,
                  fantasia: f.fantasia,
                }))}
              />
            </Box>

            <Box w={{ base: "full", md: "30%" }}>
              <SelectBasic
                id="corretor"
                label="Corretor"
                onvalue={(value) => handleChange("corretor", Number(value))}
                value={form?.corretor || ""}
                required
                Disable={!form?.empreendimento || !form?.financeira || !isAdmin}
                options={Corretores.map((c) => ({
                  id: c.id,
                  fantasia: c.nome,
                }))}
              />
            </Box>
          </Flex>
        </VStack>

        <Divider borderColor="gray.300" _dark={{ borderColor: "gray.600" }} />

        {/* Seção 3: Informações do Protocolo */}
        <VStack spacing={3} align="stretch">
          <Heading
            size="sm"
            color="#023147"
            _dark={{ color: "gray.100" }}
            fontWeight="semibold"
          >
            Informações do Protocolo
          </Heading>

          <Flex
            gap={3}
            flexWrap="wrap"
            flexDir={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "flex-start" }}
          >
            <Box w={{ base: "full", md: "14rem" }}>
              <BoxBasic
                id="idfcweb"
                label={isAdmin ? "Protocolo/IDFcweb" : "Protocolo"}
                value={dados.id_fcw || ""}
                isLink={isAdmin}
                href={
                  isAdmin
                    ? `https://redebrasilrp.com.br/fcw2/abrir_ficha.php?fc=${dados.id_fcw}`
                    : undefined
                }
              />
            </Box>

            <Box w={{ base: "full", md: "12rem" }}>
              <BoxBasic
                id="andamento"
                label="Andamento"
                value={dados.andamento || ""}
              />
            </Box>

            <Box
              w={{ base: "full", md: "auto" }}
              display="flex"
              alignItems="flex-end"
            >
              {isAdmin && dados.id_fcw && <BtnLimparFcw id={dados.id || 0} />}
            </Box>

            {/* TODO: incluir botão de atualizar status de pagamento */}

            <Box
              w={{ base: "full", md: "auto" }}
              flex={{ base: "initial", md: 1 }}
            >
              <SelectMultiItem
                Id={Id}
                label="Tags"
                isAdmin={isAdmin}
                Tags={dados.tags}
                required
                OnRetorno={(tags) => handleChange("tags", tags)}
              />
            </Box>
          </Flex>

          <Flex
            gap={3}
            flexWrap="wrap"
            flexDir={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "flex-start" }}
          >
            {isAdmin && (
              <Box mr={2}>
                <BtnDevolucao
                  id={Id}
                  token={token}
                  data={dados as any} // Passamos os dados da ficha
                />
              </Box>
            )}
          </Flex>
        </VStack>
      </VStack>

      {/* Botões de Ação - Fixo no rodapé */}
      <Flex
        gap={2}
        w={"full"}
        justifyContent={"flex-end"}
        flexWrap="wrap"
        p={{ base: 3, md: 4 }}
        borderTopWidth="2px"
        borderTopColor="#00713D"
        bg="white"
        _dark={{ borderTopColor: "#00d672", bg: "gray.800" }}
      >
        {session?.role?.agente_registro && dados.fcweb_unico && (
          <Button
            size="sm"
            bg="blue.600"
            color="white"
            _hover={{ bg: "blue.700" }}
            onClick={() => {
              const baseUrl = process.env.NEXT_PUBLIC_URL_IMPORTACAO_SOLUTI;

              if (baseUrl) {
                const idLimpo = dados.fcweb_unico!.split(".")[0];
                const finalUrl = baseUrl.replace("[ID]", idLimpo);
                window.open(finalUrl, "_blank");
              } else {
                console.error("URL de importação não configurada no .env");
              }
            }}
          >
            Coletas Biométrias
          </Button>
        )}
        {session?.hierarquia === "ADM" && <BotaoSisapp body={dados as any} />}
        {dados.ativo && isAdmin && <ResendSms id={Id} />}
        <Button
          colorScheme="orange"
          size={"sm"}
          onClick={() => router.push(`/chamado/novo?id=${Id}`)}
        >
          Chamado
        </Button>
        <BtCreateAlertCliente
          corretorId={dados.corretor?.id ?? 0}
          solicitacaoId={dados.id}
          solicitacaoNome={dados.nome}
          isAdmin={session?.hierarquia === "ADM"}
        />
        {dados.distrato &&
          dados.ativo &&
          ((session?.hierarquia === "ADM" && (
            <>
              <BtRemoverDistrato id={Id} />
            </>
          )) ||
            (session?.hierarquia === "CCA" && (
              <>
                <BtRemoverDistrato id={Id} />
              </>
            )))}
        {!dados.id_fcw && dados.ativo && (
          <CriarFcweb Dados={dados} user={session!} />
        )}
        <BotaoPausar id={Id} statusPause={dados.pause} />
        <BtnIniciarAtendimento
          hierarquia={session?.hierarquia || ""}
          status={dados.statusAtendimento}
          aprovacao={dados.andamento}
          id={Id}
        />
        {session?.hierarquia === "ADM" && !dados.ativo && (
          <ReativarButton
            size={"sm"}
            px={8}
            colorScheme="red"
            solicitacaoId={Id}
          >
            Reativar
          </ReativarButton>
        )}
        {!dados.distrato && (
          <BtnBasicSave
            size={"sm"}
            bg={"green.500"}
            color={"white"}
            onClick={handlesubmit}
            _hover={{ bg: "green.600" }}
            spinner={<BeatLoader size={8} color="white" />}
            isLoading={IsLoading}
          >
            Salvar
          </BtnBasicSave>
        )}
      </Flex>
    </VStack>
  );
}
