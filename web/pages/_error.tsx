import React, { useMemo } from "react";
import { NextPage, NextPageContext } from "next";
import NextLink from "next/link";
import NextErrorComponent, { ErrorProps } from "next/error";

import { captureException, flush } from "@sentry/nextjs";

import { HiClipboardCopy } from "react-icons/hi";

import { Box, Container, VStack, HStack, Spacer } from "@chakra-ui/react";
import { Text, Link, Code } from "@chakra-ui/react";
import { Icon, IconButton } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { DarkMode } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { useClipboard } from "@chakra-ui/react";

import { Layout } from "components/layout";

export interface ErrorPageProps extends ErrorProps {
  hasGetInitialPropsRun: boolean;
  err: NextPageContext["err"];
}

const ErrorPage: NextPage<ErrorPageProps> = ({
  statusCode,
  hasGetInitialPropsRun,
  err: error,
}) => {
  if (!hasGetInitialPropsRun && error) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    captureException(error);
    // Flushing is not required in this case as it only happens on the client
  }

  const errorText = useMemo(() => {
    if (error) {
      if (error.name === "Error") {
        return error.message;
      }
      return error.toString();
    }
    return "";
  }, [error]);
  const errorClipboard = useClipboard(errorText);

  return (
    <Layout
      badge="Oops!"
      badgeTooltip="Something went wrong :("
      spacing={1.5}
      justify="center"
      align="center"
    >
      <Text fontSize="xl" fontWeight="semibold">
        Something went wrong!
      </Text>
      <Text color="gray.500">
        An error occurred, with status code{" "}
        <Code colorScheme="red">{statusCode}</Code>.
      </Text>
      <Container py={4}>
        <DarkMode>
          <VStack align="stretch" bg="gray.800" maxW="full">
            <HStack p={2} pb={0}>
              <Badge colorScheme="red">Error</Badge>
              <Spacer />
              <Tooltip
                label={errorClipboard.hasCopied ? "Copied!" : "Copy"}
                closeOnClick={false}
              >
                <IconButton
                  icon={<Icon as={HiClipboardCopy} />}
                  aria-label="Copy"
                  size="xs"
                  colorScheme="red"
                  onClick={errorClipboard.onCopy}
                />
              </Tooltip>
            </HStack>
            <Box p={4} pt={0} maxH={40} overflowY="auto">
              <Text color="white" fontFamily="monospace" whiteSpace="pre-wrap">
                {errorText}
              </Text>
            </Box>
          </VStack>
        </DarkMode>
      </Container>
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

ErrorPage.getInitialProps = async props => {
  const { err, asPath } = props;
  const errorInitialProps = await NextErrorComponent.getInitialProps(props);
  const initialProps: ErrorPageProps = {
    ...errorInitialProps,
    err,
    // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
    // getInitialProps has run
    hasGetInitialPropsRun: true,
  };

  // Running on the server, the response object (`res`) is available.
  //
  // Next.js will pass an err on the server if a page's data fetching methods
  // threw or returned a Promise that rejected
  //
  // Running on the client (browser), Next.js will provide an err if:
  //
  //  - a page's `getInitialProps` threw or returned a Promise that rejected
  //  - an exception was thrown somewhere in the React lifecycle (render,
  //    componentDidMount, etc) that was caught by Next.js's React Error
  //    Boundary. Read more about what types of exceptions are caught by Error
  //    Boundaries: https://reactjs.org/docs/error-boundaries.html

  if (err) {
    captureException(err);

    // // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await flush(2000);

    return initialProps;
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`),
  );
  await flush(2000);

  return initialProps;
};

export default ErrorPage;
