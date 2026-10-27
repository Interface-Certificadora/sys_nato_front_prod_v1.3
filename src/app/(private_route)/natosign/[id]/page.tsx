export const dynamic = "force-dynamic";

import { GetSessionServer } from "@/lib/auth_confg";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { notFound, redirect } from "next/navigation";
import { FaFileContract } from "react-icons/fa";
import NatosignViewClient from "@/components/natosign/NatosignViewClient";

interface Props {
  params: {
    id: string;
  };
}

/**
 * Busca os dados de um envelope específico na API
 */
const requestData = async (id: number, token: string | undefined) => {
  if (!token) {
    return { error: true, message: "Não autorizado", data: null, status: 401 };
  }
  const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/intelesign/${id}`;

  const request = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!request.ok) {
    return {
      error: true,
      message: "Envelope não encontrado",
      data: null,
      status: request.status,
    };
  }

  const data = await request.json();

  return {
    error: false,
    message: "Envelope encontrado",
    data: data,
    status: request.status,
  };
};

/**
 * Retorna o badge de status do envelope
 */
const getStatusBadge = (status: string) => {
  const statusConfig: { [key: string]: { label: string; colorScheme: string } } = {
    new: { label: "Novo", colorScheme: "blue" },
    done: { label: "Finalizado", colorScheme: "green" },
    signing: { label: "Assinando", colorScheme: "orange" },
    waiting: { label: "Aguardando", colorScheme: "yellow" },
    rejected: { label: "Rejeitado", colorScheme: "red" },
    failed: { label: "Falhou", colorScheme: "red" },
  };

  const config = statusConfig[status] || { label: status, colorScheme: "gray" };
  return config;
};

export default async function NatosignView({ params }: Props) {
  const { id } = params;
  const session = await GetSessionServer();
  const res = await requestData(+id, session?.token);

  // Validação de acesso
  if (session?.user?.hierarquia !== "ADM" && !session?.user?.role?.natosign) {
    redirect("/home");
  }

  // Validação de dados
  if (res.error || !res.data) {
    return notFound();
  }

  const envelope = res.data;
  const statusConfig = getStatusBadge(envelope.status);

  return (
    <Container
      maxW={{ base: "100%", sm: "95%", md: "96%", lg: "98%" }}
      py={{ base: 4, md: 5, lg: 6 }}
      px={{ base: 3, sm: 4, md: 5, lg: 6 }}
    >
      <VStack spacing={{ base: 5, md: 6, lg: 8 }} align="stretch" w="full">
        {/* Cabeçalho */}
        <Flex
          bg="white"
          _dark={{ bg: "gray.800", borderBottomColor: "#00d672" }}
          borderBottomWidth="2px"
          borderBottomColor="#00713D"
          p={{ base: 4, sm: 5, md: 6 }}
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={{ base: 3, md: 4 }}
          borderRadius={{ base: "md", md: "lg", xl: "xl" }}
          borderBottomRadius={0}
          shadow={{ base: "sm", md: "md", lg: "lg" }}
          flexDir={{ base: "column", md: "row" }}
        >
          {/* Título com ícone */}
          <Flex align="center" gap={{ base: 2, md: 3 }}>
            <Box
              p={{ base: 1.5, md: 2 }}
              bg="green.50"
              _dark={{ bg: "green.900" }}
              borderRadius="md"
              display={{ base: "none", sm: "block" }}
            >
              <FaFileContract size={32} color="#00713D" />
            </Box>
            <Box>
              <Flex align="center" gap={3} wrap="wrap">
                <Heading
                  fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                  size={{ base: "md", md: "lg" }}
                  color="#023147"
                  _dark={{ color: "gray.100" }}
                >
                  Envelope #{envelope.id}
                </Heading>
                <Badge
                  colorScheme={statusConfig.colorScheme}
                  fontSize={{ base: "xs", md: "sm" }}
                  px={3}
                  py={1}
                  borderRadius="md"
                  textTransform="capitalize"
                >
                  {envelope.status_view || statusConfig.label}
                </Badge>
              </Flex>
              <Text
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                color="gray.600"
                _dark={{ color: "gray.400" }}
                display={{ base: "none", sm: "block" }}
              >
                Detalhes e informações do envelope de assinatura digital
              </Text>
            </Box>
          </Flex>
        </Flex>

        {/* Área de Conteúdo */}
        <Box
          bg="white"
          _dark={{ bg: "gray.800" }}
          p={{ base: 4, md: 6 }}
          borderRadius="xl"
          borderTopRadius={0}
          shadow="lg"
          minH="400px"
        >
          <NatosignViewClient
            envelope={envelope}
            podeCancelar={
              session?.user?.hierarquia === "ADM" ||
              !!session?.user?.role?.natosign_cancelar
            }
          />
        </Box>
      </VStack>
    </Container>
  );
}
