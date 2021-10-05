import React from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";

import { gql } from "urql";
import { useQuery } from "urql";

import { WithUrqlState } from "next-urql";
import { withClient } from "components/urql";

import { ChakraProviderProps } from "components/chakra";
import { getPageCookies } from "components/chakra";

import { Center, Spinner } from "@chakra-ui/react";

import { KNOWLEDGE_GRAPH_ENTRY_FRAGMENT } from "components/knowledge";

import { KnowledgeQuery, KnowledgeQueryVariables } from "graphql-types";

const KnowledgeGraph = dynamic(
  async () => {
    const { KnowledgeGraph } = await import("components/knowledge");
    return KnowledgeGraph;
  },
  { ssr: false },
);

const KNOWLEDGE_QUERY = gql`
  query Knowledge {
    entries: knowledgeEntries {
      id
      ...KnowledgeGraphEntry
    }
  }

  ${KNOWLEDGE_GRAPH_ENTRY_FRAGMENT}
`;

interface KnowledgePageProps extends WithUrqlState, ChakraProviderProps {}

const KnowledgePage: NextPage<KnowledgePageProps> = () => {
  const [{ data }] = useQuery<KnowledgeQuery, KnowledgeQueryVariables>({
    query: KNOWLEDGE_QUERY,
  });
  const { entries } = data ?? {};

  return (
    <Center w="100vw" h="100vh">
      {entries ? (
        <KnowledgeGraph entries={entries} boxSize="full" />
      ) : (
        <Spinner color="gray.800" />
      )}
    </Center>
  );
};

KnowledgePage.getInitialProps = ctx => {
  return {
    cookies: getPageCookies(ctx),
  };
};

export default withClient({ ssr: true })(KnowledgePage);
