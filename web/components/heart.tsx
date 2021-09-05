import React, { FC, useMemo } from "react";
import NoSSR from "react-no-ssr";
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
    <NoSSR>
      <Box pos="relative" {...otherProps}>
        <Text
          fontSize="2xl"
          filter={
            bpm !== null ? "blur(0.6rem)" : "blur(0.6rem) brightness(70%)"
          }
        >
          ❤️
        </Text>
        <Center pos="absolute" inset={0}>
          <MotionText
            fontSize="xl"
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
    </NoSSR>
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
  const lastMeasured = useMemo(() => {
    if (timestamp) {
      const diff = DateTime.fromISO(timestamp).diffNow();
      return humanizeDuration(diff.toMillis(), {
        largest: 1,
        units: ["h", "m", "s"],
        round: true,
      });
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
          <Text color="gray.400" fontSize="xs">
            reported {lastMeasured} ago
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
