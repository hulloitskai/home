import React, { useMemo } from "react";
import type { GetServerSideProps, NextPage } from "next";
import { DateTime } from "luxon";

import { HiOutlineArrowsExpand } from "react-icons/hi";

import { Box, Container, Center } from "@chakra-ui/react";
import { VStack, HStack, Spacer } from "@chakra-ui/react";
import { Text, Badge } from "@chakra-ui/react";
import { IconButton, Icon } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { DarkMode } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

import { Layout } from "components/layout";
import { Section } from "components/section";
import { ClientOnly } from "components/client-only";
import { InternalLink } from "components/internal-link";

import { HomeHeartSection } from "components/home-heart-section";
import { HomeMusicSection } from "components/home-music-section";

import { KnowledgeGraph } from "components/knowledge-graph";
import { KnowledgeGraphEntryFragment } from "apollo";
import { KnowledgeGraphEntryFragmentDoc } from "apollo";

import {
  HomeHeartSectionDocument,
  HomeHeartSectionQuery,
  HomeHeartSectionQueryVariables,
} from "apollo";

import {
  HomeMusicSectionDocument,
  HomeMusicSectionQuery,
  HomeMusicSectionQueryVariables,
} from "apollo";

import {
  MusicLyricsDocument,
  MusicLyricsQuery,
  MusicLyricsQueryVariables,
} from "apollo";

import { patchNodeFetchForSSR } from "components/apollo";
import { initializeApolloClient } from "components/apollo";
import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useHomePageQuery } from "apollo";

gql`
  query HomePage($dailyNoteId: String!) {
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

  ${KnowledgeGraphEntryFragmentDoc}
`;

const HomePage: NextPage = () => {
  const dailyNoteId = useMemo(() => DateTime.now().toFormat("yyyy-LL-dd"), []);
  const handleQueryError = useHandleQueryError();
  const { data } = useHomePageQuery({
    variables: {
      dailyNoteId,
    },
    onError: handleQueryError,
  });

  const { dailyEntry } = data ?? {};
  const entries = useMemo<KnowledgeGraphEntryFragment[] | undefined>(() => {
    if (dailyEntry) {
      const { incoming, outgoing } = dailyEntry.links;
      return [dailyEntry, ...incoming, ...outgoing];
    }
  }, [dailyEntry]);

  const tooltipBg = useColorModeValue("gray.900", undefined);
  const tooltipStyles = useMemo(
    () => ({
      hasArrow: true,
      bg: tooltipBg,
    }),
    [tooltipBg],
  );
  return (
    <Layout badge="Home" badgeTooltip="Where the heart is.">
      <VStack
        align="center"
        spacing={[10, 12]}
        pt={[14, 16, 20]}
        pb={[16, 20, 24]}
      >
        <Container as={VStack}>
          <Text fontSize="6xl" fontWeight="bold">
            Hullo!
          </Text>
          <Text color="gray.500" fontSize="2xl" fontWeight="bold">
            It&apos;s me,{" "}
            <chakra.span
              _light={{ color: "gray.800" }}
              _dark={{ color: "gray.300" }}
            >
              Kai
            </chakra.span>
            , your favorite{" "}
            <Tooltip label="Non-Playable Character" {...tooltipStyles}>
              <chakra.span>NPC</chakra.span>
            </Tooltip>
            .
          </Text>
        </Container>
        <HomeMusicSection />
        <HomeHeartSection />
        <Section>
          <Center>
            <Text fontFamily="emoji" fontSize="3xl">
              🚧
            </Text>
          </Center>
          <Text color="gray.500" fontSize="lg" fontWeight="semibold">
            <chakra.span
              _light={{ color: "gray.800" }}
              _dark={{ color: "gray.200" }}
            >
              This is a work-in-progress.
            </chakra.span>
            <br />
            Come back again later!
          </Text>
        </Section>
      </VStack>
      {dailyEntry && entries && (
        <DarkMode>
          <Box alignSelf="stretch" pos="relative" bg="pink.50">
            <ClientOnly>
              <KnowledgeGraph
                entries={entries}
                highlightedEntryId={dailyEntry.id}
                linkForce={0.05}
                bodyForce={-75}
                h={96}
                bg="black"
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
                <InternalLink
                  href="/knowledge"
                  target="_blank"
                  tabIndex={-1}
                  _hover={{ textDecor: "none" }}
                >
                  <Tooltip label="Open Full Graph">
                    <IconButton
                      icon={<Icon as={HiOutlineArrowsExpand} />}
                      aria-label="Open Full Graph"
                      size="xs"
                      colorScheme="yellow"
                    />
                  </Tooltip>
                </InternalLink>
              </HStack>
            </ClientOnly>
          </Box>
        </DarkMode>
      )}
    </Layout>
  );
};

export default HomePage;

export const getServerSideProps: GetServerSideProps = async () => {
  await patchNodeFetchForSSR();
  const client = initializeApolloClient();

  await Promise.all([
    client.query<HomeHeartSectionQuery, HomeHeartSectionQueryVariables>({
      query: HomeHeartSectionDocument,
      variables: {},
    }),
    client.query<HomeMusicSectionQuery, HomeMusicSectionQueryVariables>({
      query: HomeMusicSectionDocument,
      variables: {},
    }),
    client.query<MusicLyricsQuery, MusicLyricsQueryVariables>({
      query: MusicLyricsDocument,
      variables: {},
    }),
  ]);

  const apolloState = await client.extract();

  return { props: { apolloState } };
};
