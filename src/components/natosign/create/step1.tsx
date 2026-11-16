"use client";

import {
  FormControl,
  FormHelperText,
  FormLabel,
  Select,
  VStack,
  Input,
  Skeleton,
  Text,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
} from "@chakra-ui/react";

// Limites da Intellisign: acima disso o envelope é recusado
const LIMITE = { title: 60, subject: 60, message: 500 } as const;

interface CcaType {
  id: number;
  fantasia: string;
  Intelesign_price: number;
}

interface ConstType {
  id: number;
  fantasia: string;
}

// Interface para os Empreendimentos
interface EmpreendimentoType {
  id: number;
  nome: string;
  Intelesign_status?: boolean;
}

interface Step1Props {
  formData: any;
  setFormData: (data: any) => void;
  handleCcaChange: (ccaId: string) => void;
  availableCcas: CcaType[];
  isCcaLoading: boolean;
  isConstLoading: boolean;
  availableConst: ConstType[];
  // Novas props do Empreendimento:
  availableEmpreendimentos?: EmpreendimentoType[];
  isEmpreendimentoLoading?: boolean;
  handleEmpreendimentoChange?: (empId: string) => void;
  // Imobiliária que acompanha o processo (NatoDoc)
  availableImobiliarias?: ImobiliariaType[];
  isImobiliariaLoading?: boolean;
}

interface ImobiliariaType {
  id: number;
  fantasia: string;
}

export default function Step1({
  formData,
  handleCcaChange,
  setFormData,
  availableCcas,
  isCcaLoading,
  isConstLoading,
  availableConst,
  availableEmpreendimentos = [],
  isEmpreendimentoLoading = false,
  handleEmpreendimentoChange,
  availableImobiliarias = [],
  isImobiliariaLoading = false,
}: Step1Props) {
  // Cores do tema
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const inputFocusBorder = useColorModeValue("#00713D", "#00d672");
  const selectedBg = useColorModeValue("gray.50", "gray.800");
  const selectedBorder = useColorModeValue("gray.200", "gray.700");
  const selectedTextColor = useColorModeValue("#023147", "gray.100");

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderCcaComponent = () => {
    if (isCcaLoading) {
      return <Skeleton height="40px" borderRadius="md" />;
    }

    if (availableCcas.length > 1) {
      return (
        <Select
          placeholder="Selecione uma Financeira (CCA)"
          value={formData.cca_id}
          onChange={(e) => handleCcaChange(e.target.value)}
          isRequired
          bg={inputBg}
          borderColor={inputBorder}
          focusBorderColor={inputFocusBorder}
          _hover={{ borderColor: inputFocusBorder }}
          size="md"
        >
          {availableCcas.map((cca) => (
            <option key={cca.id} value={cca.id.toString()}>
              {cca.fantasia}
            </option>
          ))}
        </Select>
      );
    }

    if (availableCcas.length === 1) {
      return (
        <Text
          fontSize="md"
          p={3}
          borderWidth="1px"
          borderRadius="md"
          bg={selectedBg}
          borderColor={selectedBorder}
          color={selectedTextColor}
        >
          <strong>{availableCcas[0].fantasia}</strong> (selecionado
          automaticamente)
        </Text>
      );
    }

    return (
      <Text color="red.500" fontSize="sm" p={2}>
        Nenhuma Financeira (CCA) disponível.
      </Text>
    );
  };

  const renderConstComponent = () => {
    if (isConstLoading) {
      return <Skeleton height="40px" borderRadius="md" />;
    }
    if (availableConst.length > 1) {
      return (
        <Select
          placeholder="Selecione a Construtora"
          value={formData.const_id}
          onChange={(e) => handleChange("const_id", e.target.value)}
          isRequired
          bg={inputBg}
          borderColor={inputBorder}
          focusBorderColor={inputFocusBorder}
          _hover={{ borderColor: inputFocusBorder }}
          size="md"
        >
          {availableConst.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.fantasia}
            </option>
          ))}
        </Select>
      );
    }
    if (availableConst.length === 1) {
      return (
        <Text
          fontSize="md"
          p={3}
          borderWidth="1px"
          borderRadius="md"
          bg={selectedBg}
          borderColor={selectedBorder}
          color={selectedTextColor}
        >
          <strong>{availableConst[0].fantasia}</strong> (selecionado
          automaticamente)
        </Text>
      );
    }
    return (
      <Text color="red.500" fontSize="sm" p={2}>
        Nenhuma Construtora disponível.
      </Text>
    );
  };

  // Renderizador dinâmico para o Empreendimento
  const renderEmpreendimentoComponent = () => {
    if (isEmpreendimentoLoading) {
      return <Skeleton height="40px" borderRadius="md" />;
    }

    if (availableEmpreendimentos.length > 1) {
      return (
        <Select
          placeholder="Selecione o Empreendimento (Opcional)"
          value={formData.empreendimento_id || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (handleEmpreendimentoChange) {
              handleEmpreendimentoChange(val);
            } else {
              handleChange("empreendimento_id", val);
            }
          }}
          bg={inputBg}
          borderColor={inputBorder}
          focusBorderColor={inputFocusBorder}
          _hover={{ borderColor: inputFocusBorder }}
          size="md"
        >
          {availableEmpreendimentos.map((emp) => (
            <option key={emp.id} value={emp.id.toString()}>
              {emp.nome}
            </option>
          ))}
        </Select>
      );
    }

    if (availableEmpreendimentos.length === 1) {
      return (
        <Text
          fontSize="md"
          p={3}
          borderWidth="1px"
          borderRadius="md"
          bg={selectedBg}
          borderColor={selectedBorder}
          color={selectedTextColor}
        >
          <strong>{availableEmpreendimentos[0].nome}</strong> (selecionado
          automaticamente)
        </Text>
      );
    }

    return (
      <Text color="gray.500" fontSize="sm" p={2}>
        Nenhum Empreendimento cadastrado para vincular.
      </Text>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Construtora */}
      <FormControl isRequired>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Construtora
        </FormLabel>
        {renderConstComponent()}
      </FormControl>

      {/* Financeira */}
      <FormControl isRequired>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Financeira (CCA)
        </FormLabel>
        {renderCcaComponent()}
      </FormControl>

      {/* Empreendimento (Opcional para vinculação) */}
      <FormControl>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Empreendimento
        </FormLabel>
        {renderEmpreendimentoComponent()}
      </FormControl>

      {/* Imobiliária (Opcional - acompanha o processo pelo NatoDoc) */}
      <FormControl>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Imobiliária
        </FormLabel>
        {isImobiliariaLoading ? (
          <Skeleton height="40px" borderRadius="md" />
        ) : availableImobiliarias.length > 0 ? (
          <Select
            placeholder="Nenhuma (opcional)"
            value={formData.imobiliaria_id || ""}
            onChange={(e) => handleChange("imobiliaria_id", e.target.value)}
            bg={inputBg}
            borderColor={inputBorder}
            focusBorderColor={inputFocusBorder}
            _hover={{ borderColor: inputFocusBorder }}
            size="md"
          >
            {availableImobiliarias.map((imob) => (
              <option key={imob.id} value={imob.id.toString()}>
                {imob.fantasia}
              </option>
            ))}
          </Select>
        ) : (
          <Text color="gray.500" fontSize="sm" p={2}>
            Nenhuma imobiliária relacionada ao seu usuário.
          </Text>
        )}
        <Text fontSize="xs" color="gray.500" mt={1}>
          A imobiliária selecionada poderá acompanhar este envelope pelo
          NatoDoc.
        </Text>
      </FormControl>

      {/* Tipo de Assinatura */}
      <FormControl isRequired>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Tipo de Assinatura
        </FormLabel>
        <Select
          value={formData.signatureType}
          onChange={(e) => handleChange("signatureType", e.target.value)}
          bg={inputBg}
          borderColor={inputBorder}
          focusBorderColor={inputFocusBorder}
          _hover={{ borderColor: inputFocusBorder }}
          size="md"
        >
          <option value="simple">Simples - Sem Certificado Digital</option>
          <option value="qualified">
            Qualificada - Com Certificado Digital
          </option>
        </Select>
      </FormControl>

      {/* Título do Envelope */}
      <FormControl>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Título do Envelope
        </FormLabel>
        <Input
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          bg={inputBg}
          borderColor={inputBorder}
          focusBorderColor={inputFocusBorder}
          _hover={{ borderColor: inputFocusBorder }}
          size="md"
          placeholder="Digite o título do envelope"
          maxLength={LIMITE.title}
        />
        <FormHelperText textAlign="right">
          {(formData.title || "").length}/{LIMITE.title}
        </FormHelperText>
      </FormControl>

      {/* Assunto do Email */}
      <FormControl>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Assunto do Email
        </FormLabel>
        <Input
          value={formData.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          bg={inputBg}
          borderColor={inputBorder}
          focusBorderColor={inputFocusBorder}
          _hover={{ borderColor: inputFocusBorder }}
          size="md"
          placeholder="Digite o assunto do email"
          maxLength={LIMITE.subject}
        />
        <FormHelperText textAlign="right">
          {(formData.subject || "").length}/{LIMITE.subject}
        </FormHelperText>
      </FormControl>

      {/* Mensagem do Email */}
      <FormControl>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Mensagem do Email
        </FormLabel>
        <Textarea
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Mensagem que aparecerá no corpo do email para os signatários"
          bg={inputBg}
          borderColor={inputBorder}
          focusBorderColor={inputFocusBorder}
          _hover={{ borderColor: inputFocusBorder }}
          size="md"
          minH="120px"
          resize="vertical"
          maxLength={LIMITE.message}
        />
        <FormHelperText textAlign="right">
          {(formData.message || "").length}/{LIMITE.message}
        </FormHelperText>
      </FormControl>

      {/* Dias para Expiração */}
      <FormControl>
        <FormLabel
          fontSize="sm"
          fontWeight="semibold"
          color={labelColor}
          mb={2}
        >
          Dias para Expiração
        </FormLabel>
        <NumberInput
          value={formData.expire_at}
          min={1}
          max={365}
          onChange={(valueAsString, valueAsNumber) =>
            handleChange("expire_at", valueAsNumber)
          }
          focusBorderColor={inputFocusBorder}
        >
          <NumberInputField
            bg={inputBg}
            borderColor={inputBorder}
            _hover={{ borderColor: inputFocusBorder }}
          />
          <NumberInputStepper borderColor={inputBorder}>
            <NumberIncrementStepper borderColor={inputBorder} />
            <NumberDecrementStepper borderColor={inputBorder} />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </VStack>
  );
}
