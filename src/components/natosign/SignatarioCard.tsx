// app/(private_route)/natosign/[id]/SignatarioCard.tsx
"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiEdit2, FiSend } from "react-icons/fi";

// Função para formatar o CPF (12345678901 -> 123.456.789-01)
const formatCPF = (cpf: string) => {
  if (!cpf) return "Não informado";
  // Remove qualquer caractere que não seja dígito
  const cleaned = cpf.replace(/\D/g, "");
  // Aplica a máscara
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// 5516999999999 -> (16) 99999-9999
const formatTelefone = (telefone: string) =>
  telefone
    .replace(/\D/g, "")
    .replace(/^55/, "")
    .replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");

// Função para dar cor ao status do signatário
const getSignerStatusBadge = (state: string) => {
  const statusInfo: { [key: string]: { label: string; color: string } } = {
    "in-transit": { label: "Aguardando", color: "yellow" },
    waiting: { label: "Aguardando", color: "yellow" },
    signing: { label: "Assinando", color: "orange" },
    done: { label: "Assinado", color: "green" },
    filled: { label: "Assinado", color: "green" },
    rejected: { label: "Rejeitado", color: "red" },
  };
  const info = statusInfo[state] || { label: state, color: "gray" };
  return (
    <Badge colorScheme={info.color} variant="solid" borderRadius="full" px={3}>
      {info.label}
    </Badge>
  );
};

interface SignatarioCardProps {
  signer: {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    state: string;
    updatedAt: string;
    telefone?: string | null;
    qualificacao?: string | null;
    filled_at?: string | null;
  };
  /** Notificação por WhatsApp ligada no backend */
  whatsappAtivo?: boolean;
  /** Quando informado, mostra o botão de reenvio (signatário pendente) */
  onReenviar?: () => void;
  reenviando?: boolean;
  /** Quando informado, mostra o botão de editar email (somente ADM) */
  onEditarEmail?: () => void;
}

export const SignatarioCard = ({
  signer,
  onReenviar,
  reenviando,
  whatsappAtivo,
  onEditarEmail,
}: SignatarioCardProps) => {
  const comWhatsapp = whatsappAtivo && !!signer.telefone;
  const lastUpdate = new Date(signer.updatedAt).toLocaleString("pt-BR");

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="white"
      shadow="sm"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-2px)",
        shadow: "md",
        borderColor: "#00713D",
      }}
      _dark={{
        bg: "gray.800",
        borderColor: "gray.700",
        _hover: { borderColor: "#00d672" },
      }}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="start" wrap="wrap" gap={2}>
          <HStack spacing={3} flex="1" minW="0">
            <Avatar
              name={signer.nome}
              size="md"
              bg="#00713D"
              color="white"
              _dark={{ bg: "#00d672", color: "gray.900" }}
            />
            <Box flex="1" minW="0">
              <Text
                fontWeight="bold"
                fontSize="md"
                color="#023147"
                _dark={{ color: "gray.100" }}
                noOfLines={1}
              >
                {signer.nome}
              </Text>
              {signer.qualificacao && (
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="#00713D"
                  _dark={{ color: "#00d672" }}
                  noOfLines={2}
                >
                  {signer.qualificacao}
                </Text>
              )}
              <Text
                fontSize="sm"
                color="gray.600"
                _dark={{ color: "gray.400" }}
                noOfLines={1}
              >
                {signer.email}
              </Text>
              {signer.telefone && (
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.400" }}
                  noOfLines={1}
                >
                  {comWhatsapp ? "WhatsApp" : "Celular"}:{" "}
                  {formatTelefone(signer.telefone)}
                </Text>
              )}
            </Box>
          </HStack>
          {getSignerStatusBadge(signer.state)}
        </HStack>

        <Flex
          justify="space-between"
          align="start"
          pt={2}
          borderTopWidth="1px"
          borderTopColor="gray.200"
          _dark={{ borderTopColor: "gray.700" }}
          gap={4}
          wrap="wrap"
        >
          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="gray.600"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={1}
              _dark={{ color: "gray.400" }}
            >
              CPF
            </Text>
            <Text
              fontWeight="medium"
              fontSize="sm"
              color="#023147"
              _dark={{ color: "gray.100" }}
            >
              {formatCPF(signer.cpf)}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="gray.600"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={1}
              _dark={{ color: "gray.400" }}
            >
              Última Atualização
            </Text>
            <Text
              fontWeight="medium"
              fontSize="sm"
              color="#023147"
              _dark={{ color: "gray.100" }}
            >
              {lastUpdate}
            </Text>
          </Box>
        </Flex>

        {onEditarEmail && (
          <Button
            leftIcon={<FiEdit2 />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={onEditarEmail}
          >
            Editar email
          </Button>
        )}

        {onReenviar && (
          <Button
            leftIcon={<FiSend />}
            size="sm"
            variant="outline"
            colorScheme="green"
            onClick={onReenviar}
            isLoading={reenviando}
            loadingText="Reenviando..."
          >
            Reenviar para {comWhatsapp ? "email e WhatsApp" : "email"}
          </Button>
        )}
      </VStack>
    </Box>
  );
};
