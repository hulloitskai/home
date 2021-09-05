import React, { FC, useEffect, useMemo, useState } from "react";
import humanizeDuration from "humanize-duration";

import { motion } from "framer-motion";
import { gql } from "urql";
import { DateTime } from "luxon";

import { BoxProps, Box, VStack, Center } from "@chakra-ui/react";
import { TextProps, Text } from "@chakra-ui/react";

import { BeatingHeartRateFragment } from "graphql-types";

export const BEATING_HEART_RATE_FRAGMENT = gql`
  fragment BeatingHeartRate on HeartRate {
    id
    measurement
    timestamp
  }
`;

const MotionText = motion<Omit<TextProps, "transition">>(Text);

export interface HeartProps extends BoxProps {
  bpm: number | null | undefined;
}

const MAX_BEAT_DURATION = 0.5;

export const Heart: FC<HeartProps> = ({ bpm, ...otherProps }) => {
  const interval = useMemo(() => {
    if (bpm) {
      return 60 / bpm;
    }
  }, [bpm]);

  const duration = useMemo(() => {
    if (interval) {
      const halfInterval = interval / 2;
      return halfInterval > MAX_BEAT_DURATION
        ? MAX_BEAT_DURATION
        : halfInterval;
    }
  }, [interval]);

  return (
    <Box pos="relative" {...otherProps}>
      <Text
        fontSize="3xl"
        filter={bpm !== null ? "blur(0.6rem)" : "blur(0.6rem) brightness(70%)"}
        _dark={{ opacity: 0.6 }}
      >
        ❤️
      </Text>
      <Center pos="absolute" inset={0}>
        <MotionText
          fontSize="3xl"
          initial={bpm ? undefined : false}
          animate={{ scale: [1, 1.1, 1] }}
          transition={
            interval && duration
              ? {
                  duration,
                  repeat: Infinity,
                  repeatDelay: interval - duration,
                }
              : undefined
          }
        >
          {bpm === null ? "💔" : "❤️"}
        </MotionText>
      </Center>
    </Box>
  );
};

export interface BeatingHeartProps extends BoxProps {
  rate: BeatingHeartRateFragment | null | undefined;
}

export const BeatingHeart: FC<BeatingHeartProps> = ({
  rate,
  ...otherProps
}) => {
  const { measurement, timestamp } = rate ?? {};

  // Update last-measured description every 5 seconds.
  const [lastMeasured, setLastMeasured] = useState<string | undefined>();
  useEffect(() => {
    const humanizeDurationOptions: humanizeDuration.Options = {
      largest: 1,
      units: ["h", "m", "s"],
      round: true,
    };
    if (timestamp) {
      const lastMeasuredAt = DateTime.fromISO(timestamp);
      const lastMeasured = humanizeDuration(
        lastMeasuredAt.diffNow().toMillis(),
        humanizeDurationOptions,
      );
      setLastMeasured(lastMeasured);

      const interval = setInterval(() => {
        const nextLastMeasured = humanizeDuration(
          lastMeasuredAt.diffNow().toMillis(),
          humanizeDurationOptions,
        );
        if (nextLastMeasured !== lastMeasured) {
          setLastMeasured(nextLastMeasured);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [timestamp]);

  return (
    <VStack {...otherProps}>
      <Box />
      <Heart bpm={rate ? measurement : rate} />
      {rate && (
        <VStack spacing={0.5}>
          <Text color="gray.500" fontSize="sm" fontWeight="semibold">
            {measurement} bpm
          </Text>
          <Text color="gray.400" fontSize="xs" _dark={{ color: "gray.600" }}>
            reported {lastMeasured} ago
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
