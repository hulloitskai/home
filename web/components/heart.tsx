import React, { FC, useEffect, useMemo, useState } from "react";
import humanizeDuration from "humanize-duration";

import { motion, useAnimation } from "framer-motion";
import { gql } from "urql";
import { DateTime } from "luxon";

import { BoxProps, Box, VStack, Center } from "@chakra-ui/react";
import { TextProps, Text } from "@chakra-ui/react";

import { HeartStatHeartRateFragment } from "graphql-types";

export const HEART_STAT_HEART_RATE_FRAGMENT = gql`
  fragment HeartStatHeartRate on HeartRate {
    id
    measurement
    timestamp
  }
`;

const MotionText = motion<Omit<TextProps, "transition">>(Text);

export interface HeartBeatProps extends BoxProps {
  bpm: number | null | undefined;
}

const MAX_BEAT_DURATION = 0.5;

export const HeartBeat: FC<HeartBeatProps> = ({ bpm, ...otherProps }) => {
  const fgControls = useAnimation();
  const bgControls = useAnimation();

  const transition = useMemo(() => {
    if (bpm) {
      const interval = 60 / bpm;
      const duration = (() => {
        const halfInterval = interval / 2;
        return halfInterval > MAX_BEAT_DURATION
          ? MAX_BEAT_DURATION
          : halfInterval;
      })();
      return {
        duration,
        repeat: Infinity,
        repeatDelay: interval - duration,
      };
    }
  }, [bpm]);

  useEffect(
    () => {
      if (bpm) {
        const intensity =
          typeof window !== "undefined" ? window.devicePixelRatio : 1;
        {
          const initial = 1;
          const end = 1 + 0.05 * intensity;
          fgControls.start({ scale: [initial, end, initial] });
        }
        {
          const initial = 1.05;
          const end = 1;
          bgControls.start({ scale: [initial, end, initial] });
        }
      } else {
        fgControls.stop();
        bgControls.stop();
      }
    },
    [bpm], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Box pos="relative" {...otherProps}>
      <MotionText
        fontSize="3xl"
        filter={bpm !== null ? "blur(0.6rem)" : "blur(0.6rem) brightness(70%)"}
        animate={bgControls}
        transition={transition}
      >
        ❤️
      </MotionText>
      <Center pos="absolute" inset={0}>
        <MotionText fontSize="3xl" animate={fgControls} transition={transition}>
          {bpm === null ? "💔" : "❤️"}
        </MotionText>
      </Center>
    </Box>
  );
};

export interface HeartStatProps extends BoxProps {
  rate: HeartStatHeartRateFragment | null | undefined;
}

export const HeartStat: FC<HeartStatProps> = ({ rate, ...otherProps }) => {
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
      <HeartBeat bpm={rate ? measurement : rate} />
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
