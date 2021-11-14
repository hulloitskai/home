import React, { useMemo } from "react";
import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

import { Box, VStack, HStack, Container } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useToast } from "components/toast";
import { ClientOnly } from "components/ssr";

const TestPage: NextPage = () => {
  const toast = useToast();
  const user = useUser();
  const userJSON = useMemo(() => {
    if (user) {
      return JSON.stringify(user, undefined, 2);
    }
  }, [user]);

  const loginURL = useMemo(() => {
    const search = new URLSearchParams({
      returnTo: "/test",
    });
    return "/api/auth/login?" + search.toString();
  }, []);

  return (
    <Container h="100vh" py={12}>
      <VStack align="stretch" spacing={8}>
        <VStack>
          <Heading size="md">Auth0 Integration</Heading>
          <ClientOnly>
            {userJSON && (
              <Box p={4} bg="gray.100" _dark={{ bg: "gray.800" }}>
                <Text fontFamily="monospace">{userJSON}</Text>
              </Box>
            )}
          </ClientOnly>
          <HStack>
            <Link href={loginURL} _hover={{ textDecor: "none" }}>
              <Button>Sign In</Button>
            </Link>
            <Link href="/api/auth/logout" _hover={{ textDecor: "none" }}>
              <Button>Sign Out</Button>
            </Link>
          </HStack>
        </VStack>
        <VStack>
          <Heading size="md">Sentry Integration</Heading>
          <HStack>
            <Button
              onClick={() => {
                console.error("[TestPage] An error was logged!");
              }}
            >
              Log An Error
            </Button>
            <Button
              onClick={() => {
                toast({
                  status: "error",
                  title: "Oh noes!",
                  description: "An error occurred",
                });
              }}
            >
              Toast An Error
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Container>
  );
};

export default TestPage;
