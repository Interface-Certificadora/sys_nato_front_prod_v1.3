"use client";
import {
  getEmpreendimentosAction,
  getEmpreendimentoFilterOptions,
} from "@/actions/empreendimento/service/empreendimento";
import Empreendimentos from "@/components/empreendimentoCard";
import { ModalCriarEmpreendimento } from "@/components/modal/ModalCriarEmpreendimento";
import { EmpreedimentoType } from "@/types/empreendimentos_fidAll";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
  useToast,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import {
  MdAdd,
  MdApartment,
  MdBadge,
  MdChevronLeft,
  MdChevronRight,
  MdSearch,
} from "react-icons/md";

interface MetaData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserProviderProps {
  dados: {
    data: EmpreedimentoType[];
    meta: MetaData;
  };
}

export default function EmpreendimentoPageClient({ dados }: UserProviderProps) {
  const [empreendimentos, setEmpreendimentos] = useState<EmpreedimentoType[]>(
    dados?.data || []
  );
  const [meta, setMeta] = useState<MetaData>(
    dados?.meta || { total: 0, page: 1, limit: 12, totalPages: 0 }
  );
  const [loading, setLoading] = useState(false);

  // Estados dos filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroConstrutora, setFiltroConstrutora] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  // Dados Auxiliares
  const [opcoesFiltro, setOpcoesFiltro] = useState({
    cidades: [],
    estados: [],
  });
  const [construtoraData, setConstrutoraData] = useState([]);
  const [estadoData, setEstadoData] = useState([]);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  /** * Estilo Corrigido para Select (Força o fundo das options)
   * Resolve o problema do texto branco no fundo branco visível nos prints
   */
  const selectStyles = {
    bg: "white",
    color: "gray.800",
    borderColor: "gray.300",
    _dark: {
      bg: "gray.700",
      color: "white",
      borderColor: "gray.600",
    },
    "& option": {
      background: "white !important",
      color: "gray.800 !important",
    },
    _dark_option: {
      "& option": {
        background: "#2D3748 !important", // gray.700 do Chakra
        color: "white !important",
      },
    },
  };

  const fetchEmpreendimentos = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      try {
        const filtroData = {
          page: pageNumber.toString(),
          limit: "12",
          ...(filtroId && { id: filtroId }),
          ...(filtroNome && { nome: filtroNome }),
          ...(filtroCidade && { cidade: filtroCidade }),
          ...(filtroEstado && { estado: filtroEstado }),
          ...(filtroConstrutora && { construtoraId: filtroConstrutora }),
          ...(filtroStatus && { status: filtroStatus }),
        };

        const res = await getEmpreendimentosAction(filtroData);
        setEmpreendimentos(res.data);
        setMeta(res.meta);
      } catch (error) {
        toast({
          title: "Erro ao filtrar",
          description: "Não foi possível carregar os dados do servidor.",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      filtroId,
      filtroNome,
      filtroCidade,
      filtroEstado,
      filtroConstrutora,
      filtroStatus,
      toast,
    ]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmpreendimentos(1);
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [
    filtroId,
    filtroNome,
    filtroCidade,
    filtroEstado,
    filtroConstrutora,
    filtroStatus,
    fetchEmpreendimentos,
  ]);

  useEffect(() => {
    const loadSelectData = async () => {
      try {
        const [resOptions, resConst, resState] = await Promise.all([
          getEmpreendimentoFilterOptions(),
          fetch("/api/construtora/getall").then((r) => r.json()),
          fetch("/api/country/estados").then((r) => r.json()),
        ]);

        // Agora as cidades e estados virão normalizados e sem NULL do backend
        setOpcoesFiltro(resOptions || { cidades: [], estados: [] });
        setConstrutoraData(resConst || []);
        setEstadoData(resState.data || []);
      } catch (e) {
        console.error("Erro ao carregar auxiliares", e);
      }
    };
    loadSelectData();
  }, []);

  const handleClearFilters = () => {
    setFiltroId("");
    setFiltroNome("");
    setFiltroCidade("");
    setFiltroEstado("");
    setFiltroConstrutora("");
    setFiltroStatus("");
  };

  return (
    <Container maxW="95%" py={4} px={6}>
      <VStack spacing={0} align="stretch" w="full">
        {/* Cabeçalho */}
        <Flex
          bg="white"
          borderBottomWidth="2px"
          borderBottomColor="#00713D"
          p={{ base: 4, md: 6 }}
          align="center"
          justify="space-between"
          borderRadius="xl"
          borderBottomRadius={0}
          shadow="lg"
          _dark={{ bg: "gray.800", borderBottomColor: "#00d672" }}
        >
          <Flex align="center" gap={3}>
            <Icon
              as={MdApartment}
              w={10}
              h={10}
              color="#00713D"
              _dark={{ color: "#00d672" }}
            />
            <Box>
              <Heading size="lg" color="#023147" _dark={{ color: "gray.100" }}>
                Gerenciar Empreendimentos
              </Heading>
              <Text color="gray.600" _dark={{ color: "gray.400" }}>
                Total de {meta.total} registros no sistema
              </Text>
            </Box>
          </Flex>
          <Button
            leftIcon={<MdAdd />}
            colorScheme="green"
            bg="#00713D"
            onClick={onOpen}
            _dark={{ bg: "#00d672", color: "gray.900" }}
          >
            Novo Empreendimento
          </Button>
        </Flex>

        <VStack
          spacing={6}
          align="stretch"
          bg="white"
          _dark={{ bg: "gray.800" }}
          p={6}
          borderRadius="xl"
          borderTopRadius={0}
          shadow="lg"
        >
          {/* Box de Filtros */}
          <Box
            w="full"
            bg="gray.50"
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            _dark={{ bg: "gray.900", borderColor: "gray.700" }}
          >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4, xl: 7 }} spacing={4}>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={MdBadge} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="ID"
                  value={filtroId}
                  onChange={(e) => setFiltroId(e.target.value)}
                  bg="white"
                  _dark={{ bg: "gray.800", borderColor: "gray.600" }}
                />
              </InputGroup>

              <InputGroup>
                <InputLeftElement>
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Nome"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  bg="white"
                  _dark={{ bg: "gray.800", borderColor: "gray.600" }}
                />
              </InputGroup>

              {/* Filtro UF dinâmico do banco */}
              <Select
                placeholder="UF"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                sx={selectStyles}
              >
                {opcoesFiltro.estados.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </Select>

              {/* Filtro Cidade dinâmico do banco */}
              <Select
                placeholder="Cidade"
                value={filtroCidade}
                onChange={(e) => setFiltroCidade(e.target.value)}
                sx={selectStyles}
              >
                {opcoesFiltro.cidades.map((cidade) => (
                  <option key={cidade} value={cidade}>
                    {cidade}
                  </option>
                ))}
              </Select>

              <Select
                placeholder="Construtora"
                value={filtroConstrutora}
                onChange={(e) => setFiltroConstrutora(e.target.value)}
                sx={selectStyles}
              >
                {construtoraData.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.fantasia}
                  </option>
                ))}
              </Select>

              <Select
                placeholder="Status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                sx={selectStyles}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </Select>

              <Button
                colorScheme="red"
                variant="ghost"
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
            </SimpleGrid>
          </Box>

          {/* Listagem com Loading e Paginação */}
          <Box w="full" minH="400px">
            {loading ? (
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
                spacing={6}
              >
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height="300px" borderRadius="xl" />
                ))}
              </SimpleGrid>
            ) : empreendimentos.length > 0 ? (
              <>
                <Empreendimentos
                  data={empreendimentos}
                  listConstrutora={construtoraData}
                  listEstado={estadoData}
                  fechar={onClose}
                />
                <Flex justify="center" mt={10} gap={4} align="center">
                  <Button
                    leftIcon={<MdChevronLeft />}
                    onClick={() => fetchEmpreendimentos(meta.page - 1)}
                    isDisabled={meta.page === 1}
                    size="sm"
                  >
                    Anterior
                  </Button>
                  <Text fontWeight="bold" fontSize="sm">
                    Página {meta.page} de {meta.totalPages}
                  </Text>
                  <Button
                    rightIcon={<MdChevronRight />}
                    onClick={() => fetchEmpreendimentos(meta.page + 1)}
                    isDisabled={meta.page === meta.totalPages}
                    size="sm"
                  >
                    Próxima
                  </Button>
                </Flex>
              </>
            ) : (
              <Flex flexDir="column" align="center" py={20}>
                <Icon as={MdSearch} w={12} h={12} color="gray.300" />
                <Text mt={4} fontSize="lg" color="gray.500">
                  Nenhum resultado encontrado.
                </Text>
              </Flex>
            )}
          </Box>
        </VStack>
      </VStack>
      <ModalCriarEmpreendimento
        isOpen={isOpen}
        onClose={onClose}
        lista={construtoraData}
        listEstado={estadoData}
      />
    </Container>
  );
}
