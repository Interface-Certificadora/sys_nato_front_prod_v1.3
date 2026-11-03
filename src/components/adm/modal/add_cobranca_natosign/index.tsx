"use client";
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { MdAddCircle } from "react-icons/md";
import { useEffect, useState } from "react";

type TipoCliente = "construtora" | "cca";

interface ClienteType {
  id: number;
  razaosocial: string;
  fantasia: string | null;
}

interface Props {
  onCriado: () => void;
}

const ENDPOINT_CLIENTE: Record<TipoCliente, string> = {
  construtora: "/api/construtora/getall",
  cca: "/api/financeira/getall",
};

export default function ModalAddCobrancaNatosign({ onCriado }: Props) {
  const [tipo, setTipo] = useState<TipoCliente>("construtora");
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [clienteId, setClienteId] = useState(0);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const HandleClose = () => {
    onClose();
    setClienteId(0);
    setDataInicio("");
    setDataFim("");
  };

  useEffect(() => {
    if (!isOpen) return;
    setClienteId(0);
    (async () => {
      try {
        const req = await fetch(ENDPOINT_CLIENTE[tipo]);
        const res = await req.json();
        setClientes(Array.isArray(res) ? res : []);
      } catch (error) {
        console.log(error);
        toast({
          title: "Erro",
          description: `Não foi possível carregar as ${tipo === "cca" ? "CCAs" : "construtoras"}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    })();
  }, [tipo, isOpen, toast]);

  const HandleSubmit = async () => {
    if (!clienteId || !dataInicio) {
      toast({
        title: "Selecione o cliente e a data de início",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      setLoading(true);
      const body = {
        ...(tipo === "construtora"
          ? { ConstrutoraId: clienteId }
          : { FinanceiroId: clienteId }),
        Inicio: dataInicio,
        ...(dataFim && { Fim: dataFim }),
      };
      const response = await fetch("/api/relatorio-natosign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      toast({
        title: "Cobrança NatoSign gerada!",
        description: `${data.total_envelopes} envelope(s) — ${Number(
          data.valorTotal
        ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });
      HandleClose();
      onCriado();
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Não foi possível gerar a cobrança",
        description: error.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        leftIcon={<MdAddCircle size={20} />}
        bg="#3B82F6"
        color="white"
        size={{ base: "sm", md: "md" }}
        fontSize={{ base: "sm", md: "md" }}
        onClick={onOpen}
        shadow="md"
        _hover={{ bg: "#2563EB", transform: "translateY(-2px)", shadow: "lg" }}
        transition="all 0.2s"
      >
        Nova Cobrança NatoSign
      </Button>
      <Modal
        closeOnOverlayClick={false}
        isCentered
        isOpen={isOpen}
        onClose={HandleClose}
      >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent>
          <ModalHeader>Nova Cobrança NatoSign</ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} flexDirection={"column"} gap={4}>
            <Box>
              <Text>Cobrar de</Text>
              <RadioGroup
                value={tipo}
                onChange={(v) => setTipo(v as TipoCliente)}
              >
                <Stack direction="row" spacing={6}>
                  <Radio value="construtora">Construtora</Radio>
                  <Radio value="cca">CCA</Radio>
                </Stack>
              </RadioGroup>
            </Box>
            <Box>
              <Text>
                Selecione a {tipo === "cca" ? "CCA" : "Construtora"}
              </Text>
              <Select
                value={clienteId}
                onChange={(e) => setClienteId(Number(e.target.value))}
              >
                <option value={0}></option>
                {clientes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fantasia || item.razaosocial}
                  </option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text>Envelopes enviados a partir de</Text>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </Box>
            <Box>
              <Text>Até (opcional)</Text>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </Box>
            <Text fontSize="xs" color="gray.500">
              Entram só envelopes concluídos, não cancelados e ainda não
              cobrados. O status dos envelopes em aberto é atualizado com a
              Intellisign antes de gerar, então pode levar alguns segundos.
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button isDisabled={loading} onClick={HandleClose}>
              Cancelar
            </Button>
            <Button
              isLoading={loading}
              colorScheme="blue"
              onClick={HandleSubmit}
            >
              Gerar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
