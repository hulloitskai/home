import React, { FC } from "react";

import { gql, useQuery } from "urql";

import { Container, Box, VStack, Center } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import { BeatingHeart, BEATING_HEART_RATE_FRAGMENT } from "components";
import { withClient } from "components";

import { HomePageQuery, HomePageQueryVariables } from "graphql-types";

const HOME_PAGE_QUERY = gql`
  query HomePage {
    heartRate {
      id
      ...BeatingHeartRate
    }
  }

  ${BEATING_HEART_RATE_FRAGMENT}
`;

const HomePage: FC = () => {
  const [{ data, error }] = useQuery<HomePageQuery, HomePageQueryVariables>({
    query: HOME_PAGE_QUERY,
  });
  const { heartRate } = data ?? {};

  return (
    <Container>
      <VStack spacing={[10, 12]} py={[16, 20]}>
        <VStack spacing={0}>
          <Text fontSize="6xl" fontWeight="bold">
            Hullo!
          </Text>
          <Text color="gray.500" fontSize="3xl" fontWeight="bold">
            It&apos;s me,{" "}
            <Text as="span" color="gray.800" _dark={{ color: "gray.300" }}>
              Kai
            </Text>
            .
          </Text>
        </VStack>
        <VStack align="stretch" spacing={3} w={64}>
          <BeatingHeart rate={error ? null : heartRate} />
          <Box color="gray.500" fontSize="lg" fontWeight="semibold">
            {heartRate && (
              <Text>
                <Text as="span" color="gray.800" _dark={{ color: "gray.200" }}>
                  I am currently alive
                </Text>
                , although little else is known about me at the current moment.
              </Text>
            )}
            {(heartRate === null || error) && (
              <Text>
                <Text as="span" color="gray.800" _dark={{ color: "gray.200" }}>
                  It is unknown whether I am alive.
                </Text>{" "}
                Little else is known about me at the current moment.
              </Text>
            )}
            {heartRate === undefined && !error && <Text>Loading...</Text>}
          </Box>
        </VStack>
        <VStack
          align="stretch"
          w={64}
          color="gray.500"
          fontSize="lg"
          fontWeight="semibold"
        >
          <Center>
            <Text fontSize="3xl">🚧</Text>
          </Center>
          <Text>
            <Text as="span" color="gray.800" _dark={{ color: "gray.200" }}>
              This is a work-in-progress.
            </Text>
            <br />
            Come back again later!
          </Text>
        </VStack>
      </VStack>
    </Container>
  );
};

export default withClient({ ssr: true })(HomePage);
