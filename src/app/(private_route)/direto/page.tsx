import { DadoCompomentList } from "@/components/direto/lista";
import { UserCompomentInfo } from "@/components/direto/user";
import ModalPrimeAsses from "@/components/prime_asses";
import ModalTermos from "@/components/termos";
import { GetSessionServer } from "@/lib/auth_confg";
import HomeProvider from "@/provider/HomeProvider";
import { Flex } from "@chakra-ui/react";
import { Metadata } from "next";
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "HOME DIRETO",
  description: "sistema de gestão de vendas de imóveis",
};

const GetListaDados = async (
  session: SessionNext.Server | null
): Promise<solictacao.SolicitacaoGetType | solictacao.SolicitacaoObjectType[] | null> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/direto`;
    const user = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.token}`,
      },
      cache: "no-store",
    });

    if (!user.ok) {
      console.error("GetListaDados status:", user.status);
      return null;
    }

    const data = await user.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return null;
  }
};

export default async function DiretoPage() {
  const session = await GetSessionServer();
  const ListDados = await GetListaDados(session);

  return (
    <>
      <HomeProvider>
        <Flex
          minH="89.8vh"
          w="100%"
          bg="#F8F8F8"
          overflowY="auto"
          overflowX="hidden"
        >
          <ModalPrimeAsses session={session as any} />
          <ModalTermos session={session as any} />

          {session && <UserCompomentInfo session={session} />}
          {session && <DadoCompomentList dados={ListDados} session={session} />}
        </Flex>
      </HomeProvider>
    </>
  );
}