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

  const transition = useMemo(() => {
    if (interval && duration) {
      return {
        duration,
        repeat: Infinity,
        repeatDelay: interval - duration,
      };
    }
  }, [interval, duration]);

  return (
    <Box pos="relative" {...otherProps}>
      <MotionText
        fontSize="3xl"
        filter={bpm !== null ? "blur(0.6rem)" : "blur(0.6rem) brightness(70%)"}
        initial={bpm ? undefined : false}
        animate={{ scale: [1.02, 1, 1.02] }}
        transition={transition}
      >
        ❤️
      </MotionText>
      <Center pos="absolute" inset={0}>
        <MotionText
          fontSize="3xl"
          initial={bpm ? undefined : false}
          animate={{ scale: [1, 1.12, 1] }}
          transition={transition}
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
  const { measurement, timestamp: timestampISO } = rate ?? {};

  // Update last-measured description every 5 seconds.
  const [lastMeasured, setLastMeasured] = useState<string | undefined>();
  useEffect(
    () => {
      const humanizeDurationOptions: humanizeDuration.Options = {
        largest: 1,
        units: ["h", "m", "s"],
        round: true,
      };
      if (timestampISO) {
        const timestamp = DateTime.fromISO(timestampISO);
        (() => {
          const lastReported = humanizeDuration(
            timestamp.diffNow().toMillis(),
            humanizeDurationOptions,
          );
          setLastMeasured(lastReported);
        })();

        const interval = setInterval(() => {
          const value = humanizeDuration(
            timestamp.diffNow().toMillis(),
            humanizeDurationOptions,
          );
          if (value !== lastMeasured) {
            setLastMeasured(value);
          }
        }, 5000);
        return () => clearInterval(interval);
      }
    },
    [timestampISO], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <VStack {...otherProps}>
      <Box />
      <Heart bpm={rate ? measurement : rate} />
      {rate && (
        <VStack spacing={0.5}>
          <Text color="gray.500" fontSize="sm" fontWeight="semibold">
            My heart beats like this.
          </Text>
          <Text color="gray.400" fontSize="xs" _dark={{ color: "gray.600" }}>
            ({measurement} bpm, measured {lastMeasured} ago)
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
