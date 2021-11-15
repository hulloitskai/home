import React, { FC, useEffect, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";

import { BoxProps, Box, Center } from "@chakra-ui/react";
import { TextProps, Text } from "@chakra-ui/react";

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

  useEffect(() => {
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
  }, [bpm]);

  return (
    <Box pos="relative" {...otherProps}>
      <MotionText
        fontFamily="AppleColorEmoji, sans-serif"
        fontSize="3xl"
        filter={bpm !== null ? "blur(0.6rem)" : "blur(0.6rem) brightness(70%)"}
        animate={bgControls}
        transition={transition}
      >
        ❤️
      </MotionText>
      <Center pos="absolute" inset={0}>
        <MotionText
          fontFamily="AppleColorEmoji, sans-serif"
          fontSize="3xl"
          animate={fgControls}
          transition={transition}
        >
          {bpm === null ? "💔" : "❤️"}
        </MotionText>
      </Center>
    </Box>
  );
};
