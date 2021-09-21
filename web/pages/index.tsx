import React from "react";
import type { NextPage } from "next";

import { WithUrqlState } from "next-urql";
import { withClient } from "components/urql";

import { ChakraProviderProps } from "components/chakra";
import { getPageCookies } from "components/chakra";

import { Container, VStack, Center } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import { Section } from "components/section";
import { HeartSection } from "components/heart";
import { MusicSection } from "components/music";

interface HomePageProps extends WithUrqlState, ChakraProviderProps {}

const HomePage: NextPage<HomePageProps> = () => {
  return (
    <Container>
      <VStack spacing={[10, 12]} py={[16, 20]}>
        <VStack>
          <Text fontSize="6xl" fontWeight="bold">
            Hullo!
          </Text>
          <Text color="gray.500" fontSize="2xl" fontWeight="bold">
            It&apos;s me,{" "}
            <Text as="span" color="gray.800" _dark={{ color: "gray.300" }}>
              Kai
            </Text>
            , your favorite NPC.
          </Text>
        </VStack>
        <MusicSection />
        <HeartSection />
        <Section>
          <Center>
            <Text fontSize="3xl">🚧</Text>
          </Center>
          <Text color="gray.500" fontSize="lg" fontWeight="semibold">
            <Text as="span" color="gray.800" _dark={{ color: "gray.200" }}>
              This is a work-in-progress.
            </Text>
            <br />
            Come back again later!
          </Text>
        </Section>
      </VStack>
    </Container>
  );
};

HomePage.getInitialProps = ctx => {
  return {
    cookies: getPageCookies(ctx),
  };
};

export default withClient({ ssr: true })(HomePage);
