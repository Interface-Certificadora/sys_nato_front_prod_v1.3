"use client";
import CardAdmUsuario from "@/components/adm/card";
import ModalAddCobrancaNatosign from "@/components/adm/modal/add_cobranca_natosign";
import RelatorioNatosign, {
  RelatorioNatosignItem,
} from "@/components/adm/natosign/RelatorioNatosign";
import { useSession } from "@/hook/useSession";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuDollarSign, LuFileText } from "react-icons/lu";
import {
  MdAnalytics,
  MdArrowBack,
  MdCheckCircle,
  MdMail,
  MdPending,
} from "react-icons/md";
import { FaFileSignature } from "react-icons/fa";

interface GeralType {
  relatorios: number;
  cobrancas_aberto: string;
  aprovado: number;
  pendente: number;
  em_analise: number;
  envelopes_a_cobrar: number;
  valor_a_cobrar: string;
}

const INITIAL_GERAL: GeralType = {
  relatorios: 0,
  cobrancas_aberto: "R$ 0,00",
  aprovado: 0,
  pendente: 0,
  em_analise: 0,
  envelopes_a_cobrar: 0,
  valor_a_cobrar: "R$ 0,00",
};

export default function AdmNatosign() {
  const [geral, setGeral] = useState<GeralType>(INITIAL_GERAL);
  const [dados, setDados] = useState<RelatorioNatosignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const session = useSession();

  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      const [reqGeral, reqLista] = await Promise.all([
        fetch("/api/relatorio-natosign/geral"),
        fetch("/api/relatorio-natosign"),
      ]);
      const [resGeral, resLista] = await Promise.all([
        reqGeral.json(),
        reqLista.json(),
      ]);
      if (!reqGeral.ok) throw new Error(resGeral.message);
      if (!reqLista.ok) throw new Error(resLista.message);
      setGeral(resGeral);
      setDados(resLista);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro",
        description:
          error.message || "Não foi possível carregar as cobranças NatoSign",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  if (session && !session.role?.relatorio) {
    return (
      <Container py={10}>
        <Text>Você não tem acesso às cobranças do NatoSign.</Text>
      </Container>
    );
  }

  return (
    <Container
      maxW={{ base: "100%", sm: "95%", md: "96%", lg: "98%" }}
      py={{ base: 4, md: 5, lg: 6 }}
      px={{ base: 3, sm: 4, md: 5, lg: 6 }}
    >
      <VStack spacing={{ base: 5, md: 6, lg: 8 }} align="stretch" w="full">
        <Flex
          bg="white"
          _dark={{ bg: "gray.800" }}
          borderBottomWidth="2px"
          borderBottomColor="#00713D"
          p={{ base: 4, sm: 5, md: 6 }}
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={{ base: 3, md: 4 }}
          borderRadius={{ base: "md", md: "lg" }}
          shadow={{ base: "sm", md: "md" }}
        >
          <Flex align="center" gap={{ base: 2, md: 3 }}>
            <Box
              p={{ base: 1.5, md: 2 }}
              bg="green.50"
              _dark={{ bg: "green.900" }}
              borderRadius="md"
              display={{ base: "none", sm: "block" }}
            >
              <FaFileSignature size={32} color="#00713D" />
            </Box>
            <Box>
              <Heading
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                color="#023147"
                _dark={{ color: "gray.100" }}
              >
                Financeiro NatoSign
              </Heading>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color="gray.600"
                _dark={{ color: "gray.400" }}
                display={{ base: "none", sm: "block" }}
              >
                Cobrança dos envelopes de assinatura
              </Text>
            </Box>
          </Flex>

          <Flex gap={2} wrap="wrap">
            <Button
              as={Link}
              href="/adm"
              leftIcon={<MdArrowBack />}
              variant="outline"
              size={{ base: "sm", md: "md" }}
            >
              Painel adm
            </Button>
            <ModalAddCobrancaNatosign onCriado={fetchDados} />
          </Flex>
        </Flex>

        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 4 }}
          spacing={{ base: 3, sm: 4, md: 5 }}
          w="full"
        >
          <CardAdmUsuario
            count={geral.envelopes_a_cobrar}
            title={"Envelopes a Cobrar"}
            icon={<MdMail size={24} />}
            loading={loading}
          />
          <CardAdmUsuario
            count={geral.valor_a_cobrar}
            title={"Valor a Cobrar"}
            icon={<LuDollarSign size={24} />}
            loading={loading}
          />
          <CardAdmUsuario
            count={geral.cobrancas_aberto}
            title={"Cobranças em Aberto"}
            icon={<LuDollarSign size={24} />}
            loading={loading}
          />
          <CardAdmUsuario
            count={geral.relatorios}
            title={"Cobranças Geradas"}
            icon={<LuFileText size={24} />}
            loading={loading}
          />
          <CardAdmUsuario
            count={geral.em_analise}
            title={"Em Análise"}
            icon={<MdAnalytics size={24} />}
            loading={loading}
          />
          <CardAdmUsuario
            count={geral.pendente}
            title={"Pendentes"}
            icon={<MdPending size={24} />}
            loading={loading}
          />
          <CardAdmUsuario
            count={geral.aprovado}
            title={"Pagas"}
            icon={<MdCheckCircle size={24} />}
            loading={loading}
          />
        </SimpleGrid>

        <RelatorioNatosign
          dados={dados}
          loading={loading}
          onAtualizar={fetchDados}
          onResultadoPesquisa={setDados}
        />
      </VStack>
    </Container>
  );
}
