import InputBasic from "@/components/input/basic";
import MaskedInput from "@/components/input/masked";
import { Session } from "@/types/session";
import {
  Button,
  Flex,
  Spinner,
  Text,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SelectConstEmpFinCor from "../select";

interface FormSolicitacaoProps {
  cpf?: string;
  solicitacao?: any;
  session: Session.SessionServer;
}

export default function FormSolicitacao({
  cpf,
  solicitacao,
  session,
}: FormSolicitacaoProps) {
  const [form, setForm] = useState({
    cpf: cpf,
    nome: "",
    datanascimento: "",
    telefone: "",
    telefone2: "",
    email: "",
    construtora: 0 as number,
    empreendimento: 0 as number,
    financeira: 0 as number,
    corretor: 0 as number,
  });

  const [Logwhats, setLogwhats] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const toast = useToast();
  const isAdmin = session?.user?.hierarquia === "ADM";
  const [Sms, setSms] = useState<boolean>(true);

  // --- CORES DARK MODE ---
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("#E8E8E8", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const cardBorder = useColorModeValue("gray.200", "gray.600");
  const footerBg = useColorModeValue("gray.100", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    setForm((prev) => ({ ...prev, cpf: cpf }));
    if (solicitacao) {
      setForm((form) => ({
        ...form,
        nome: solicitacao?.nome,
        datanascimento: solicitacao?.dt_nascimento.split("T")[0],
        telefone: solicitacao?.telefone,
        email: solicitacao?.email,
        construtora: solicitacao?.construtoraId,
        empreendimento: solicitacao?.empreendimentoId,
        financeira: solicitacao?.financeiraId,
        corretor: solicitacao?.corretorId,
      }));
    }
  }, [session, cpf, solicitacao]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlesubmit = async (forceNoSms: boolean = false) => {
    if (
      !form.nome ||
      !form.cpf ||
      !form.email ||
      !form.telefone ||
      !form.construtora ||
      !form.empreendimento ||
      !form.financeira ||
      !form.datanascimento
    ) {
      toast({
        title: "Preencha todos os campos",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const sendSms = forceNoSms ? false : Sms;

    const data: any = {
      url: typeof window !== "undefined" ? window.location.href : "",
      nome: form.nome.trim().replace(/\s+/g, " "),
      telefone: form.telefone.replace(/\W+/g, ""),
      cpf: form.cpf.replace(/\W+/g, ""),
      ...(form.telefone2 && { telefone2: form.telefone2?.replace(/\W+/g, "") }),
      email: form.email.replace(/\s+/g, "").toLowerCase(),
      corretor: isAdmin ? Number(form.corretor) : Number(session?.user?.id),
      construtora: Number(form.construtora),
      empreendimento: Number(form.empreendimento),
      dt_nascimento: new Date(form.datanascimento),
      financeiro: Number(form.financeira),
      ...(Logwhats && { obs: Logwhats }),
    };

    try {
      setLoad(true);
      const response = await fetch(`/api/solicitacao?sms=${sendSms}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const retorno = await response.json();

      if (response.ok) {
        toast({ title: "Sucesso", status: "success", duration: 3000 });
        if (retorno.id) router.push("/home");
      } else {
        const msgErro = Array.isArray(retorno.message)
          ? retorno.message.join(", ")
          : retorno.message || "";
        if (
          msgErro.toUpperCase().includes("WHATSAPP") ||
          msgErro.toUpperCase().includes("INVALID")
        ) {
          setErrorMessage(msgErro);
          onOpen();
        } else {
          toast({
            title: "Erro na Solicitação",
            description: msgErro,
            status: "error",
            duration: 7000,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitacao",
        status: "error",
      });
    } finally {
      setLoad(false);
    }
  };

  return (
    <Flex
      w={"100%"}
      bg={bgColor}
      rounded={"md"}
      margin={"1"}
      border={`1px solid ${borderColor}`}
      alignItems={"center"}
      flexDir="column"
      gap={2}
      shadow={"lg"}
      p={4}
    >
      <Text fontSize={"2xl"} fontWeight={"bold"} color={textColor}>
        Cadastro Nova Solicitação
      </Text>

      <Flex w="full" justifyContent="center" flexWrap="wrap" gap={4} mb={2}>
        <MaskedInput
          label="CPF"
          id="cpf"
          mask="999.999.999-99"
          onvalue={(v) => handleChange("cpf", v)}
          value={form.cpf || ""}
          Disable
          required
          boxWidth="25%"
        />
        <InputBasic
          label="Nome Completo"
          id="nome"
          onvalue={(v) => {
            const normalizedValue = v
              .toUpperCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");

            handleChange("nome", normalizedValue);
          }}
          value={form.nome.toUpperCase()}
          required
          boxWidth="45%"
        />
        <InputBasic
          label="Data de Nascimento"
          id="datanascimento"
          type="date"
          onvalue={(v) => handleChange("datanascimento", v)}
          value={form.datanascimento}
          required
          boxWidth="25%"
        />
      </Flex>

      <Flex w="full" justifyContent="center" flexWrap="wrap" gap={4} mb={2}>
        <MaskedInput
          label="Whatsapp com DDD"
          id="telefone"
          mask="(99) 99999-9999"
          onvalue={(v) => handleChange("telefone", v)}
          value={form.telefone}
          required
          boxWidth="28%"
          retornoLog={(log) => setLogwhats(log)}
        />
        <MaskedInput
          label="Whatsapp com DDD 2"
          id="telefone2"
          mask="(99) 99999-9999"
          onvalue={(v) => handleChange("telefone2", v)}
          value={form.telefone2}
          boxWidth="28%"
        />
        <InputBasic
          label="Email"
          id="email"
          onvalue={(v) => handleChange("email", v)}
          value={form.email}
          required
          boxWidth="40%"
        />
      </Flex>

      <Flex
        w={{ md: "84%", base: "full" }}
        justifyContent={"center"}
        flexWrap={"wrap"}
        gap={4}
        mb={2}
      >
        <SelectConstEmpFinCor
          session={session.user}
          isAdmin={isAdmin}
          ValueConstrutora={(v) => handleChange("construtora", v)}
          ValueEmpreendimento={(v) => handleChange("empreendimento", v)}
          ValueFinanceira={(v) => handleChange("financeira", v)}
          ValueCorretor={(v) => handleChange("corretor", v)}
          edit={false}
        />
      </Flex>

      <Flex
        roundedBottom={"md"}
        bg={footerBg}
        justifyContent={"space-around"}
        p={4}
        w={"full"}
      >
        <Button
          onClick={() => handlesubmit(false)}
          colorScheme="green"
          isLoading={load}
        >
          Criar Solicitação
        </Button>
      </Flex>

      {/* MODAL DE CONFIRMAÇÃO */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        size="lg"
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={bgColor} color={textColor}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              ⚠️ Erro ao Verificar WhatsApp
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text color="red.500" fontWeight="bold" mb={3}>
                {errorMessage}
              </Text>
              <Text mb={4}>
                O número <strong>{form.telefone}</strong> falhou. Revise os
                dados:
              </Text>

              <Flex
                direction="column"
                bg={cardBg}
                p={4}
                rounded="md"
                border="1px solid"
                borderColor={cardBorder}
                gap={1}
                fontSize="sm"
              >
                <Text>
                  <strong>Nome:</strong> {form.nome.toUpperCase()}
                </Text>
                <Text>
                  <strong>CPF:</strong> {form.cpf}
                </Text>
                <Text>
                  <strong>Nascimento:</strong>{" "}
                  {form.datanascimento
                    ? new Date(
                        form.datanascimento + "T00:00:00"
                      ).toLocaleDateString("pt-BR")
                    : ""}
                </Text>
                <Text>
                  <strong>Email:</strong> {form.email}
                </Text>
              </Flex>

              <Text mt={4} fontWeight="medium" textAlign="center">
                Deseja criar a solicitação sem WhatsApp?
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter gap={3} justifyContent="center" pb={6}>
              <Button ref={cancelRef} onClick={onClose} variant="outline">
                Corrigir Telefone
              </Button>
              <Button
                colorScheme="orange"
                onClick={() => {
                  onClose();
                  handlesubmit(true);
                }}
                isLoading={load}
              >
                Confirmar sem WhatsApp
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}
