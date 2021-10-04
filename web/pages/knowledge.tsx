import React from "react";
import type { NextPage } from "next";
import NoSSR from "react-no-ssr";

import { gql } from "urql";
import { useQuery } from "urql";

import { WithUrqlState } from "next-urql";
import { withClient } from "components/urql";

import { ChakraProviderProps } from "components/chakra";
import { getPageCookies } from "components/chakra";

import { Center, Spinner } from "@chakra-ui/react";

import {
  KnowledgeGraph,
  KNOWLEDGE_GRAPH_ENTRY_FRAGMENT,
} from "components/knowledge";

import { KnowledgeQuery, KnowledgeQueryVariables } from "graphql-types";

const KNOWLEDGE_QUERY = gql`
  query Knowledge {
    knowledge {
      entries {
        id
        ...KnowledgeGraphEntry
      }
    }
  }

  ${KNOWLEDGE_GRAPH_ENTRY_FRAGMENT}
`;

interface KnowledgePageProps extends WithUrqlState, ChakraProviderProps {}

const KnowledgePage: NextPage<KnowledgePageProps> = () => {
  const [{ data }] = useQuery<KnowledgeQuery, KnowledgeQueryVariables>({
    query: KNOWLEDGE_QUERY,
  });
  const { entries } = data?.knowledge ?? {};

  return (
    <Center w="100vw" h="100vh">
      <NoSSR>
        {entries ? (
          <KnowledgeGraph entries={entries} boxSize="full" />
        ) : (
          <Spinner color="gray.800" />
        )}
      </NoSSR>
    </Center>
  );
};

KnowledgePage.getInitialProps = ctx => {
  return {
    cookies: getPageCookies(ctx),
  };
};

export default withClient({ ssr: true })(KnowledgePage);
