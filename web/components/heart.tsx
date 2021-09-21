import React, { FC, useEffect, useMemo, useState } from "react";
import humanizeDuration from "humanize-duration";
import { motion, useAnimation } from "framer-motion";
import { DateTime } from "luxon";

import { gql } from "urql";
import { useQuery } from "urql";

import { BoxProps, Box, VStack, Center } from "@chakra-ui/react";
import { TextProps, Text } from "@chakra-ui/react";

import { SectionProps, Section, SectionText } from "components/section";

import { HeartStatHeartRateFragment } from "graphql-types";
import { HeartSectionQuery, HeartSectionQueryVariables } from "graphql-types";

export const HEART_STAT_HEART_RATE_FRAGMENT = gql`
  fragment HeartStatHeartRate on HeartRate {
    id
    measurement
    timestamp
  }
`;

const HEART_SECTION_QUERY = gql`
  query HeartSection {
    heartRate {
      id
      ...HeartStatHeartRate
    }
  }

  ${HEART_STAT_HEART_RATE_FRAGMENT}
`;

export type HeartSectionProps = SectionProps;

export const HeartSection: FC<HeartSectionProps> = ({ ...otherProps }) => {
  const [{ data, error, fetching: isLoading }, executeQuery] = useQuery<
    HeartSectionQuery,
    HeartSectionQueryVariables
  >({
    query: HEART_SECTION_QUERY,
  });
  const { heartRate } = data ?? {};

  // Update every 5 seconds.
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        executeQuery();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [data, isLoading, executeQuery]);

  return (
    <Section {...otherProps}>
      <HeartStat rate={error ? null : heartRate} />
      {heartRate && (
        <SectionText>
          <Text as="span" color="gray.800" _dark={{ color: "gray.200" }}>
            I am currently alive
          </Text>
          , although little else is known about me at the moment.
        </SectionText>
      )}
      {(heartRate === null || error) && (
        <SectionText>
          <Text as="span" color="gray.800" _dark={{ color: "gray.200" }}>
            It is unknown whether I am alive.
          </Text>{" "}
          Little else is known about me at the moment.
        </SectionText>
      )}
      {heartRate === undefined && !error && <Text>Loading...</Text>}
    </Section>
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
