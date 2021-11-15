import React from "react";
import NextLink from "next/link";
import type { NextPage } from "next";

import { Box, VStack } from "@chakra-ui/react";
import { Text, Link } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { Layout } from "components/layout";

const ResearchCompletePage: NextPage = () => {
  return (
    <Layout badge="Research" spacing={0}>
      <VStack spacing={1.5} justifyContent="center" flex={1}>
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
      </VStack>
    </Layout>
  );
};

export default ResearchCompletePage;
