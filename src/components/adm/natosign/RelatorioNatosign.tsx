"use client";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CiTrash } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { ImFileExcel, ImFilePdf } from "react-icons/im";
import { MdAssessment, MdSearch } from "react-icons/md";
import { PiCurrencyDollar } from "react-icons/pi";
import { mask } from "remask";

interface Cliente {
  id: number;
  fantasia: string | null;
  razaosocial: string | null;
  cnpj: string | null;
}

export interface RelatorioNatosignItem {
  id: number;
  protocolo: string;
  valorTotal: number;
  total_envelopes: number;
  situacao_pg: number;
  dt_pg: string | null;
  start: string | null;
  end: string | null;
  createdAt: string;
  construtora: Cliente | null;
  financeiro: Cliente | null;
}

interface Props {
  dados: RelatorioNatosignItem[];
  loading: boolean;
  onAtualizar: () => void;
  onResultadoPesquisa: (dados: RelatorioNatosignItem[]) => void;
}

const STATUS = {
  0: { label: "Em análise", bg: "#3B82F6" },
  1: { label: "Pendente", bg: "#F59E0B" },
  2: { label: "Pago", bg: "#059669" },
} as Record<number, { label: string; bg: string }>;

function getStatusTag(status: number) {
  const { label, bg } = STATUS[status] ?? STATUS[0];
  return (
    <Tag bg={bg} color="white" fontWeight="semibold" px={3} py={1}>
      {label}
    </Tag>
  );
}

const formatarData = (data: string | null, comHora = false) => {
  if (!data) return "-";
  const d = new Date(data);
  return comHora
    ? d.toLocaleString("pt-BR")
    : d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const cliente = (item: RelatorioNatosignItem) =>
  item.construtora ?? item.financeiro;

/**
 * Tabela de cobranças NatoSign (por construtora ou CCA)
 * com download, confirmação de cobrança/pagamento e exclusão.
 */
const RelatorioNatosign = memo(function RelatorioNatosign({
  dados,
  loading,
  onAtualizar,
  onResultadoPesquisa,
}: Props) {
  const [busca, setBusca] = useState("");
  const toast = useToast();

  const erro = useCallback(
    (error: any) =>
      toast({
        title: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      }),
    [toast]
  );

  const dadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return dados;
    const numeros = termo.replace(/\D/g, "");
    return dados.filter((item) => {
      const c = cliente(item);
      return (
        item.protocolo.toLowerCase().includes(termo) ||
        c?.fantasia?.toLowerCase().includes(termo) ||
        c?.razaosocial?.toLowerCase().includes(termo) ||
        (numeros && c?.cnpj?.replace(/\D/g, "").includes(numeros))
      );
    });
  }, [busca, dados]);

  const HandleUpdate = useCallback(
    async (id: number, body: object, sucesso: string) => {
      try {
        const response = await fetch(`/api/relatorio-natosign/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        toast({ title: sucesso, status: "success", duration: 3000 });
        onAtualizar();
      } catch (error: any) {
        erro(error);
      }
    },
    [toast, erro, onAtualizar]
  );

  const HandleDelete = useCallback(
    async (id: number) => {
      if (
        !window.confirm(
          "Excluir esta cobrança? Os envelopes voltam para pendente de cobrança."
        )
      )
        return;
      try {
        const response = await fetch(`/api/relatorio-natosign/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        toast({
          title: "Cobrança excluída com sucesso!",
          status: "success",
          duration: 3000,
        });
        onAtualizar();
      } catch (error: any) {
        erro(error);
      }
    },
    [toast, erro, onAtualizar]
  );

  const HandleDownload = useCallback(
    async (protocolo: string, tipo: "pdf" | "xlsx") => {
      try {
        const response = await fetch(
          `/api/relatorio-natosign/doc/${protocolo}/${tipo}`
        );
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || "Erro ao gerar relatório");
        }
        const url = window.URL.createObjectURL(await response.blob());
        const a = document.createElement("a");
        a.href = url;
        a.download = `natosign-${protocolo}.${tipo}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error: any) {
        erro(error);
      }
    },
    [erro]
  );

  const HandleBuscaDetalhada = useCallback(async () => {
    try {
      const response = await fetch(`/api/relatorio-natosign/pesquisa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesquisa: busca }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onResultadoPesquisa(data);
    } catch (error: any) {
      erro(error);
      setBusca("");
    }
  }, [busca, erro, onResultadoPesquisa]);

  const acao = (
    label: string,
    icon: React.ReactElement,
    bg: string,
    hover: string,
    onClick: () => void
  ) => (
    <Tooltip hasArrow label={label} bg="gray.700" color="white">
      <IconButton
        aria-label={label}
        icon={icon}
        bg={bg}
        color="white"
        size="sm"
        onClick={onClick}
        shadow="sm"
        _hover={{ bg: hover, transform: "scale(1.05)", shadow: "md" }}
        transition="all 0.2s"
      />
    </Tooltip>
  );

  return (
    <Box
      bg="white"
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
      borderRadius="xl"
      p={{ base: 4, md: 6 }}
      shadow="md"
      borderWidth="1px"
      borderColor="gray.200"
      w="100%"
    >
      <Flex align="center" gap={2} mb={4}>
        <Box p={2} bg="blue.50" _dark={{ bg: "blue.900" }} borderRadius="md">
          <MdAssessment size={20} color="#3B82F6" />
        </Box>
        <Box flex="1">
          <Heading
            fontSize={{ base: "lg", md: "xl" }}
            color="#023147"
            _dark={{ color: "gray.100" }}
          >
            Cobranças NatoSign
          </Heading>
          <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
            Envelopes concluídos cobrados por construtora ou CCA
          </Text>
        </Box>
      </Flex>

      <Flex
        gap={2}
        mb={4}
        align="center"
        bg="gray.50"
        _dark={{ bg: "gray.900", borderColor: "gray.700" }}
        borderRadius="lg"
        p={4}
        flexWrap="wrap"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <InputGroup maxW="400px" size="sm">
          <InputLeftElement pointerEvents="none">
            <MdSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Filtrar por nome, CNPJ ou protocolo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            bg="white"
            _dark={{ bg: "gray.800", borderColor: "gray.600" }}
            borderColor="gray.300"
            _focus={{ borderColor: "#00713D", boxShadow: "0 0 0 1px #00713D" }}
          />
        </InputGroup>
      </Flex>

      <Box
        overflowX="auto"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        _dark={{ borderColor: "gray.700" }}
      >
        <Table size="sm" variant="simple" minW="900px">
          <Thead bg="gray.50" _dark={{ bg: "gray.900" }}>
            <Tr>
              <Th textAlign="center">ID</Th>
              <Th textAlign="center">Cliente</Th>
              <Th textAlign="center">Cnpj</Th>
              <Th textAlign="center">Protocolo</Th>
              <Th textAlign="center">Período</Th>
              <Th textAlign="center">Envelopes</Th>
              <Th textAlign="center">Valor</Th>
              <Th textAlign="center">Status</Th>
              <Th textAlign="center">Data cadastro</Th>
              <Th textAlign="center">Data pagamento</Th>
              <Th textAlign="center">Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading &&
              [...Array(5)].map((_, index) => (
                <Tr key={index}>
                  {[...Array(11)].map((__, col) => (
                    <Td key={col}>
                      <Skeleton height="16px" />
                    </Td>
                  ))}
                </Tr>
              ))}
            {!loading && dadosFiltrados.length === 0 && (
              <Tr>
                <Td colSpan={11} textAlign="center" color="gray.400" py={12}>
                  {busca ? (
                    <Flex align="center" gap={2} flexDir="column">
                      <Text>
                        Nenhum resultado encontrado. Você quer uma busca
                        detalhada?
                      </Text>
                      <Button
                        bg="blue.500"
                        color="white"
                        size="sm"
                        onClick={HandleBuscaDetalhada}
                      >
                        Buscar
                      </Button>
                    </Flex>
                  ) : (
                    "Nenhuma cobrança NatoSign registrada."
                  )}
                </Td>
              </Tr>
            )}
            {!loading &&
              dadosFiltrados.map((item) => {
                const c = cliente(item);
                return (
                  <Tr
                    key={item.id}
                    borderLeftWidth="3px"
                    borderLeftColor="transparent"
                    transition="all 0.2s"
                    _hover={{
                      borderLeftColor: "#00713D",
                      bg: "gray.50",
                      _dark: { bg: "whiteAlpha.50" },
                    }}
                  >
                    <Td>{item.id}</Td>
                    <Td>
                      <Flex align="center" gap={2}>
                        <Tag size="sm" variant="subtle">
                          {item.construtora ? "Construtora" : "CCA"}
                        </Tag>
                        {c?.fantasia || c?.razaosocial}
                      </Flex>
                    </Td>
                    <Td>{c?.cnpj && mask(c.cnpj, "99.999.999/9999-99")}</Td>
                    <Td>{item.protocolo}</Td>
                    <Td whiteSpace="nowrap">
                      {formatarData(item.start)} a{" "}
                      {item.end ? formatarData(item.end) : "hoje"}
                    </Td>
                    <Td textAlign="center">{item.total_envelopes}</Td>
                    <Td>
                      {item.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </Td>
                    <Td>{getStatusTag(item.situacao_pg)}</Td>
                    <Td>{formatarData(item.createdAt, true)}</Td>
                    <Td>{formatarData(item.dt_pg, true)}</Td>
                    <Td>
                      <Flex gap={2}>
                        {acao("Resumo (PDF)", <ImFilePdf />, "#DC2626", "#B91C1C", () =>
                          HandleDownload(item.protocolo, "pdf")
                        )}
                        {acao("Relatório (XLSX)", <ImFileExcel />, "#059669", "#047857", () =>
                          HandleDownload(item.protocolo, "xlsx")
                        )}
                        {item.situacao_pg !== 2 &&
                          acao("Excluir cobrança", <CiTrash />, "#EF4444", "#DC2626", () =>
                            HandleDelete(item.id)
                          )}
                        {item.situacao_pg === 0 &&
                          acao("Confirmar cobrança", <FaCheck />, "#3B82F6", "#2563EB", () =>
                            HandleUpdate(
                              item.id,
                              { situacao_pg: 1 },
                              "Cobrança autorizada com sucesso!"
                            )
                          )}
                        {item.situacao_pg === 1 &&
                          acao(
                            "Confirmar pagamento",
                            <PiCurrencyDollar />,
                            "#10B981",
                            "#059669",
                            () =>
                              HandleUpdate(
                                item.id,
                                { situacao_pg: 2 },
                                "Pagamento confirmado com sucesso!"
                              )
                          )}
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
});

export default RelatorioNatosign;
