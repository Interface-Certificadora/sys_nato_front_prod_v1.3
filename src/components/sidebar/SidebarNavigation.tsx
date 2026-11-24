"use client";

import { Image } from "@chakra-ui/next-js";
import {
  Badge,
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMenu, FiX } from "react-icons/fi";
import NotificationMenu from "./NotificationMenu";
import UserProfilePopover from "./UserProfilePopover";
import { defaultNavItems } from "@/data/nav";
import { NavItem } from "@/types/navitem";
import AdministrativoMenu from "./Administrativo";
import FinanceiroButton from "./financeiro";
import MetricsButton from "./metricas";
import ChamadosButton from "./chamados";
import ChatButton from "./chat";
import NowButton from "./Now";
import CancelamentosNatosignButton from "./CancelamentosNatosign";
import { Session } from "@/types/session";
import { isAgenteImobiliario } from "@/lib/agenteImobiliario";

/**
 * Props do componente SidebarNavigation
 * @param session - Dados da sessão do usuário
 * @param navItems - Array de itens de navegação (opcional)
 * @param onCollapse - Callback quando sidebar é colapsada (opcional)
 */
interface SidebarNavigationProps {
  session: Session.AuthUser | null;
  navItems?: NavItem[];
  onCollapse?: (collapsed: boolean) => void;
}

/**
 * Componente de navegação lateral responsivo com toggle
 *
 * Funcionalidades:
 * - Altura fixa 100dvh
 * - Toggle para esconder/mostrar (desktop)
 * - Drawer em mobile/tablet (< md)
 * - Auto-hide em telas < md
 * - Botão flutuante para abrir
 * - Animações suaves
 *
 * @component
 */
export default function SidebarNavigation({
  session,
  navItems = defaultNavItems,
  onCollapse,
}: SidebarNavigationProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Auto-hide sidebar em telas < md
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
      onCollapse?.(true);
    } else {
      setIsCollapsed(false);
      onCollapse?.(false);
    }
  }, [isMobile, onCollapse]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  return (
    <>
      {/* Botão flutuante para abrir menu (mobile/tablet) */}
      {isMobile && !isOpen && (
        <IconButton
          aria-label="Abrir menu"
          icon={<FiMenu />}
          onClick={onOpen}
          position="fixed"
          top={4}
          left={4}
          zIndex={999}
          bg="#023147"
          color="white"
          _hover={{ bg: "#034a6b" }}
          _active={{ bg: "#012433" }}
          size="md"
          borderRadius="lg"
          boxShadow="xl"
        />
      )}

      {/* Botão toggle para desktop (esconder/mostrar) - TOPO */}
      {!isMobile && (
        <IconButton
          aria-label={isCollapsed ? "Mostrar menu" : "Esconder menu"}
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          onClick={toggleSidebar}
          position="fixed"
          top={4}
          left={isCollapsed ? "0" : "280px"}
          zIndex={100}
          bg="#FB8501"
          color="white"
          _hover={{ bg: "#e07701" }}
          _active={{ bg: "#c66901" }}
          size="sm"
          borderRadius="0 lg lg 0"
          boxShadow="lg"
          transition="left 0.3s ease"
        />
      )}

      {/* Sidebar Desktop (com toggle) */}
      {!isMobile && (
        <SidebarContent
          session={session}
          navItems={navItems}
          onClose={onClose}
          isCollapsed={isCollapsed}
        />
      )}

      {/* Drawer Mobile/Tablet */}
      {isMobile && (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <DrawerContent h="100dvh">
            <SidebarContent
              session={session}
              navItems={navItems}
              onClose={onClose}
              isMobile
            />
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

/**
 * Conteúdo interno da Sidebar
 * Compartilhado entre versão desktop e mobile
 */
interface SidebarContentProps {
  session: Session.AuthUser | null;
  navItems: NavItem[];
  onClose: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

function SidebarContent({
  session,
  navItems,
  onClose,
  isMobile = false,
  isCollapsed = false,
}: SidebarContentProps) {
  const pathname = usePathname();
  const bgColor = useColorModeValue("#F6F3E9", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const theme = useColorModeValue("light", "dark");
  // Agente Imobiliário só enxerga NatoDoc e FAQ
  const agenteImobiliario = isAgenteImobiliario(session);
  const itensVisiveis = agenteImobiliario
    ? navItems.filter(
        (item) => item.href === "/natodoc" || item.href === "/faq"
      )
    : navItems;

  return (
    <Flex
      direction="column"
      h="100dvh"
      w={isCollapsed ? "0" : { base: "full", md: "280px" }}
      bg={bgColor}
      borderRight={isCollapsed ? "0" : "1px"}
      borderColor={borderColor}
      position={isMobile ? "relative" : "fixed"}
      left={0}
      top={0}
      overflow="hidden"
      transition="all 0.3s ease"
      opacity={isCollapsed ? 0 : 1}
      visibility={isCollapsed ? "hidden" : "visible"}
    >
      {/* Header com logo e botão fechar (mobile) */}
      <Flex
        h="20"
        alignItems="center"
        justifyContent="center"
        px={6}
        borderBottom="1px"
        borderColor={borderColor}
      >
        {theme === "light" ? (
          <Image src="/logo ligth.png" alt="Logo" width={160} height={45} />
        ) : (
          <Image src="/logo dark.png" alt="Logo" width={160} height={45} />
        )}
        {isMobile && (
          <IconButton
            aria-label="Fechar menu"
            icon={<FiX />}
            onClick={onClose}
            variant="ghost"
            size="sm"
            color="#023147"
          />
        )}
      </Flex>

      {/* Itens de navegação */}
      <VStack spacing={1} align="stretch" flex={1} py={4} px={3}>
        {itensVisiveis.map((item) => (
          <NavItemComponent
            key={item.name}
            item={item}
            isActive={pathname === item.href}
            onClose={isMobile ? onClose : undefined}
            session={session}
          />
        ))}
      </VStack>

      {/* Seção inferior: Notificações + Perfil do Usuário */}
      <Box borderTop="1px" borderColor={borderColor} p={3}>
        <Flex w="full" direction="column" gap={2}>
          {/* Menu de Notificações/Alertas */}
          {session && !agenteImobiliario && (
            <NotificationMenu session={session} />
          )}
          {/* Menu de Chamados */}
          {!agenteImobiliario && <ChamadosButton />}
          {/* Webchat de atendimento */}
          {(session?.hierarquia === "ADM" || session?.role?.chat) && (
            <ChatButton />
          )}
          {/* Menu de Now */}
          {session && !agenteImobiliario && <NowButton session={session} />}
          {/* Pedidos de cancelamento do NatoSign (ADM responsável) */}
          {session && <CancelamentosNatosignButton session={session} />}
          {/* Menu de Administração */}
          {session?.role?.adm && <AdministrativoMenu />}
          {/* Menu de Financeiro */}
          {session?.hierarquia === "ADM" && <FinanceiroButton />}
          {/* Menu de Métricas */}
          {session?.hierarquia === "ADM" && <MetricsButton />}
        </Flex>

        {/* Botão do Usuário com Popover */}
        <UserProfilePopover session={session} />
      </Box>
    </Flex>
  );
}

/**
 * Componente individual de item de navegação
 * Com hover effects e indicador de rota ativa
 */
interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  onClose?: () => void;
  session: Session.AuthUser | null;
}

function NavItemComponent({
  item,
  isActive,
  onClose,
  session,
}: NavItemComponentProps) {
  const hoverBg = useColorModeValue("rgba(2, 49, 71, 0.08)", "whiteAlpha.200");
  const activeBg = useColorModeValue("#023147", "whiteAlpha.300");
  const activeColor = useColorModeValue("white", "white");
  const textColor = useColorModeValue("#023147", "gray.200");
  const adm = session?.role?.adm;
  const direto = session?.role?.direto;
  const sign = session?.role?.natosign || session?.hierarquia === "ADM";
  const natodoc = session?.role?.natodoc || session?.hierarquia === "ADM";

  return (
    <>
      {adm && item.role === "ADM" && (
        <>
          <Link
            href={item.href}
            onClick={onClose}
            style={{ textDecoration: "none" }}
          >
            <Flex
              align="center"
              p={2}
              mx={2}
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive ? activeBg : "transparent"}
              color={isActive ? activeColor : textColor}
              _hover={{
                bg: isActive ? activeBg : hoverBg,
                transform: "translateX(4px)",
              }}
              transition="all 0.2s ease"
              position="relative"
            >
              {/* Indicador de rota ativa */}
              {isActive && (
                <Box
                  position="absolute"
                  left={-3}
                  w="3px"
                  h="60%"
                  bg="#FB8501"
                  borderRadius="full"
                />
              )}

              <Icon
                as={item.icon}
                fontSize="20"
                mr={3}
                transition="all 0.2s"
                _groupHover={{ transform: "scale(1.1)" }}
              />
              <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
                {item.name}
              </Text>

              {/* Badge de notificações */}
              {item.badge && item.badge > 0 && (
                <Badge
                  ml="auto"
                  colorScheme="orange"
                  borderRadius="full"
                  fontSize="xs"
                  px={2}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </Flex>
          </Link>
        </>
      )}
      {direto && item.role === "DIRETO" && (
        <>
          <Link
            href={item.href}
            onClick={onClose}
            style={{ textDecoration: "none" }}
          >
            <Flex
              align="center"
              p={2}
              mx={2}
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive ? activeBg : "transparent"}
              color={isActive ? activeColor : textColor}
              _hover={{
                bg: isActive ? activeBg : hoverBg,
                transform: "translateX(4px)",
              }}
              transition="all 0.2s ease"
              position="relative"
            >
              {/* Indicador de rota ativa */}
              {isActive && (
                <Box
                  position="absolute"
                  left={-3}
                  w="3px"
                  h="60%"
                  bg="#FB8501"
                  borderRadius="full"
                />
              )}

              <Icon
                as={item.icon}
                fontSize="20"
                mr={3}
                transition="all 0.2s"
                _groupHover={{ transform: "scale(1.1)" }}
              />
              <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
                {item.name}
              </Text>

              {/* Badge de notificações */}
              {item.badge && item.badge > 0 && (
                <Badge
                  ml="auto"
                  colorScheme="orange"
                  borderRadius="full"
                  fontSize="xs"
                  px={2}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </Flex>
          </Link>
        </>
      )}
      {sign && item.role === "natosign" && (
        <>
          <Link
            href={item.href}
            onClick={onClose}
            style={{ textDecoration: "none" }}
          >
            <Flex
              align="center"
              p={2}
              mx={2}
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive ? activeBg : "transparent"}
              color={isActive ? activeColor : textColor}
              _hover={{
                bg: isActive ? activeBg : hoverBg,
                transform: "translateX(4px)",
              }}
              transition="all 0.2s ease"
              position="relative"
            >
              {/* Indicador de rota ativa */}
              {isActive && (
                <Box
                  position="absolute"
                  left={-3}
                  w="3px"
                  h="60%"
                  bg="#FB8501"
                  borderRadius="full"
                />
              )}

              <Icon
                as={item.icon}
                fontSize="20"
                mr={3}
                transition="all 0.2s"
                _groupHover={{ transform: "scale(1.1)" }}
              />
              <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
                {item.name}
              </Text>

              {/* Badge de notificações */}
              {item.badge && item.badge > 0 && (
                <Badge
                  ml="auto"
                  colorScheme="orange"
                  borderRadius="full"
                  fontSize="xs"
                  px={2}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </Flex>
          </Link>
        </>
      )}
      {adm && item.role === "HUB" && (
        <>
          <Link
            href={item.href}
            onClick={onClose}
            style={{ textDecoration: "none" }}
          >
            <Flex
              align="center"
              p={2}
              mx={2}
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive ? activeBg : "transparent"}
              color={isActive ? activeColor : textColor}
              _hover={{
                bg: isActive ? activeBg : hoverBg,
                transform: "translateX(4px)",
              }}
              transition="all 0.2s ease"
              position="relative"
            >
              {isActive && (
                <Box
                  position="absolute"
                  left={-3}
                  w="3px"
                  h="60%"
                  bg="#FB8501"
                  borderRadius="full"
                />
              )}

              <Icon
                as={item.icon}
                fontSize="20"
                mr={3}
                transition="all 0.2s"
                _groupHover={{ transform: "scale(1.1)", color: "#FB8501" }} // Efeito laranja no hover do ícone
              />
              <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
                {item.name}
              </Text>
            </Flex>
          </Link>
        </>
      )}
      {(!item.role || (natodoc && item.role === "natodoc")) && (
        <>
          <Link
            href={item.href}
            onClick={onClose}
            style={{ textDecoration: "none" }}
          >
            <Flex
              align="center"
              p={2}
              mx={2}
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive ? activeBg : "transparent"}
              color={isActive ? activeColor : textColor}
              _hover={{
                bg: isActive ? activeBg : hoverBg,
                transform: "translateX(4px)",
              }}
              transition="all 0.2s ease"
              position="relative"
            >
              {/* Indicador de rota ativa */}
              {isActive && (
                <Box
                  position="absolute"
                  left={-3}
                  w="3px"
                  h="60%"
                  bg="#FB8501"
                  borderRadius="full"
                />
              )}

              <Icon
                as={item.icon}
                fontSize="20"
                mr={3}
                transition="all 0.2s"
                _groupHover={{ transform: "scale(1.1)" }}
              />
              <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
                {item.name}
              </Text>

              {/* Badge de notificações */}
              {item.badge && item.badge > 0 && (
                <Badge
                  ml="auto"
                  colorScheme="orange"
                  borderRadius="full"
                  fontSize="xs"
                  px={2}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </Flex>
          </Link>
        </>
      )}
    </>
  );
}
