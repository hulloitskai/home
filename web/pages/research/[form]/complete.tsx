import React from "react";
import { NextPage, GetServerSideProps } from "next";
import NextLink from "next/link";

import { Box } from "@chakra-ui/react";
import { Text, Link } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { Layout } from "components/layout";

import { patchNodeFetchForSSR } from "components/apollo";
import { initializeApolloClient } from "components/apollo";
import { gql } from "@apollo/client";

import {
  ResearchCompletePagePropsDocument,
  ResearchCompletePagePropsQuery,
  ResearchCompletePagePropsQueryVariables,
} from "apollo";

interface ResearchCompletePageProps {
  form: NonNullable<ResearchCompletePagePropsQuery["form"]>;
}

const ResearchCompletePage: NextPage = () => {
  return (
    <Layout badge="Research" spacing={1.5} justify="center" align="center">
      <Text fontSize="xl" fontWeight="semibold">
        Thank you for participating :)
      </Text>
      <Text color="gray.500">I appreciate you.</Text>
      <Box h={2} />
      <NextLink href="/" passHref>
        <Link _hover={{ textDecor: "unset" }}>
          <Button variant="outline" size="sm">
            Return Home
          </Button>
        </Link>
      </NextLink>
    </Layout>
  );
};

gql`
  query ResearchCompletePageProps($handle: String!) {
    form: formByHandle(handle: $handle) {
      id
    }
  }
`;

export const getServerSideProps: GetServerSideProps<ResearchCompletePageProps> =
  async ({ query }) => {
    const { form: formParam } = query;
    const form = Array.isArray(formParam) ? formParam[0] : formParam;
    if (!form) {
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
        handle: form,
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
