import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";

import { Box, Container, VStack, HStack, Spacer } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { Icon, IconButton } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { DarkMode } from "@chakra-ui/react";
import { useClipboard } from "@chakra-ui/react";
import { useToast } from "components/toast";

import { Layout } from "components/layout";
import { ClientOnly } from "components/client-only";
import { HiClipboardCopy } from "react-icons/hi";

const TestPage: NextPage = () => {
  const toast = useToast();

  const { user } = useUser();
  const userJSON = useMemo(() => {
    if (user) {
      return JSON.stringify(user, undefined, 2);
    }
  }, [user]);
  const userJSONClipboard = useClipboard(userJSON ?? "");

  const [userToken, setUserToken] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      fetch("/api/auth/token")
        .then(response => {
          if (response.status === 200) {
            return response.text();
          }
          return null;
        })
        .then(setUserToken);
    } else {
      setUserToken(null);
    }
  }, [user]);
  const userTokenClipboard = useClipboard(userToken ?? "");

  const loginURL = useMemo(() => {
    const search = new URLSearchParams({
      returnTo: "/test",
    });
    return "/api/auth/login?" + search.toString();
  }, []);

  const logoutURL = useMemo(() => {
    const search = new URLSearchParams({
      returnTo: "/test",
    });
    return "/api/auth/logout?" + search.toString();
  }, []);

  return (
    <Layout badge="Test" badgeTooltip="Is this thing on?">
      <Container flex={1} alignSelf="center">
        <VStack align="stretch" spacing={8} py={[2, 4, 8]}>
          <VStack>
            <Heading size="md">Auth0 Integration</Heading>
            <ClientOnly>
              {userJSON && (
                <DarkMode>
                  <VStack align="stretch" bg="gray.800" maxW="full">
                    <HStack p={2} pb={0}>
                      <Badge colorScheme="red">Profile</Badge>
                      <Spacer />
                      <Tooltip
                        label={userJSONClipboard.hasCopied ? "Copied!" : "Copy"}
                        closeOnClick={false}
                      >
                        <IconButton
                          icon={<Icon as={HiClipboardCopy} />}
                          aria-label="Copy"
                          size="xs"
                          colorScheme="red"
                          onClick={userJSONClipboard.onCopy}
                        />
                      </Tooltip>
                    </HStack>
                    <Box p={4} pt={0}>
                      <Text
                        color="white"
                        fontFamily="monospace"
                        whiteSpace="pre-wrap"
                      >
                        {userJSON}
                      </Text>
                    </Box>
                  </VStack>
                </DarkMode>
              )}
              {!!userToken && (
                <DarkMode>
                  <VStack align="stretch" bg="gray.800" maxW="full">
                    <HStack p={2} pb={0}>
                      <Badge colorScheme="red">Token</Badge>
                      <Spacer />
                      <Tooltip
                        label={
                          userTokenClipboard.hasCopied ? "Copied!" : "Copy"
                        }
                        closeOnClick={false}
                      >
                        <IconButton
                          icon={<Icon as={HiClipboardCopy} />}
                          aria-label="Copy"
                          size="xs"
                          colorScheme="red"
                          onClick={userTokenClipboard.onCopy}
                        />
                      </Tooltip>
                    </HStack>
                    <Box p={4} pt={0}>
                      <Text
                        fontFamily="monospace"
                        whiteSpace="pre-wrap"
                        color="white"
                      >
                        {userToken}
                      </Text>
                    </Box>
                  </VStack>
                </DarkMode>
              )}
            </ClientOnly>
            <HStack>
              <Link href={loginURL} _hover={{ textDecor: "none" }}>
                <Button isDisabled={!!user}>Sign In</Button>
              </Link>
              <Link href={logoutURL} _hover={{ textDecor: "none" }}>
                <Button isDisabled={!user}>Sign Out</Button>
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
    </Layout>
  );
};

export default TestPage;
