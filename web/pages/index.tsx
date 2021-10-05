import React, { useMemo } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
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

import { KNOWLEDGE_GRAPH_ENTRY_FRAGMENT } from "components/knowledge";

import {
  HomeQuery,
  HomeQueryVariables,
  KnowledgeGraphEntryFragment,
} from "graphql-types";

const KnowledgeGraph = dynamic(
  async () => {
    const { KnowledgeGraph } = await import("components/knowledge");
    return KnowledgeGraph;
  },
  { ssr: false },
);

const HOME_QUERY = gql`
  query Home($dailyNoteId: String!) {
    dailyEntry: knowledgeEntry(id: $dailyNoteId) {
      id
      links {
        incoming {
          id
          ...KnowledgeGraphEntry
        }
        outgoing {
          id
          ...KnowledgeGraphEntry
        }
      }
      ...KnowledgeGraphEntry
    }
  }

  ${KNOWLEDGE_GRAPH_ENTRY_FRAGMENT}
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

  const { dailyEntry } = data ?? {};
  const entries = useMemo<KnowledgeGraphEntryFragment[] | undefined>(() => {
    if (dailyEntry) {
      const { incoming, outgoing } = dailyEntry.links;
      return [dailyEntry, ...incoming, ...outgoing];
    }
  }, [dailyEntry]);

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
              , your favorite{" "}
              <Tooltip label="(Non-Playable Character)">NPC</Tooltip>.
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
      {dailyEntry && entries && (
        <DarkMode>
          <Box pos="relative">
            <KnowledgeGraph
              entries={entries}
              highlightedEntryId={dailyEntry.id}
              linkForce={0.05}
              bodyForce={-75}
              h={96}
              bg="gray.900"
            />
            <HStack
              align="start"
              spacing={1}
              pos="absolute"
              inset={4}
              bottom="unset"
            >
              <Badge colorScheme="yellow">Day Graph</Badge>
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
