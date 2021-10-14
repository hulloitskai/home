import React, { FC, useMemo } from "react";
import { Duration } from "luxon";

import { BoxProps, Box, VStack, HStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Progress } from "@chakra-ui/react";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useMusicLyricsQuery } from "apollo";

gql`
  query MusicLyrics {
    musicInfo {
      track {
        spotifyId
        lyrics {
          lines {
            text
            position
          }
        }
      }
    }
  }
`;

const MUSIC_LYRICS_DELAY = 1_000; // 1 second of estimated latency

export interface MusicLyricsProps extends BoxProps {
  trackSpotifyId: string | undefined | null;
  progress: number | undefined | null;
  duration: number;
}

export const MusicLyrics: FC<MusicLyricsProps> = ({
  trackSpotifyId,
  progress,
  duration,
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to load lyrics");
  const { data } = useMusicLyricsQuery({
    skip: !trackSpotifyId,
    onError: handleQueryError,
  });

  const line = useMemo(() => {
    const { lines } = data?.musicInfo?.track?.lyrics ?? {};
    if (lines && typeof progress === "number") {
      const estimatedProgress = progress - MUSIC_LYRICS_DELAY;
      for (let i = 0; i < lines.length; i++) {
        const { position, text } = lines[i];
        if (position <= estimatedProgress) {
          if (i === lines.length - 1) {
            return text;
          }
          if (estimatedProgress < lines[i + 1].position) {
            return text;
          }
        }
      }
    }
    return null;
  }, [data, progress]);

  const progressDescription = useMemo(() => {
    if (progress) {
      const duration = Duration.fromMillis(progress);
      return duration.toFormat("m:ss");
    }
  }, [progress]);

  const progressPercent = useMemo<number | null | undefined>(() => {
    if (typeof progress === "number") {
      return (progress * 100) / duration;
    }
    return progress;
  }, [progress, duration]);

  const durationDescription = useMemo(
    () => Duration.fromMillis(duration).toFormat("m:ss"),
    [duration],
  );

  if (progress === null && !line) {
    return null;
  }
  return (
    <VStack {...otherProps}>
      {!!line && (
        <Box
          bg="black"
          color="white"
          rounded="sm"
          px={2}
          py={1.5}
          _dark={{ bg: "white", color: "black" }}
          {...otherProps}
        >
          <Text
            as="blockquote"
            fontSize="sm"
            fontStyle="oblique"
            fontWeight="medium"
          >
            {line}
          </Text>
        </Box>
      )}
      {progressPercent !== null && (
        <HStack
          w={40}
          color="gray.400"
          fontSize="xs"
          _dark={{ color: "gray.600" }}
        >
          <Text>({progressDescription}</Text>
          <Progress
            value={progressPercent}
            colorScheme="red"
            size="xs"
            rounded="full"
            isIndeterminate={progressPercent === undefined}
            flex={1}
          />
          <Text>{durationDescription})</Text>
        </HStack>
      )}
    </VStack>
  );
};
