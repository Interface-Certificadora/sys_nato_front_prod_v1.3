"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiClock, FiSlash, FiUser } from "react-icons/fi";
import { Session } from "@/types/session";

interface PedidoCancelamento {
  id: number;
  title: string | null;
  original_name: string | null;
  motivo_cancelamento: string | null;
  cancelamento_solicitado_em: string;
  cancelamento_solicitado_por: string | null;
}

/**
 * Pedidos de cancelamento do NatoSign aguardando confirmação.
 * Aparece só para o ADM responsável (role.natosign_confirmar_cancelamento).
 */
export default function CancelamentosNatosignButton({
  session,
}: {
  session: Session.AuthUser;
}) {
  const permitido =
    session?.hierarquia === "ADM" &&
    !!session?.role?.natosign_confirmar_cancelamento;
  const [pedidos, setPedidos] = useState<PedidoCancelamento[]>([]);
  const [loading, setLoading] = useState(false);

  const bgButton = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const menuBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("#023147", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");

  const buscar = async (mostrarLoading = false) => {
    if (!permitido) return;
    if (mostrarLoading) setLoading(true);
    try {
      const res = await fetch("/api/intelesign/cancelamentos", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos de cancelamento:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscar();
    const interval = setInterval(() => buscar(), 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permitido]);

  if (!permitido) return null;
  const total = pedidos.length;

  return (
    <Menu placement="right-start" isLazy onOpen={() => buscar(true)}>
      <MenuButton
        as={Button}
        w="full"
        h="auto"
        p={2}
        bg={bgButton}
        border="1px"
        borderColor={total > 0 ? "red.400" : borderColor}
        borderRadius="lg"
        _hover={{ bg: hoverBg, borderColor: "red.400" }}
        _active={{ bg: hoverBg }}
        transition="all 0.2s ease"
      >
        <HStack spacing={3} w="full">
          <Box position="relative">
            <Icon
              as={FiSlash}
              fontSize="20"
              color={total > 0 ? "red.500" : textColor}
            />
            {total > 0 && (
              <Badge
                position="absolute"
                top="-6px"
                right="-6px"
                colorScheme="red"
                variant="solid"
                borderRadius="full"
                fontSize="10px"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {total > 99 ? "99+" : total}
              </Badge>
            )}
          </Box>
          <Text fontSize="sm" fontWeight="medium" color={textColor}>
            Cancelamentos NatoSign
          </Text>
        </HStack>
      </MenuButton>

      <Portal>
        <MenuList
          bg={menuBg}
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="2xl"
          w="380px"
          maxH="460px"
          overflowY="auto"
          zIndex={9999}
          p={0}
        >
          <Flex
            p={4}
            borderBottom="1px"
            borderColor={borderColor}
            justify="space-between"
            align="center"
          >
            <HStack>
              <Icon as={FiSlash} color="red.500" fontSize="20" />
              <Text fontSize="md" fontWeight="bold" color={textColor}>
                Pedidos de cancelamento
              </Text>
            </HStack>
            {total > 0 && (
              <Badge colorScheme="red" fontSize="xs" px={2} py={1}>
                {total} {total === 1 ? "pendente" : "pendentes"}
              </Badge>
            )}
          </Flex>

          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner color="red.500" />
            </Flex>
          ) : total === 0 ? (
            <Flex direction="column" align="center" py={10} px={4}>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Nenhum pedido pendente
              </Text>
            </Flex>
          ) : (
            pedidos.map((pedido, index) => (
              <Box key={pedido.id}>
                <Link
                  href={`/natosign/${pedido.id}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <MenuItem
                    bg="transparent"
                    _hover={{ bg: hoverBg }}
                    py={3}
                    px={4}
                  >
                    <VStack align="start" spacing={1} w="full">
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={textColor}
                        noOfLines={1}
                      >
                        #{pedido.id} -{" "}
                        {pedido.original_name || pedido.title || "Envelope"}
                      </Text>
                      {pedido.motivo_cancelamento && (
                        <Text fontSize="xs" color={subtextColor} noOfLines={2}>
                          {pedido.motivo_cancelamento}
                        </Text>
                      )}
                      <HStack spacing={3} fontSize="xs" color={subtextColor}>
                        {pedido.cancelamento_solicitado_por && (
                          <HStack spacing={1}>
                            <Icon as={FiUser} />
                            <Text noOfLines={1}>
                              {pedido.cancelamento_solicitado_por}
                            </Text>
                          </HStack>
                        )}
                        <HStack spacing={1}>
                          <Icon as={FiClock} />
                          <Text>
                            {new Date(
                              pedido.cancelamento_solicitado_em,
                            ).toLocaleString("pt-BR")}
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </MenuItem>
                </Link>
                {index < total - 1 && <MenuDivider m={0} />}
              </Box>
            ))
          )}
        </MenuList>
      </Portal>
    </Menu>
  );
}
