import React from "react";
import type { NextPage } from "next";

import { Center, Spinner } from "@chakra-ui/react";

import { KnowledgeGraph } from "components/knowledge";
import { KnowledgeGraphEntryFragmentDoc } from "apollo";

import { gql } from "@apollo/client";
import { useKnowledgePageQuery } from "apollo";

gql`
  query KnowledgePage {
    entries: knowledgeEntries {
      id
      ...KnowledgeGraphEntry
    }
  }

  ${KnowledgeGraphEntryFragmentDoc}
`;

const KnowledgePage: NextPage = () => {
  const { data } = useKnowledgePageQuery();
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

export default KnowledgePage;
