"use client";
import { BtCreateAlertCliente } from "@/components/botoes/bt_create_alert_cliente";
import BtRemoverDistrato from "@/components/botoes/bt_Remover_Distrato";
import BotaoSisapp from "@/components/botoes/bt_sisapp";
import BtnIniciarAtendimento from "@/components/botoes/btn_iniciar_atendimento";
import BotaoPausar from "@/components/botoes/btn_pausar";
import { CriarFcweb } from "@/components/botoes/criarFcweb";
import BoxBasic from "@/components/box/link";
import BtnAlertNow from "@/components/btn_alerta_now";
import ReativarButton from "@/components/buttons/reativar";
import { ResendSms } from "@/components/buttons/resendSms";
import BtnBasicSave from "@/components/buttons/save";
import InputBasic from "@/components/input/basic";
import MaskedInput from "@/components/input/masked";
import SelectMultiItem from "@/components/input/select-multi-itens";
import { Session } from "@/types/session";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Text,
  useToast,
  VStack,
  HStack,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import { AiOutlineWarning } from "react-icons/ai";
import { TbDeviceMobileMessage } from "react-icons/tb";
import { BeatLoader } from "react-spinners";
import SelectConstEmpFinCor from "../../select";
import BtnLimparFcw from "@/components/botoes/btn_lipar_fcw";
import { RegisterContext } from "@/context/RegisterContex";
import { FaCopy } from "react-icons/fa";
interface FormSolicitacaoEditProps {
  id?: number;
  data: any;
  session: Session.AuthUser;
}

interface SolicitacaoType {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  telefone2: string | null;
  dt_nascimento: string;
  id_fcw: number;
  cnh: string | null;
  ativo: boolean;
  rela_quest: boolean;
  distrato: boolean;
  dt_distrato: string | null;
  status_aprovacao: boolean;
  distrato_id: number | null;
  andamento: string | null;
  type_validacao: string | null;
  dt_aprovacao: Date | string | null;
  hr_aprovacao: string | null;
  dt_agendamento: string | null;
  hr_agendamento: string | null;
  estatos_pgto: string | null;
  valorcd: number | string | null;
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
  createdAt: string | null;
  updatedAt: string | null;
  relacionamentos: string[];
  dt_revogacao: string | null;
  direto: boolean;
  txid: string | null;
  pixCopiaECola: string | null;
  imagemQrcode: string | null;
  uploadCnh: string | null;
  uploadRg: string | null;
  sisapp?: boolean | null;
  gov: boolean | false;
  obs: {
    id: string;
    data: string;
    hora: string;
    autor: string;
    autor_id: number;
    mensagem: string;
  }[];
  pg_andamento: string;
  pg_date: string | null;
  pg_status: boolean;
  corretor: {
    id: number;
    nome: string;
    telefone: string;
  };
  construtora: {
    id: number;
    fantasia: string;
    valor_cert: number;
  };
  empreendimento: {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
    tag: string;
  };
  financeiro: {
    id: number;
    fantasia: string;
    tel: string;
    valor_cert: number;
  };
  alerts: [
    {
      id: number;
      descricao: string;
      status: boolean;
      createdAt: string;
    }
  ];
  tags: [
    {
      id: number;
      solicitacao: number;
      descricao: string;
      createAt: string;
    }
  ];
}

function FormSolicitacaoEdit({ id, data, session }: FormSolicitacaoEditProps) {
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState<SolicitacaoType>(data);
  const [isLoading, setIsLoading] = useState(false);
  const { Gov } = useContext(RegisterContext);

  const isAdmin = useMemo(
    () => session?.hierarquia === "ADM",
    [session?.hierarquia]
  );
  const Hierarquia = useMemo(
    () => session?.hierarquia || null,
    [session?.hierarquia]
  );

  const handleChange = useCallback((field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, gov: Gov }));
  }, [Gov]);

  /**
   * Envia os dados do formulário para atualização da solicitação
   * Exibe feedback ao usuário e recarrega a página após sucesso
   */
  const handlesubmit = useCallback(async () => {
    setIsLoading(true);
    const req = await fetch(`/api/solicitacao/update/${id}`, {
      method: "PUT",
      body: JSON.stringify({ form }),
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
      setIsLoading(false);
      return;
    }
    toast({
      title: "Solicitação editada com sucesso",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
    setTimeout(() => {
      setIsLoading(false);
      router.refresh();
    }, 2000);
  }, [id, form, toast, router]);

  return (
    <VStack spacing={0} align="stretch" w="full">
      {/* Título do Formulário */}
      <Flex
        bg="white"
        _dark={{ bg: "gray.800" }}
        borderBottomWidth="2px"
        borderBottomColor="#00713D"
        p={{ base: 3, md: 4 }}
        align="center"
        justify="space-between"
        boxShadow="2xl"
      >
        <Heading
          size={{ base: "sm", md: "md" }}
          color="#023147"
          _dark={{ color: "gray.100" }}
        >
          Dados da Solicitação
        </Heading>
      </Flex>
      {/* Conteúdo do Formulário */}
      <VStack
        spacing={4}
        p={{ base: 3, md: 4, lg: 6 }}
        align="stretch"
        bg="white"
        _dark={{ bg: "gray.800" }}
      >
        {/* Linha 1: CPF, Nome, Data de Nascimento */}
        <Flex gap={4} flexDir={{ base: "column", md: "row" }} flexWrap="wrap">
          <MaskedInput
            boxWidth="25%"
            id="cpf"
            label="CPF"
            type="text"
            mask="999.999.999-99"
            value={form?.cpf || ""}
            onvalue={(value) => handleChange("cpf", value)}
            required
            isReadOnly={!isAdmin}
            Disable={!isAdmin}
          />
          <HStack align={"end"}>
            <IconButton
              icon={<Icon as={FaCopy} />}
              aria-label="Copiar CPF"
              size="sm"
              colorScheme="green"
              // variant="outline"
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
          </HStack>
          <InputBasic
            boxWidth="45%"
            id="nome"
            type="text"
            label="Nome"
            value={form?.nome.toUpperCase() || ""}
            onvalue={(value) => {
              const normalizedValue = value
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

              handleChange("nome", normalizedValue);
            }}
            required
            isReadOnly={!isAdmin}
          />
          <InputBasic
            boxWidth="25%"
            id="dt_nascimento"
            type="date"
            label="Data de Nascimento"
            value={form?.dt_nascimento ? form?.dt_nascimento.split("T")[0] : ""}
            onvalue={(value) => handleChange("dt_nascimento", value)}
            required
            isReadOnly={!isAdmin}
          />
        </Flex>
        {/* Linha 2: Email, Whatsapp 1, Whatsapp 2 */}
        <Flex gap={4} flexDir={{ base: "column", md: "row" }} flexWrap="wrap">
          <InputBasic
            boxWidth="40%"
            id="email"
            type="email"
            label="Email"
            value={form?.email || ""}
            onvalue={(value) => handleChange("email", value)}
            required
            isReadOnly={!isAdmin}
          />
          <MaskedInput
            boxWidth="25%"
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
          <HStack align={"end"}>
            <IconButton
              icon={<Icon as={FaCopy} />}
              aria-label="Copiar número"
              size="sm"
              colorScheme="green"
              // variant="outline"
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
          </HStack>

          <MaskedInput
            boxWidth="25%"
            id="telefone2"
            label="Whatsapp Com DDD 2"
            type="text"
            mask="(99) 99999-9999"
            value={form?.telefone2 || ""}
            onvalue={(value) => handleChange("telefone2", value)}
            isWhatsapp
          />
        </Flex>
        <SelectConstEmpFinCor
          session={session}
          isAdmin={isAdmin}
          Form={form}
          ValueConstrutora={(value: number) =>
            handleChange("construtoraId", Number(value))
          }
          ValueEmpreendimento={(value: number) =>
            handleChange("empreendimentoId", Number(value))
          }
          ValueFinanceira={(value: number) =>
            handleChange("financeiroId", Number(value))
          }
          ValueCorretor={(value: number) =>
            handleChange("corretorId", Number(value))
          }
          edit
        />
        <Divider borderColor="gray.300" _dark={{ borderColor: "gray.600" }} />

        {/* Linha 3: Protocolo, Andamento, Tags */}
        <Flex
          gap={4}
          flexWrap="wrap"
          flexDir={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "flex-start" }}
        >
          <Box w={{ base: "full", md: "15rem" }}>
            <BoxBasic
              id="idfcweb"
              label={isAdmin ? "Protocolo/IDFcweb" : "Protocolo"}
              value={form?.id_fcw || ""}
              isLink={isAdmin}
              href={
                isAdmin
                  ? `https://redebrasilrp.com.br/fcw2/abrir_ficha.php?fc=${form?.id_fcw}`
                  : undefined
              }
            />
          </Box>
          <Box w={{ base: "full", md: "13rem" }}>
            <BoxBasic
              id="andamento"
              label="Andamento"
              value={form?.andamento || ""}
            />
          </Box>
          <Box
            w={{ base: "full", md: "15rem" }}
            display="flex"
            alignItems="flex-end"
          >
            {isAdmin && form?.id_fcw && <BtnLimparFcw id={id || 0} />}
          </Box>
          <Box
            w={{ base: "full", md: "28rem" }}
            flex={{ base: "initial", md: 1 }}
          >
            {isAdmin && (
              <SelectMultiItem
                Id={id || 0}
                isAdmin={isAdmin}
                label="Tags"
                Tags={data.tags}
                OnRetorno={(tags) => handleChange("tags", tags)}
                required
              />
            )}
          </Box>
        </Flex>

        <Divider borderColor="gray.300" _dark={{ borderColor: "gray.600" }} />
        {/* Alertas NOW e SISAPP */}
        <VStack spacing={3} align="stretch">
          {session?.role.now && (
            <Flex
              w="full"
              border="1px"
              borderColor="red.500"
              bg="red.100"
              _dark={{ bg: "red.900", borderColor: "red.600" }}
              p={3}
              borderRadius="lg"
              align="center"
              gap={2}
              justify="space-between"
              minH="56px"
            >
              <Flex align="center" gap={2}>
                <Icon
                  as={AiOutlineWarning}
                  color="red.600"
                  _dark={{ color: "red.400" }}
                  boxSize={7}
                />
                {form.alertanow ? (
                  <Text
                    color="red.700"
                    _dark={{ color: "red.200" }}
                    fontSize="md"
                  >
                    Alerta criado, se for necessário cancelar
                  </Text>
                ) : (
                  <Text
                    color="red.700"
                    _dark={{ color: "red.200" }}
                    fontSize="md"
                  >
                    Somente em caso de cliente presente na unidade
                  </Text>
                )}
              </Flex>
              <BtnAlertNow
                id={form.id || 0}
                alertanow={form.alertanow || false}
              />
            </Flex>
          )}
          {data.sisapp && (
            <Flex
              w="full"
              border="1px"
              borderColor="blue.500"
              bg="blue.100"
              _dark={{ bg: "blue.900", borderColor: "blue.600" }}
              p={3}
              borderRadius="lg"
              align="center"
              gap={3}
              justify="center"
              minH="56px"
            >
              <Flex align="center" gap={2}>
                <Icon
                  as={TbDeviceMobileMessage}
                  color="blue.600"
                  _dark={{ color: "blue.400" }}
                  boxSize={7}
                />
                <Text
                  color="blue.700"
                  _dark={{ color: "blue.200" }}
                  fontSize="md"
                >
                  Cliente atendido via Aplicativo NatoId
                </Text>
              </Flex>
            </Flex>
          )}
        </VStack>
      </VStack>

      {/* Rodapé com Botões de Ação */}
      <Flex
        gap={2}
        w="full"
        p={{ base: 3, md: 4 }}
        justifyContent="flex-end"
        flexWrap="wrap"
        bg="gray.50"
        borderTopWidth="1px"
        borderTopColor="gray.200"
        _dark={{ bg: "gray.900", borderTopColor: "gray.700" }}
      >
        {Hierarquia === "ADM" && (
          <BotaoSisapp body={data} ativo={data.sisapp ? data.sisapp : false} />
        )}
        {form?.ativo && Hierarquia === "ADM" && <ResendSms id={form?.id} />}
        <Button
          colorScheme="orange"
          size={"sm"}
          onClick={() => router.push(`/chamado/novo?id=${id}`)}
        >
          Chamado
        </Button>
        <BtCreateAlertCliente
          corretorId={form?.corretor?.id ?? 0}
          solicitacaoId={form?.id}
          solicitacaoNome={form?.nome}
          isAdmin={session?.hierarquia === "ADM"}
        />
        {form?.distrato &&
          form?.ativo &&
          ((Hierarquia === "ADM" && (
            <>
              <BtRemoverDistrato id={form?.id} />
            </>
          )) ||
            (Hierarquia === "CCA" && (
              <>
                <BtRemoverDistrato id={form?.id} />
              </>
            )))}
        {!form?.id_fcw && form?.ativo && (
          <CriarFcweb Dados={form} user={session!} />
        )}
        <BotaoPausar id={form?.id} statusPause={data?.pause} />
        <BtnIniciarAtendimento
          hierarquia={Hierarquia}
          status={
            data?.statusAtendimento
              ? data.statusAtendimento
              : form?.statusAtendimento
          }
          aprovacao={form?.andamento}
          id={form?.id}
        />
        {session?.hierarquia === "ADM" && !data?.ativo && (
          <ReativarButton
            size={"sm"}
            px={8}
            colorScheme="red"
            solicitacaoId={id}
          >
            Reativar
          </ReativarButton>
        )}
        {!data?.distrato && (
          <BtnBasicSave
            size={"sm"}
            bg={"green.500"}
            color={"white"}
            onClick={handlesubmit}
            _hover={{ bg: "green.600" }}
            spinner={<BeatLoader size={8} color="white" />}
            isLoading={isLoading}
          >
            Salvar
          </BtnBasicSave>
        )}
      </Flex>
    </VStack>
  );
}

export default memo(FormSolicitacaoEdit);
