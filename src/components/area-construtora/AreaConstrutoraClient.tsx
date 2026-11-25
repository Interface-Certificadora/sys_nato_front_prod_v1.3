"use client";

import ModernDonutChart from "@/components/dashboard/ModernDonutChart";
import ModernStatCard from "@/components/dashboard/ModernStatCard";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Select,
  SimpleGrid,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaCertificate,
  FaCheckCircle,
  FaFileExcel,
  FaFilePdf,
  FaFileSignature,
  FaHourglassHalf,
  FaRegClock,
  FaTimesCircle,
} from "react-icons/fa";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Opcao = { id: number; fantasia: string | null; razaosocial: string };
type Empreendimento = { id: number; nome: string; cidade: string | null };

type Indicadores = {
  periodo: { inicio: string; fim: string };
  construtoras: Opcao[];
  certificacao: {
    criadas: number;
    emitidas: number;
    revogadas: number;
    distratos: number;
    emAndamento: number;
    tempoMedioDias: number | null;
    tempoMedianoDias: number | null;
    porAndamento: { andamento: string; total: number }[];
  };
  envelopes: {
    total: number;
    concluidos: number;
    emAndamento: number;
    cancelados: number;
    expirados: number;
    tempoMedioHoras: number | null;
    porStatus: { status: string; total: number }[];
  };
  serie: {
    mes: string;
    criadas: number;
    emitidas: number;
    envelopes: number;
  }[];
  empreendimentos: {
    id: number;
    nome: string;
    cidade: string | null;
    estado: string | null;
    criadas: number;
    emitidas: number;
    envelopes: number;
    envelopesConcluidos: number;
  }[];
};

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const CORES_STATUS: Record<string, string> = {
  Concluído: "#00713C",
  "Em andamento": "#FB8501",
  Novo: "#F6AD55",
  Cancelado: "#C53030",
  Expirado: "#718096",
};

/** Data de hoje em Brasília no formato AAAA-MM-DD. */
const hoje = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );

const somarDias = (data: string, dias: number) => {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

const PERIODOS: { rotulo: string; calc: () => [string, string] }[] = [
  { rotulo: "Este mês", calc: () => [`${hoje().slice(0, 7)}-01`, hoje()] },
  {
    rotulo: "Mês passado",
    calc: () => {
      const primeiro = `${hoje().slice(0, 7)}-01`;
      const fim = somarDias(primeiro, -1);
      return [`${fim.slice(0, 7)}-01`, fim];
    },
  },
  { rotulo: "90 dias", calc: () => [somarDias(hoje(), -89), hoje()] },
  { rotulo: "Este ano", calc: () => [`${hoje().slice(0, 4)}-01-01`, hoje()] },
];

const nome = (c: Opcao) => c.fantasia || c.razaosocial;
const br = (data: string) => data.split("-").reverse().join("/");

const formatarHoras = (horas: number | null) => {
  if (horas == null) return "—";
  if (horas < 48) return `${horas.toLocaleString("pt-BR")} h`;
  return `${(Math.round((horas / 24) * 10) / 10).toLocaleString("pt-BR")} dias`;
};

function Cartao({
  titulo,
  children,
  h,
}: {
  titulo: string;
  children: React.ReactNode;
  h?: string;
}) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borda = useColorModeValue("gray.100", "gray.700");
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borda}
      borderRadius="24px"
      p={6}
      shadow="sm"
    >
      <Heading size="sm" mb={4}>
        {titulo}
      </Heading>
      <Box h={h}>{children}</Box>
    </Box>
  );
}

interface Props {
  isAdm: boolean;
}

export default function AreaConstrutoraClient({ isAdm }: Props) {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borda = useColorModeValue("gray.100", "gray.700");
  const textoGrafico = useColorModeValue("#4A5568", "#EDF2F7");

  const [construtoras, setConstrutoras] = useState<Opcao[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [construtoraId, setConstrutoraId] = useState("");
  const [empreendimentoId, setEmpreendimentoId] = useState("");
  const [[inicio, fim], setPeriodo] = useState<[string, string]>(
    PERIODOS[0].calc(),
  );
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<string | null>(null);

  const filtros = useMemo(() => {
    const p = new URLSearchParams({ inicio, fim });
    if (construtoraId) p.set("construtoraId", construtoraId);
    if (empreendimentoId) p.set("empreendimentoId", empreendimentoId);
    return p.toString();
  }, [inicio, fim, construtoraId, empreendimentoId]);

  // Construtoras disponíveis (CONST: as dele; ADM: todas)
  useEffect(() => {
    fetch("/api/area-construtora/construtoras")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message);
        setConstrutoras(data);
        if (!isAdm && data.length === 1) setConstrutoraId(String(data[0].id));
      })
      .catch((e) => setErro(e.message || "Erro ao carregar as construtoras"));
  }, [isAdm]);

  // Empreendimentos da construtora escolhida
  useEffect(() => {
    setEmpreendimentoId("");
    if (isAdm && !construtoraId) {
      setEmpreendimentos([]);
      return;
    }
    const q = construtoraId ? `?construtoraId=${construtoraId}` : "";
    fetch(`/api/area-construtora/empreendimentos${q}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setEmpreendimentos)
      .catch(() => setEmpreendimentos([]));
  }, [construtoraId, isAdm]);

  const precisaEscolher = isAdm && !construtoraId;

  const carregar = useCallback(async () => {
    if (precisaEscolher || !inicio || !fim) return;
    setCarregando(true);
    setErro(null);
    try {
      const r = await fetch(`/api/area-construtora/indicadores?${filtros}`);
      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.message || "Erro ao carregar os indicadores");
      setDados(data);
    } catch (e: any) {
      setErro(e.message);
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }, [filtros, precisaEscolher, inicio, fim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const baixar = async (
    tipo: "certificacao" | "envelopes",
    formato: "pdf" | "xlsx",
  ) => {
    const chave = `${tipo}-${formato}`;
    setBaixando(chave);
    try {
      const r = await fetch(
        `/api/area-construtora/relatorio/${tipo}/${formato}?${filtros}`,
      );
      if (!r.ok) {
        const data = await r.json().catch(() => null);
        throw new Error(data?.message || "Erro ao gerar o relatório");
      }
      const blob = await r.blob();
      const disp = r.headers.get("content-disposition") ?? "";
      const arquivo =
        /filename="?([^"]+)"?/.exec(disp)?.[1] ?? `${tipo}.${formato}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = arquivo;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({
        title: e.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBaixando(null);
    }
  };

  const c = dados?.certificacao;
  const env = dados?.envelopes;

  const serieOpcoes: ApexCharts.ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#023147", "#00713C", "#FB8501"],
    stroke: { width: [0, 0, 3], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: (dados?.serie ?? []).map((s) => {
        const [ano, mes] = s.mes.split("-");
        return `${MESES[Number(mes) - 1]}/${ano.slice(2)}`;
      }),
      labels: { style: { colors: textoGrafico } },
    },
    yaxis: { labels: { style: { colors: textoGrafico } } },
    legend: { position: "top", labels: { colors: textoGrafico } },
    grid: { borderColor: "rgba(160,174,192,0.2)" },
    tooltip: { shared: true, intersect: false },
  };
  const serieDados = [
    {
      name: "Solicitações criadas",
      type: "column",
      data: (dados?.serie ?? []).map((s) => s.criadas),
    },
    {
      name: "Certificados emitidos",
      type: "column",
      data: (dados?.serie ?? []).map((s) => s.emitidas),
    },
    {
      name: "Envelopes",
      type: "line",
      data: (dados?.serie ?? []).map((s) => s.envelopes),
    },
  ];

  const botoesRelatorio = (tipo: "certificacao" | "envelopes") => (
    <ButtonGroup size="sm" isDisabled={precisaEscolher}>
      <Button
        leftIcon={<FaFileExcel />}
        colorScheme="green"
        isLoading={baixando === `${tipo}-xlsx`}
        onClick={() => baixar(tipo, "xlsx")}
      >
        Excel
      </Button>
      <Button
        leftIcon={<FaFilePdf />}
        colorScheme="red"
        variant="outline"
        isLoading={baixando === `${tipo}-pdf`}
        onClick={() => baixar(tipo, "pdf")}
      >
        PDF
      </Button>
    </ButtonGroup>
  );

  return (
    <Container maxW="full" py={{ base: 16, md: 10 }} px={{ base: 4, md: 10 }}>
      <VStack spacing={8} align="stretch">
        {/* Cabeçalho */}
        <Box>
          <HStack mb={1} color="#FB8501">
            <Icon as={FaBuilding} />
            <Text fontSize="xs" fontWeight="bold" letterSpacing="widest">
              ÁREA DA CONSTRUTORA
            </Text>
          </HStack>
          <Heading size="lg">
            {dados?.construtoras?.length === 1
              ? nome(dados.construtoras[0])
              : "Indicadores e relatórios"}
          </Heading>
          {dados && (
            <Text color="gray.500" fontSize="sm">
              Período de {br(dados.periodo.inicio)} a {br(dados.periodo.fim)}
            </Text>
          )}
        </Box>

        {/* Filtros */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borda}
          borderRadius="24px"
          p={5}
        >
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
            {(isAdm || construtoras.length > 1) && (
              <FormControl>
                <FormLabel fontSize="sm">Construtora</FormLabel>
                <Select
                  value={construtoraId}
                  onChange={(e) => setConstrutoraId(e.target.value)}
                  placeholder={
                    isAdm ? "Escolha a construtora" : "Todas as minhas"
                  }
                >
                  {construtoras.map((op) => (
                    <option key={op.id} value={op.id}>
                      {nome(op)}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl>
              <FormLabel fontSize="sm">Empreendimento</FormLabel>
              <Select
                value={empreendimentoId}
                onChange={(e) => setEmpreendimentoId(e.target.value)}
                placeholder="Todos"
                isDisabled={precisaEscolher}
              >
                {empreendimentos.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">De</FormLabel>
              <Input
                type="date"
                value={inicio}
                max={fim}
                onChange={(e) => setPeriodo([e.target.value, fim])}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Até</FormLabel>
              <Input
                type="date"
                value={fim}
                min={inicio}
                max={hoje()}
                onChange={(e) => setPeriodo([inicio, e.target.value])}
              />
            </FormControl>
          </SimpleGrid>
          <Flex mt={4} gap={2} wrap="wrap">
            {PERIODOS.map((p) => (
              <Button
                key={p.rotulo}
                size="xs"
                variant="outline"
                onClick={() => setPeriodo(p.calc())}
              >
                {p.rotulo}
              </Button>
            ))}
          </Flex>
        </Box>

        {precisaEscolher && (
          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            Escolha uma construtora para ver os indicadores e gerar os
            relatórios.
          </Alert>
        )}
        {erro && (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            {erro}
          </Alert>
        )}

        {!precisaEscolher && (
          <>
            {/* Certificação */}
            <Box>
              <Flex
                justify="space-between"
                align="center"
                mb={3}
                wrap="wrap"
                gap={2}
              >
                <Heading size="md">Certificação</Heading>
                <HStack>
                  <Text fontSize="sm" color="gray.500">
                    Relatório de movimentação:
                  </Text>
                  {botoesRelatorio("certificacao")}
                </HStack>
              </Flex>
              <Skeleton isLoaded={!carregando && !!c} borderRadius="24px">
                <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
                  <ModernStatCard
                    title="Solicitações criadas"
                    value={c?.criadas ?? 0}
                    icon={FaFileSignature}
                  />
                  <ModernStatCard
                    title="Certificados emitidos"
                    value={c?.emitidas ?? 0}
                    icon={FaCertificate}
                  />
                  <ModernStatCard
                    title="Ainda em andamento"
                    value={c?.emAndamento ?? 0}
                    icon={FaHourglassHalf}
                    isWarning
                    trend="das criadas no período"
                  />
                  <ModernStatCard
                    title="Tempo médio até emitir"
                    value={
                      c?.tempoMedioDias != null
                        ? `${c.tempoMedioDias.toLocaleString("pt-BR")} dias`
                        : "—"
                    }
                    icon={FaRegClock}
                    trend={
                      c?.tempoMedianoDias != null
                        ? `mediana ${c.tempoMedianoDias} d`
                        : undefined
                    }
                  />
                </SimpleGrid>
                <HStack mt={3} spacing={3}>
                  <Badge colorScheme="red" px={2} py={1} borderRadius="md">
                    {c?.distratos ?? 0} distratos
                  </Badge>
                  <Badge colorScheme="gray" px={2} py={1} borderRadius="md">
                    {c?.revogadas ?? 0} revogados
                  </Badge>
                </HStack>
              </Skeleton>
            </Box>

            {/* Envelopes */}
            <Box>
              <Flex
                justify="space-between"
                align="center"
                mb={3}
                wrap="wrap"
                gap={2}
              >
                <Heading size="md">Envelopes NatoSign</Heading>
                <HStack>
                  <Text fontSize="sm" color="gray.500">
                    Relatório de movimentação:
                  </Text>
                  {botoesRelatorio("envelopes")}
                </HStack>
              </Flex>
              <Skeleton isLoaded={!carregando && !!env} borderRadius="24px">
                <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
                  <ModernStatCard
                    title="Envelopes enviados"
                    value={env?.total ?? 0}
                    icon={FaFileSignature}
                  />
                  <ModernStatCard
                    title="Concluídos"
                    value={env?.concluidos ?? 0}
                    icon={FaCheckCircle}
                  />
                  <ModernStatCard
                    title="Em andamento"
                    value={env?.emAndamento ?? 0}
                    icon={FaHourglassHalf}
                    isWarning
                  />
                  <ModernStatCard
                    title="Cancelados / expirados"
                    value={(env?.cancelados ?? 0) + (env?.expirados ?? 0)}
                    icon={FaTimesCircle}
                    isWarning
                    trend={`conclusão média ${formatarHoras(env?.tempoMedioHoras ?? null)}`}
                  />
                </SimpleGrid>
              </Skeleton>
            </Box>

            {/* Gráficos */}
            <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={4}>
              <Box gridColumn={{ xl: "span 3" }}>
                <Cartao titulo="Últimos 12 meses" h="320px">
                  {dados && (
                    <Chart
                      options={serieOpcoes}
                      series={serieDados}
                      type="line"
                      height="100%"
                    />
                  )}
                </Cartao>
              </Box>
              <Cartao titulo="Solicitações criadas por andamento" h="300px">
                {c && c.porAndamento.length ? (
                  <ModernDonutChart
                    labels={c.porAndamento.map((a) => a.andamento)}
                    dataValues={c.porAndamento.map((a) => a.total)}
                    colors={[
                      "#00713C",
                      "#023147",
                      "#FB8501",
                      "#3182CE",
                      "#805AD5",
                      "#C53030",
                      "#718096",
                      "#D69E2E",
                    ]}
                  />
                ) : (
                  <Text color="gray.500">Sem solicitações no período.</Text>
                )}
              </Cartao>
              <Cartao titulo="Envelopes por status" h="300px">
                {env && env.porStatus.length ? (
                  <ModernDonutChart
                    labels={env.porStatus.map((s) => s.status)}
                    dataValues={env.porStatus.map((s) => s.total)}
                    colors={env.porStatus.map(
                      (s) => CORES_STATUS[s.status] ?? "#A0AEC0",
                    )}
                  />
                ) : (
                  <Text color="gray.500">Sem envelopes no período.</Text>
                )}
              </Cartao>
              <Cartao titulo="Destaques do período">
                <VStack align="stretch" spacing={3} fontSize="sm">
                  <Flex justify="space-between">
                    <Text color="gray.500">Taxa de emissão</Text>
                    <Text fontWeight="bold">
                      {c && c.criadas
                        ? `${Math.round((c.emitidas / c.criadas) * 100)}%`
                        : "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.500">Envelopes concluídos</Text>
                    <Text fontWeight="bold">
                      {env && env.total
                        ? `${Math.round((env.concluidos / env.total) * 100)}%`
                        : "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.500">Empreendimentos com movimento</Text>
                    <Text fontWeight="bold">
                      {dados?.empreendimentos.length ?? 0}
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="gray.500">
                    Taxa de emissão = emitidos ÷ criados no período (os emitidos
                    podem ter sido criados antes).
                  </Text>
                </VStack>
              </Cartao>
            </SimpleGrid>

            {/* Por empreendimento */}
            <Cartao titulo="Por empreendimento">
              {dados && dados.empreendimentos.length ? (
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Empreendimento</Th>
                        <Th>Cidade</Th>
                        <Th isNumeric>Solicitações</Th>
                        <Th isNumeric>Emitidos</Th>
                        <Th isNumeric>Envelopes</Th>
                        <Th isNumeric>Env. concluídos</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dados.empreendimentos.map((emp) => (
                        <Tr key={emp.id}>
                          <Td fontWeight="medium">{emp.nome}</Td>
                          <Td>
                            {[emp.cidade, emp.estado]
                              .filter(Boolean)
                              .join(" / ")}
                          </Td>
                          <Td isNumeric>{emp.criadas}</Td>
                          <Td isNumeric>{emp.emitidas}</Td>
                          <Td isNumeric>{emp.envelopes}</Td>
                          <Td isNumeric>{emp.envelopesConcluidos}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Text color="gray.500">
                  {carregando ? "Carregando..." : "Sem movimento no período."}
                </Text>
              )}
            </Cartao>
          </>
        )}
      </VStack>
    </Container>
  );
}
