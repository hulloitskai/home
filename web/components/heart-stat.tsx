import React, { FC, useEffect, useState } from "react";
import humanizeDuration from "humanize-duration";
import { DateTime } from "luxon";

import { BoxProps, Box, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import { HeartBeat } from "components/heart-beat";

import { gql } from "@apollo/client";
import type { HeartStatHeartRateFragment } from "apollo/schema";

gql`
  fragment HeartStatHeartRate on HeartRate {
    id
    measuredAt
    measurement
  }
`;

export interface HeartStatProps extends BoxProps {
  readonly rate: HeartStatHeartRateFragment | null | undefined;
}

export const HeartStat: FC<HeartStatProps> = ({ rate, ...otherProps }) => {
  const { measuredAt: measuredAtISO, measurement } = rate ?? {};

  // Update last-measured description every 5 seconds.
  const [lastMeasured, setLastMeasured] = useState<string | undefined>();
  useEffect(() => {
    const humanizeDurationOptions: humanizeDuration.Options = {
      largest: 1,
      units: ["h", "m", "s"],
      round: true,
    };
    if (measuredAtISO) {
      const measuredAt = DateTime.fromISO(measuredAtISO);
      (() => {
        const lastReported = humanizeDuration(
          measuredAt.diffNow().toMillis(),
          humanizeDurationOptions,
        );
        setLastMeasured(lastReported);
      })();

      const interval = setInterval(() => {
        const value = humanizeDuration(
          measuredAt.diffNow().toMillis(),
          humanizeDurationOptions,
        );
        setLastMeasured(value);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [measuredAtISO]);

  return (
    <VStack {...otherProps}>
      <Box />
      <HeartBeat bpm={rate ? measurement : rate} />
      {rate && (
        <VStack spacing={0.5}>
          <Text color="gray.500" fontSize="sm" fontWeight="semibold">
            My heart beats like this.
          </Text>
          <Text
            fontSize="xs"
            _light={{ color: "gray.400" }}
            _dark={{ color: "gray.600" }}
          >
            ({measurement} bpm, measured {lastMeasured} ago)
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
