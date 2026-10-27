"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiDownload,
  FiExternalLink,
  FiRefreshCw,
  FiSend,
  FiSlash,
} from "react-icons/fi";
import { SignatarioCard } from "./SignatarioCard";
import { PDFViewer } from "./PDFViewer";

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
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
      {label}
    </Text>
    <Text
      fontSize="md"
      fontWeight="medium"
      color="#023147"
      _dark={{ color: "gray.100" }}
    >
      {value}
    </Text>
  </Box>
);

const getStatusBadge = (status: string, statusView: string) => {
  const statusColors: { [key: string]: string } = {
    new: "blue",
    done: "green",
    signing: "orange",
    rejected: "red",
    failed: "red",
  };
  return (
    <Badge
      colorScheme={statusColors[status] || "gray"}
      px={3}
      py={1}
      borderRadius="full"
      textTransform="capitalize"
    >
      {statusView}
    </Badge>
  );
};

type EnvelopeType = {
  UUID: string;
  ativo: boolean;
  background_sheet: string;
  cca: {
    id: number;
    cnpj: string;
    razaosocial: string;
    fantasia: string;
    tel: string;
  };
  cca_id: number;
  construtora_id: number;
  construtora: {
    id: number;
    cnpj: string;
    razaosocial: string;
    fantasia: string;
    tel: string;
  };
  empreendimento_id?: number;
  empreendimento?: {
    id: number;
    nome: string;
    cidade?: string;
    estado?: string;
  };
  createdAt: string;
  description: string;
  doc_modificado_down: string;
  doc_modificado_viw: string;
  doc_original_down: string;
  doc_original_viw: string;
  hash: string;
  id: number;
  message: string;
  original_name: string;
  public_link: string;
  signatarios: any[];
  status: string;
  status_pg: string;
  status_view: string;
  title: string;
  type: string;
  updatedAt: string;
  user_id: number;
  valor: number;
  /** Notificação por WhatsApp ligada no backend */
  whatsapp?: boolean;
  /** Cancelado só no SisNato; null quando ativo */
  cancelado_em?: string | null;
  cancelado_por?: string | null;
  motivo_cancelamento?: string | null;
};

interface NatosignViewClientProps {
  envelope: EnvelopeType;
  /** ADM ou permissão "Pode cancelar envelopes" */
  podeCancelar?: boolean;
}

export default function NatosignViewClient({
  envelope,
  podeCancelar,
}: NatosignViewClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // "todos" ou o id do signatário que está sendo reenviado
  const [reenviando, setReenviando] = useState<number | "todos" | null>(null);
  const modalCancelar = useDisclosure();
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const cancelado = !!envelope.cancelado_em;

  const handleCancelar = async () => {
    setCancelando(true);
    try {
      const response = await fetch(`/api/intelesign/cancelar/${envelope.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: motivo.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Não foi possível cancelar.");
      }
      toast({
        title: "Envelope cancelado",
        status: "success",
        isClosable: true,
      });
      modalCancelar.onClose();
      setMotivo("");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    } finally {
      setCancelando(false);
    }
  };

  const handleReenviar = async (signatarioId?: number) => {
    setReenviando(signatarioId ?? "todos");
    try {
      const response = await fetch(`/api/intelesign/reenviar/${envelope.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signatarioId ? { signatarioId } : {}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Não foi possível reenviar.");
      }
      toast({
        title: "Notificação reenviada!",
        description: data?.message,
        status: "success",
        isClosable: true,
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    } finally {
      setReenviando(null);
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/intelesign/status/${envelope.id}`);
      if (!response.ok) {
        throw new Error("Falha ao buscar atualização de status.");
      }
      toast({
        title: "Status Atualizado!",
        description: "Os dados do envelope foram sincronizados.",
        status: "success",
        isClosable: true,
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Falha ao baixar o arquivo.");
      }

      // Obter o ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // Detectar o tipo de arquivo pelos bytes iniciais (magic numbers)
      const uint8Array = new Uint8Array(arrayBuffer);
      let mimeType = "application/octet-stream";
      let extension = "";

      // Verificar assinatura do arquivo
      if (uint8Array[0] === 0x50 && uint8Array[1] === 0x4b) {
        // ZIP file (50 4B)
        mimeType = "application/zip";
        extension = ".zip";
      } else if (
        uint8Array[0] === 0x25 &&
        uint8Array[1] === 0x50 &&
        uint8Array[2] === 0x44 &&
        uint8Array[3] === 0x46
      ) {
        // PDF file (25 50 44 46 = %PDF)
        mimeType = "application/pdf";
        extension = ".pdf";
      } else {
        // Tentar obter do Content-Type do response
        const contentType = response.headers.get("content-type");
        if (contentType) {
          mimeType = contentType;
          if (contentType.includes("pdf")) extension = ".pdf";
          else if (contentType.includes("zip")) extension = ".zip";
        }
      }

      // Garantir que o filename tenha a extensão correta
      let finalFilename = filename;
      if (extension && !filename.toLowerCase().endsWith(extension)) {
        // Remove extensão incorreta se existir
        finalFilename = filename.replace(/\.(pdf|zip)$/i, "") + extension;
      }

      // Criar blob com o tipo correto
      const blob = new Blob([arrayBuffer], { type: mimeType });

      // Criar URL temporária para o blob
      const downloadUrl = window.URL.createObjectURL(blob);

      // Criar e clicar no link de download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = finalFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Limpar após um pequeno delay para garantir que o download iniciou
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);

      toast({
        title: "Download Iniciado!",
        description: `Baixando ${finalFilename}`,
        status: "success",
        isClosable: true,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao baixar",
        description: error.message || "Não foi possível baixar o arquivo.",
        status: "error",
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const signatarios = envelope.signatarios || [];
  const createdAtFormatted = new Date(envelope.createdAt).toLocaleString(
    "pt-BR"
  );
  const updatedAtFormatted = new Date(envelope.updatedAt).toLocaleString(
    "pt-BR"
  );
  // O manifesto já lista todos como assinantes desde o envio, então o
  // documento assinado só é liberado depois que todos concluem
  const concluido =
    envelope.status === "done" || envelope.status === "completed";
  const pdfUrl = concluido
    ? envelope.doc_modificado_viw || envelope.doc_original_viw
    : envelope.doc_original_viw;

  // Reenvio só faz sentido com o envelope enviado e aguardando assinatura
  // (rascunho ainda não foi enviado a ninguém)
  const envelopePendente =
    !cancelado &&
    ![
      "draft",
      "new",
      "done",
      "completed",
      "rejected",
      "failed",
      "expired",
    ].includes(envelope.status);
  const signatarioPendente = (signer: any) =>
    !["done", "filled", "rejected"].includes(signer.state) && !signer.filled_at;
  const temPendentes = envelopePendente && signatarios.some(signatarioPendente);

  return (
    <VStack spacing={{ base: 5, md: 6 }} align="stretch" w="full">
      {/* Header com ação */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={4}
        pb={4}
        borderBottomWidth="1px"
        borderBottomColor="gray.200"
        _dark={{ borderBottomColor: "gray.700" }}
      >
        <HStack spacing={3}>
          <Heading size="md" color="#023147" _dark={{ color: "gray.100" }}>
            Detalhes do Envelope
          </Heading>
          {cancelado && (
            <Badge
              bg="#DC2626"
              color="white"
              px={3}
              py={1}
              borderRadius="md"
              fontSize="sm"
            >
              <HStack spacing={1}>
                <FiSlash />
                <span>Cancelado</span>
              </HStack>
            </Badge>
          )}
        </HStack>
        <Flex gap={2} wrap="wrap">
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={handleUpdateStatus}
            isLoading={isUpdating}
            size={{ base: "sm", md: "md" }}
            colorScheme="green"
            bg="#00713D"
            _hover={{ bg: "#005a31" }}
            _dark={{
              bg: "#00d672",
              color: "gray.900",
              _hover: { bg: "#00c060" },
            }}
          >
            Sincronizar Status
          </Button>
          {temPendentes && (
            <Button
              leftIcon={<FiSend />}
              onClick={() => handleReenviar()}
              isLoading={reenviando === "todos"}
              loadingText="Reenviando..."
              isDisabled={reenviando !== null && reenviando !== "todos"}
              size={{ base: "sm", md: "md" }}
              variant="outline"
              colorScheme="green"
            >
              Reenviar para pendentes
            </Button>
          )}
          {!cancelado && podeCancelar && (
            <Button
              leftIcon={<FiSlash />}
              onClick={modalCancelar.onOpen}
              size={{ base: "sm", md: "md" }}
              variant="outline"
              colorScheme="red"
            >
              Cancelar envelope
            </Button>
          )}
        </Flex>
      </Flex>

      {cancelado && (
        <Alert
          status="error"
          variant="left-accent"
          borderRadius="lg"
          alignItems="flex-start"
        >
          <AlertIcon mt={1} />
          <Box>
            <AlertTitle fontSize="lg">Envelope cancelado</AlertTitle>
            <AlertDescription display="block">
              Cancelado em{" "}
              {new Date(envelope.cancelado_em!).toLocaleString("pt-BR")}
              {envelope.cancelado_por && ` por ${envelope.cancelado_por}`}.
              {envelope.motivo_cancelamento && (
                <Text mt={1}>
                  <b>Motivo:</b> {envelope.motivo_cancelamento}
                </Text>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Modal
        isOpen={modalCancelar.isOpen}
        onClose={modalCancelar.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Cancelar envelope?</ModalHeader>
          <ModalCloseButton isDisabled={cancelando} />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>
                O envelope <b>{envelope.title}</b> ficará marcado como cancelado
                e não poderá mais ser reenviado. Esta ação não pode ser
                desfeita.
              </Text>
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />O cancelamento vale só no SisNato. A Intellisign
                não é avisada, então quem já recebeu o link ainda consegue
                assinar por lá.
              </Alert>
              <FormControl>
                <FormLabel>Motivo (opcional)</FormLabel>
                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex.: contrato enviado com dados errados"
                  maxLength={500}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              onClick={modalCancelar.onClose}
              isDisabled={cancelando}
            >
              Voltar
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FiSlash />}
              onClick={handleCancelar}
              isLoading={cancelando}
              loadingText="Cancelando..."
            >
              Cancelar envelope
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Informações principais */}
      <Box
        bg="gray.50"
        p={{ base: 4, md: 6 }}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        _dark={{ bg: "gray.900", borderColor: "gray.700" }}
      >
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <InfoItem label="ID" value={envelope.id} />
          <InfoItem label="UUID" value={envelope.UUID} />
          <InfoItem label="Nome do Arquivo" value={envelope.original_name} />
          <InfoItem
            label="Construtora"
            value={envelope.construtora?.fantasia || "Não informada"}
          />
          <InfoItem
            label="Financeira (CCA)"
            value={envelope.cca?.fantasia || "Não informada"}
          />
          <InfoItem
            label="Empreendimento"
            value={envelope.empreendimento?.nome || "Não informado"}
          />
          <InfoItem label="Data de Criação" value={createdAtFormatted} />
          <InfoItem label="Última Atualização" value={updatedAtFormatted} />
          <InfoItem label="Status do Pagamento" value={envelope.status_pg} />
        </SimpleGrid>
      </Box>

      {/* Documentos */}
      <Box>
        <Heading size="sm" mb={4} color="#023147" _dark={{ color: "gray.100" }}>
          Documentos
        </Heading>
        <Flex gap={3} wrap="wrap">
          <Button
            onClick={() =>
              window.open(
                envelope.public_link || envelope.doc_modificado_viw,
                "_blank"
              )
            }
            leftIcon={<FiExternalLink />}
            size={{ base: "sm", md: "md" }}
            colorScheme="blue"
            bg="#3B82F6"
            _hover={{ bg: "#2563EB" }}
            isDisabled={!concluido || !envelope.doc_modificado_viw}
          >
            Visualizar
          </Button>
          <Button
            onClick={() => window.open(envelope.doc_modificado_down, "_blank")}
            leftIcon={<FiDownload />}
            size={{ base: "sm", md: "md" }}
            colorScheme="green"
            bg="#00713D"
            _hover={{ bg: "#005a31" }}
            _dark={{
              bg: "#00d672",
              color: "gray.900",
              _hover: { bg: "#00c060" },
            }}
            isDisabled={!concluido || !envelope.doc_modificado_down}
            isLoading={isDownloading}
            loadingText="Baixando..."
          >
            Baixar Assinado
          </Button>
          <Button
            onClick={() => window.open(envelope.background_sheet, "_blank")}
            leftIcon={<FiDownload />}
            size={{ base: "sm", md: "md" }}
            colorScheme="green"
            bg="#00713D"
            _hover={{ bg: "#005a31" }}
            _dark={{
              bg: "#00d672",
              color: "gray.900",
              _hover: { bg: "#00c060" },
            }}
            isDisabled={!concluido || !envelope.background_sheet}
            isLoading={isDownloading}
            loadingText="Baixando..."
          >
            Baixar Logs
          </Button>
          <Button
            onClick={() =>
              handleDownload(
                envelope.doc_original_down,
                `${envelope.original_name}_original`
              )
            }
            leftIcon={<FiDownload />}
            size={{ base: "sm", md: "md" }}
            variant="outline"
            colorScheme="gray"
            borderColor="gray.300"
            _dark={{ borderColor: "gray.600" }}
            isLoading={isDownloading}
            loadingText="Baixando..."
          >
            Baixar Original
          </Button>
        </Flex>
        {!concluido && (
          <Text
            mt={3}
            fontSize="sm"
            color="gray.600"
            _dark={{ color: "gray.400" }}
          >
            O documento assinado, a visualização e os logs ficam disponíveis
            quando todos os signatários concluírem a assinatura.
          </Text>
        )}
      </Box>

      {/* Signatários */}
      <Box>
        <Heading size="sm" mb={4} color="#023147" _dark={{ color: "gray.100" }}>
          Signatários
        </Heading>
        {signatarios.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {signatarios.map((signer: any) => (
              <SignatarioCard
                key={signer.id}
                signer={signer}
                reenviando={reenviando === signer.id}
                whatsappAtivo={!!envelope.whatsapp}
                onReenviar={
                  envelopePendente && signatarioPendente(signer)
                    ? () => handleReenviar(signer.id)
                    : undefined
                }
              />
            ))}
          </SimpleGrid>
        ) : (
          <Flex
            w="full"
            minH="150px"
            justifyContent="center"
            alignItems="center"
            bg="gray.50"
            _dark={{ bg: "gray.900" }}
            borderRadius="lg"
            p={8}
          >
            <Text fontSize="md" color="gray.600" _dark={{ color: "gray.400" }}>
              Nenhum signatário associado.
            </Text>
          </Flex>
        )}
      </Box>

      {/* Pré-visualização do PDF */}
      <Box>
        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
          <Heading size="sm" color="#023147" _dark={{ color: "gray.100" }}>
            {concluido
              ? "Pré-visualização do Documento"
              : "Pré-visualização do Documento Original"}
          </Heading>
          {pdfUrl && (
            <Button
              as={Link}
              href={pdfUrl}
              isExternal
              size="sm"
              leftIcon={<FiExternalLink />}
              colorScheme="blue"
              variant="outline"
            >
              Abrir em nova aba
            </Button>
          )}
        </Flex>
        {pdfUrl ? (
          <PDFViewer fileUrl={pdfUrl} />
        ) : (
          <Flex
            w="full"
            minH="200px"
            justify="center"
            align="center"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            bg="gray.50"
            _dark={{
              bg: "gray.900",
              borderColor: "gray.700",
            }}
          >
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
              Nenhum documento disponível para pré-visualização.
            </Text>
          </Flex>
        )}
      </Box>
    </VStack>
  );
}
