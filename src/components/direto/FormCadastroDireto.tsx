"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Text,
  useToast,
  Select,
  FormControl,
  FormLabel,
  useColorModeValue,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import { MdAccountBalance, MdBusiness } from "react-icons/md";
import InputBasic from "@/components/input/basic";
import MaskedInput from "@/components/input/masked";

interface FormCadastroDiretoProps {
  tokenJWT: string;
  session: any;
}

interface EmpreendimentoRelacionado {
  id: number;
  nome: string;
  financeiras: {
    id: number;
    fantasia: string;
  }[];
}

export default function FormCadastroDireto({
  tokenJWT,
  session,
}: FormCadastroDiretoProps) {
  const router = useRouter();
  const toast = useToast();

  // --- CORES ALINHADAS COM O SISTEMA ---
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("#E8E8E8", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const footerBg = useColorModeValue("gray.50", "gray.900");
  const selectOptionColor = useColorModeValue("gray.800", "white !important");
  const selectOptionBg = useColorModeValue("white", "gray.800");
  const optionInlineColor = useColorModeValue("#2D3748", "#FFFFFF");

  const [configuracoes, setConfiguracoes] = useState<
    EmpreendimentoRelacionado[]
  >([]);
  const [financeirasFiltradas, setFinanceirasFiltradas] = useState<
    { id: number; fantasia: string }[]
  >([]);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    datanascimento: "",
    telefone: "",
    email: "",
    empreendimento: "" as string | number,
    financeira: "" as string | number,
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!tokenJWT) return;

    fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/direto/configuracoes`, {
      headers: { Authorization: `Bearer ${tokenJWT}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConfiguracoes(data);
        }
      })
      .catch((err) => {
        console.error("Erro ao mapear relações:", err);
        toast({
          title: "Erro ao sincronizar dependências dos campos",
          status: "error",
        });
      });
  }, [tokenJWT, toast]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmpreendimentoChange = (empId: string) => {
    handleChange("empreendimento", empId);
    handleChange("financeira", "");

    if (!empId) {
      setFinanceirasFiltradas([]);
      return;
    }

    const matchNode = configuracoes.find((item) => item.id === Number(empId));
    if (matchNode && Array.isArray(matchNode.financeiras)) {
      setFinanceirasFiltradas(matchNode.financeiras);
    } else {
      setFinanceirasFiltradas([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.nome ||
      !form.cpf ||
      !form.email ||
      !form.telefone ||
      !form.empreendimento ||
      !form.financeira ||
      !form.datanascimento
    ) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nome: form.nome.toUpperCase().trim().replace(/\s+/g, " "),
        cpf: form.cpf.replace(/\D/g, ""),
        telefone: form.telefone.replace(/\D/g, ""),
        email: form.email.trim().toLowerCase(),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/direto/cadastro-cca`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenJWT}`,
          },
          body: JSON.stringify({
            ...payload,
            dt_nascimento: new Date(form.datanascimento).toISOString(),
            financeiroId: Number(form.financeira),
            empreendimentoId: Number(form.empreendimento),
            baseUrl: `${window.location.origin}/direto/cliente`,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Erro ao cadastrar cliente.");

      toast({
        title: "Cliente cadastrado e cobrança gerada!",
        status: "success",
        duration: 2000,
      });

      router.push(
        `/direto/pagamento?nome=${encodeURIComponent(
          payload.nome,
        )}&cpf=${payload.cpf}&idSolicitacao=${
          data.solicitacaoId
        }&link=${encodeURIComponent(data.link)}`,
      );
    } catch (error: any) {
      toast({
        title: "Falha na criação",
        description: error.message,
        status: "error",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex w="full" justify="center" align="start" py={4}>
      <Flex
        w="full"
        maxW="1100px"
        bg={bgColor}
        rounded="md"
        border="1px solid"
        borderColor={borderColor}
        flexDir="column"
        gap={4}
        shadow="lg"
        p={0}
        overflow="hidden"
      >
        <Box px={6} pt={6} pb={2}>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            Cadastro de Venda Direta (CCA)
          </Text>
          <Text fontSize="sm" color="gray.500">
            Insira os dados cadastrais do cliente para iniciar o processo de
            emissão de certificado.
          </Text>
        </Box>

        <Divider borderColor={borderColor} />

        <Box as="form" onSubmit={handleSubmit} px={6} pb={6}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={4}>
            <Box>
              <MaskedInput
                label="CPF"
                id="cpf"
                mask="999.999.999-99"
                onvalue={(v) => handleChange("cpf", v)}
                value={form.cpf}
                required
                boxWidth="100%"
              />
            </Box>
            <Box gridColumn={{ md: "span 2" }}>
              <InputBasic
                label="Nome Completo"
                id="nome"
                onvalue={(v) => {
                  const normalized = v
                    .toUpperCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                  handleChange("nome", normalized);
                }}
                value={form.nome}
                required
                boxWidth="100%"
              />
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Box>
              <InputBasic
                label="Data de Nascimento"
                id="datanascimento"
                type="date"
                onvalue={(v) => handleChange("datanascimento", v)}
                value={form.datanascimento}
                required
                boxWidth="100%"
              />
            </Box>
            <Box>
              <MaskedInput
                label="WhatsApp (Com DDD)"
                id="telefone"
                mask="(99) 99999-9999"
                onvalue={(v) => handleChange("telefone", v)}
                value={form.telefone}
                required
                boxWidth="100%"
              />
            </Box>
            <Box>
              <InputBasic
                label="E-mail"
                id="email"
                type="email"
                onvalue={(v) => handleChange("email", v)}
                value={form.email}
                required
                boxWidth="100%"
              />
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="bold"
                color={labelColor}
                mb={2}
              >
                Empreendimento Habilitado
              </FormLabel>
              <Select
                placeholder="Selecione o empreendimento..."
                value={form.empreendimento}
                onChange={(e) => handleEmpreendimentoChange(e.target.value)}
                size="lg"
                bg={bgColor}
                borderColor="gray.300"
                color={textColor}
                icon={<MdBusiness />}
                _hover={{ borderColor: "green.500" }}
                _dark={{
                  bg: "gray.800",
                  borderColor: "gray.600",
                  color: "gray.100",
                  _hover: { borderColor: "#00d672" },
                }}
                sx={{
                  color: textColor,
                  "& option": {
                    bg: selectOptionBg,
                    color: selectOptionColor,
                  },
                  "& font": {
                    color: selectOptionColor,
                  },
                }}
              >
                {configuracoes.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={{ color: optionInlineColor }}
                  >
                    {item.nome}{" "}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="bold"
                color={labelColor}
                mb={2}
              >
                Financeira / CCA Origem
              </FormLabel>
              <Select
                placeholder={
                  form.empreendimento
                    ? "Selecione a financeira..."
                    : "Escolha um empreendimento primeiro..."
                }
                value={form.financeira}
                onChange={(e) => handleChange("financeira", e.target.value)}
                size="lg"
                bg={bgColor}
                borderColor="gray.300"
                color={textColor}
                icon={<MdAccountBalance />}
                isDisabled={!form.empreendimento}
                _hover={{ borderColor: "green.500" }}
                _dark={{
                  bg: "gray.800",
                  borderColor: "gray.600",
                  color: "gray.100",
                  _hover: { borderColor: "#00d672" },
                }}
                sx={{
                  color: textColor,
                  "& option": {
                    bg: selectOptionBg,
                    color: selectOptionColor,
                  },
                  "& font": {
                    color: selectOptionColor,
                  },
                }}
              >
                {financeirasFiltradas.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={{ color: optionInlineColor }}
                  >
                    {item.fantasia}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <Flex
            bg={footerBg}
            justifyContent="flex-end"
            gap={4}
            p={4}
            mx={-6}
            mb={-6}
            borderTop="1px solid"
            borderColor={borderColor}
          >
            <Button
              variant="outline"
              borderColor="gray.300"
              _dark={{ borderColor: "gray.600" }}
              onClick={() => router.push("/direto")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="green"
              bg="#00713D"
              _hover={{ bg: "#005a31" }}
              isLoading={loading}
              loadingText="Gerando link..."
            >
              Cadastrar e gerar link
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
