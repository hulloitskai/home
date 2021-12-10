import React from "react";
import type { NextPage } from "next";

import { Center, Spinner } from "@chakra-ui/react";
import { ClientOnly } from "components/client-only";

import { KnowledgeGraph } from "components/knowledge-graph";

import { gql } from "@apollo/client";
import { useKnowledgePageQuery } from "apollo/schema";

gql`
  query KnowledgePage {
    entries: knowledgeEntries {
      id
      ...KnowledgeGraphEntry
    }
  }
`;

const KnowledgePage: NextPage = () => {
  const { data } = useKnowledgePageQuery();
  const { entries } = data ?? {};

  return (
    <Center w="100vw" h="100vh">
      {entries ? (
        <ClientOnly>
          <KnowledgeGraph entries={entries} boxSize="full" />
        </ClientOnly>
      ) : (
        <Spinner color="gray.800" />
      )}
    </Center>
  );
};

export default KnowledgePage;
