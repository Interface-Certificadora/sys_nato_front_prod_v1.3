import {
  campoPermissao,
  CATEGORIAS_PERMISSAO,
  PERMISSOES,
} from "@/data/permissoes";
import { UserRoler } from "@/types/session";
import {
  Box,
  Checkbox,
  Divider,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";

interface Props {
  data?: UserRoler;
}

export default function Permissoes({ data }: Props) {
  return (
    <>
      <Divider
        my={4}
        borderColor="gray.300"
        _dark={{ borderColor: "gray.600" }}
      />
      <Heading
        fontSize={{ base: "md", md: "lg" }}
        color="gray.800"
        _dark={{ color: "gray.100" }}
      >
        Permissões
      </Heading>
      <SimpleGrid
        w="100%"
        columns={{ base: 1, md: 2, xl: 3 }}
        spacing={4}
        px={{ base: 0, md: 4 }}
        mt={3}
      >
        {CATEGORIAS_PERMISSAO.map((categoria) => (
          <Box
            key={categoria}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            p={4}
            _dark={{ borderColor: "gray.600" }}
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
              color="gray.500"
              _dark={{ color: "gray.400" }}
              mb={3}
            >
              {categoria}
            </Text>
            <VStack align="stretch" spacing={2}>
              {PERMISSOES.filter((p) => p.categoria === categoria).map((p) => (
                <Checkbox
                  key={p.chave}
                  name={campoPermissao(p.chave)}
                  defaultChecked={!!data?.[p.chave as keyof UserRoler]}
                  borderColor="gray.500"
                  _dark={{ borderColor: "gray.400" }}
                >
                  <Text
                    fontSize="sm"
                    color="gray.700"
                    _dark={{ color: "gray.300" }}
                  >
                    {p.label}
                  </Text>
                </Checkbox>
              ))}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
}
