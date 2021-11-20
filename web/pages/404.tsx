import React from "react";
import { NextPage } from "next";
import NextLink from "next/link";

import { Box } from "@chakra-ui/react";
import { Text, Link } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { Layout } from "components/layout";

const NotFoundPage: NextPage = () => (
  <Layout
    badge="404"
    badgeTooltip="Page not found! Where did it go?"
    spacing={1.5}
    justify="center"
    align="center"
  >
    <Text fontSize="xl" fontWeight="semibold">
      The page you&apos;re looking for doesn&apos;t exist.
    </Text>
    <Text color="gray.500">Sorry about that! 😣</Text>
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

export default NotFoundPage;
