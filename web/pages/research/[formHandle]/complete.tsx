import React from "react";
import { NextPage, GetServerSideProps } from "next";

import { Box } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { Layout } from "components/layout";
import { InternalLink } from "components/link";

import { patchNodeFetchForSSR } from "components/apollo";
import { initializeApolloClient } from "components/apollo";
import { gql } from "@apollo/client";

import {
  ResearchCompletePagePropsDocument,
  ResearchCompletePagePropsQuery,
  ResearchCompletePagePropsQueryVariables,
} from "apollo/schema";

interface ResearchCompletePageProps {
  readonly form: NonNullable<ResearchCompletePagePropsQuery["form"]>;
}

const ResearchCompletePage: NextPage = () => {
  return (
    <Layout badge="Research" spacing={1.5} justify="center" align="center">
      <Text fontSize="xl" fontWeight="semibold">
        Thank you for participating :)
      </Text>
      <Text color="gray.500">I appreciate you.</Text>
      <Box h={2} />
      <InternalLink href="/" _hover={{ textDecor: "unset" }}>
        <Button variant="outline" size="sm">
          Return Home
        </Button>
      </InternalLink>
    </Layout>
  );
};

gql`
  query ResearchCompletePageProps($formHandle: String!) {
    form: formByHandle(handle: $formHandle) {
      id
    }
  }
`;

export const getServerSideProps: GetServerSideProps<
  ResearchCompletePageProps
> = async ({ query }) => {
  const { formHandle: formHandleParam } = query;
  const formHandle = Array.isArray(formHandleParam)
    ? formHandleParam[0]
    : formHandleParam;
  if (!formHandle) {
    return { notFound: true };
  }

  await patchNodeFetchForSSR();
  const client = initializeApolloClient();
  const { data } = await client.query<
    ResearchCompletePagePropsQuery,
    ResearchCompletePagePropsQueryVariables
  >({
    query: ResearchCompletePagePropsDocument,
    variables: {
      formHandle,
    },
  });

  if (data.form) {
    const { form } = data;
    return {
      props: { form },
    };
  }
  return { notFound: true };
};

export default ResearchCompletePage;
