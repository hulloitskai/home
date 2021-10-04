import React, { useMemo } from "react";
import type { NextPage } from "next";
// import NextLink from "next/link";
import NoSSR from "react-no-ssr";
import { DateTime } from "luxon";

import { HiOutlineArrowsExpand } from "react-icons/hi";

import { gql } from "urql";
import { useQuery } from "urql";

import { WithUrqlState } from "next-urql";
import { withClient } from "components/urql";

import { ChakraProviderProps } from "components/chakra";
import { getPageCookies } from "components/chakra";

import { Box, Container, VStack, HStack, Spacer } from "@chakra-ui/react";
import { Text, Link, Badge } from "@chakra-ui/react";
import { IconButton, Icon } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { DarkMode } from "@chakra-ui/react";

import { HeartSection } from "components/heart";
import { MusicSection } from "components/music";

import { HomeQuery, HomeQueryVariables } from "graphql-types";
import { KnowledgeGraph } from "components/knowledge";

const HOME_QUERY = gql`
  query Home($dailyNoteId: String!) {
    knowledge {
      dailyEntry: entry(id: $dailyNoteId) {
        id
        links {
          outgoing
          incoming
        }
      }
    }
  }
`;

interface HomePageProps extends WithUrqlState, ChakraProviderProps {}

const HomePage: NextPage<HomePageProps> = () => {
  const dailyNoteId = useMemo(() => DateTime.now().toFormat("yyyy-LL-dd"), []);

  const [{ data }] = useQuery<HomeQuery, HomeQueryVariables>({
    query: HOME_QUERY,
    variables: {
      dailyNoteId,
    },
  });
  const { dailyEntry } = data?.knowledge ?? {};

  return (
    <VStack align="stretch">
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
          {/* <Section>
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
        </Section> */}
        </VStack>
      </Container>
      {dailyEntry && (
        <DarkMode>
          <Box h={56} pos="relative">
            <NoSSR>
              <KnowledgeGraph
                entries={[dailyEntry]}
                highlightedEntryId={dailyEntry.id}
                linkForce={0.1}
                bodyForce={-100}
                h={96}
                bg="gray.900"
              />
            </NoSSR>
            <HStack
              align="start"
              spacing={1}
              pos="absolute"
              inset={4}
              bottom="unset"
            >
              <Badge colorScheme="yellow">Knowledge Graph</Badge>
              <Spacer />
              <Link href="/knowledge" _hover={{ textDecor: "none" }}>
                <Tooltip label="Open Full Graph">
                  <IconButton
                    icon={<Icon as={HiOutlineArrowsExpand} />}
                    aria-label="Open Full Graph"
                    size="xs"
                    colorScheme="yellow"
                  />
                </Tooltip>
              </Link>
              {/* <NextLink href="/knowledge" passHref> */}
              {/* </NextLink> */}
            </HStack>
          </Box>
        </DarkMode>
      )}
    </VStack>
  );
};

HomePage.getInitialProps = ctx => {
  return {
    cookies: getPageCookies(ctx),
  };
};

export default withClient({ ssr: true })(HomePage);
