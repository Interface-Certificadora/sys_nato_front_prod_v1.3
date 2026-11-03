"use client";
import Alertas from "@/components/adm/alertas";
import CardAdmUsuario from "@/components/adm/card";

import RelatorioFinanceiro from "@/components/adm/financeiro/RelatorioFinanceiro";
import ModalAddAlerta from "@/components/adm/modal/add_alerta";
import ModalAddCobranca from "@/components/adm/modal/add_cobranca";
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
import { useEffect, useState, useCallback } from "react";
import { FaFileSignature } from "react-icons/fa";
import { LuDollarSign, LuFileText } from "react-icons/lu";
import { 
  MdDashboard, 
  MdCheckCircle, 
  MdPending, 
  MdAnalytics, 
  MdMail 
} from "react-icons/md";

interface RelatorioType {
  relatorios: number;
  cobrancas_aberto: string;
  aprovado: number;
  em_analise: number;
  envelopes: number;
  pendente: number;
}

const INITIAL_RELATORIO: RelatorioType = {
  relatorios: 0,
  aprovado: 0,
  pendente: 0,
  em_analise: 0,
  cobrancas_aberto: "R$ 0,00",
  envelopes: 0,
};

export default function AdmSwitch() {
  const [dados, setDados] = useState<RelatorioType>(INITIAL_RELATORIO);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const session = useSession();

  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      const req = await fetch("/api/relatorio/getall");
      const res = await req.json();
      setDados(res);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchDados();
    
    // Timeout de 4 segundos - se não carregar, define valores padrão
    const timeout = setTimeout(() => {
      setDados((currentDados) => {
        if (!currentDados) {
          setLoading(false);
          return {
            relatorios: 0,
            aprovado: 0,
            pendente: 0,
            em_analise: 0,
            cobrancas_aberto: "R$ 0,00",
            envelopes: 0,
          };
        }
        return currentDados;
      });
    }, 4000);

    return () => clearTimeout(timeout);
  }, [fetchDados]);

  return (
    <Container 
      maxW={{ base: "100%", sm: "95%", md: "96%", lg: "98%" }} 
      py={{ base: 4, md: 5, lg: 6 }} 
      px={{ base: 3, sm: 4, md: 5, lg: 6 }}
    >
      <VStack spacing={{ base: 5, md: 6, lg: 8 }} align="stretch" w="full">
        {/* Cabeçalho da Página */}
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
                <MdDashboard
                  size={32}
                  color="#00713D"
                />
              </Box>
              <Box>
                <Heading
                  fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                  color="#023147"
                  _dark={{ color: "gray.100" }}
                >
                  Painel Administrativo
                </Heading>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color="gray.600"
                  _dark={{ color: "gray.400" }}
                  display={{ base: "none", sm: "block" }}
                >
                  Visão geral do sistema
                </Text>
              </Box>
            </Flex>

            {session?.role.relatorio && (
              <Flex gap={2} wrap="wrap">
                <Button
                  as={Link}
                  href="/adm/natosign"
                  leftIcon={<FaFileSignature />}
                  variant="outline"
                  colorScheme="green"
                  size={{ base: "sm", md: "md" }}
                >
                  Financeiro NatoSign
                </Button>
                <ModalAddCobranca />
                <ModalAddAlerta />
              </Flex>
            )}
          </Flex>

          {session?.role.relatorio && (
            <>
              {/* Cards e Alertas lado a lado */}
              <Flex
                direction={{ base: "column", lg: "row" }}
                gap={{ base: 5, md: 6 }}
                w="full"
                align="flex-start"
              >
                {/* Grid de Cards (3x2) */}
                <Box 
                  flex="1" 
                  minW={{ base: "100%", lg: "0" }}
                  w="full"
                >
                  <SimpleGrid
                    columns={{ base: 1, sm: 2, lg: 3 }}
                    spacing={{ base: 3, sm: 4, md: 5 }}
                    w="full"
                  >
                    <CardAdmUsuario
                      count={dados.relatorios}
                      title={"Relatórios Gerados"}
                      icon={<LuFileText size={24} />}
                      loading={loading}
                    />
                    <CardAdmUsuario
                      count={dados.cobrancas_aberto}
                      title={"Cobranças em Aberto"}
                      icon={<LuDollarSign size={24} />}
                      loading={loading}
                    />
                    <CardAdmUsuario
                      count={dados.envelopes}
                      title={"Envelopes Criados"}
                      icon={<MdMail size={24} />}
                      loading={loading}
                    />
                    <CardAdmUsuario
                      count={dados.em_analise}
                      title={"Relatórios Em Análise"}
                      icon={<MdAnalytics size={24} />}
                      loading={loading}
                    />
                    <CardAdmUsuario
                      count={dados.pendente}
                      title={"Relatórios Pendente"}
                      icon={<MdPending size={24} />}
                      loading={loading}
                    />
                    <CardAdmUsuario
                      count={dados.aprovado}
                      title={"Relatórios Aprovados"}
                      icon={<MdCheckCircle size={24} />}
                      loading={loading}
                    />
                  </SimpleGrid>
                </Box>

                {/* Alertas na lateral */}
                <Box 
                  w={{ base: "100%", lg: "380px", xl: "400px" }} 
                  minW={{ lg: "350px" }}
                  maxW={{ base: "100%", lg: "420px" }}
                  flexShrink={0}
                >
                  <Alertas />
                </Box>
              </Flex>

              {/* Tabela de Relatórios (largura total) */}
              <Box 
                w="full"
                overflowX="auto"
                sx={{
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '4px',
                  },
                }}
              >
                <RelatorioFinanceiro onAtualizar={fetchDados} />
              </Box>
            </>
          )}
      </VStack>
    </Container>
  );
}
