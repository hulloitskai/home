import React, { FC, useEffect, useMemo, useState } from "react";
import first from "lodash/first";
import { DateTime, Duration } from "luxon";

import { useClient, gql } from "urql";
import { useQuery } from "urql";
import { useQueryErrorToast } from "components/urql";

import { BoxProps, Box, VStack, HStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Progress } from "@chakra-ui/react";
import { ExternalLink } from "components";

import { SectionProps, Section, SectionText } from "components/section";

import { MusicSectionQuery, MusicSectionQueryVariables } from "graphql-types";
import { MusicLyricsQuery, MusicLyricsQueryVariables } from "graphql-types";

const MUSIC_SECTION_QUERY = gql`
  query MusicSection {
    musicInfo {
      isPlaying
      track {
        spotifyId
        spotifyUrl
        name
        album {
          spotifyId
          spotifyUrl
          name
        }
        artists {
          spotifyId
          spotifyUrl
          name
        }
        duration
      }
      progress
    }
  }
`;

const MUSIC_SECTION_HEARTBEAT_QUERY = gql`
  query MusicSectionHeartbeat {
    musicInfo {
      isPlaying
      track {
        spotifyId
      }
      progress
    }
  }
`;

export type MusicSectionProps = SectionProps;

export const MusicSection: FC<MusicSectionProps> = ({ ...otherProps }) => {
  const [{ data, error }] = useQuery<
    MusicSectionQuery,
    MusicSectionQueryVariables
  >({
    query: MUSIC_SECTION_QUERY,
  });
  useQueryErrorToast(error, "Failed to load music info");
  const { musicInfo } = data ?? {};

  // Record data timestamp.
  const dataTimestamp = useMemo(
    () => DateTime.now(),
    [data], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Send heartbeat signal every 2.5 seconds.
  const client = useClient();
  useEffect(() => {
    const interval = setInterval(() => {
      client
        .query(MUSIC_SECTION_HEARTBEAT_QUERY, undefined, {
          requestPolicy: "network-only",
        })
        .toPromise();
    }, 2500);
    return () => clearInterval(interval);
  }, [client]);

  // An interpolated progress accounts for the time since the last progress
  // check (heartbeat).
  const [interpolatedProgress, setInterpolatedProgress] = useState<number>();
  useEffect(
    () => {
      if (musicInfo) {
        const { progress } = musicInfo;
        const interval = setInterval(() => {
          if (progress) {
            const elapsed = dataTimestamp.diffNow().milliseconds;
            setInterpolatedProgress(progress - elapsed);
          } else {
            setInterpolatedProgress(undefined);
          }
        }, 100);
        return () => {
          clearInterval(interval);
        };
      } else {
        setInterpolatedProgress(undefined);
      }
    },
    [musicInfo], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const render = (info: NonNullable<MusicSectionQuery["musicInfo"]>) => {
    const { isPlaying, track } = info;
    const { duration, artists } = track;
    const artist = first(artists);
    return (
      <Section {...otherProps}>
        <VStack spacing={1}>
          <Text fontSize="3xl">{isPlaying ? "🔊" : "🔈"}</Text>
          {isPlaying && (
            <MusicLyrics
              trackSpotifyId={track.spotifyId}
              progress={interpolatedProgress}
              duration={duration}
            />
          )}
        </VStack>
        <SectionText>
          I&apos;m currently listening to{" "}
          <ExternalLink
            href={track.spotifyUrl}
            color="gray.800"
            _dark={{ color: "gray.200" }}
          >
            {track.name}
          </ExternalLink>
          {artist && (
            <>
              {" "}
              by{" "}
              <ExternalLink
                href={track.spotifyUrl}
                color="gray.800"
                _dark={{ color: "gray.200" }}
              >
                {artist.name}
              </ExternalLink>
              .
            </>
          )}
        </SectionText>
      </Section>
    );
  };

  return musicInfo ? render(musicInfo) : null;
};

const MUSIC_LYRICS_QUERY = gql`
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

const MUSIC_LYRICS_DELAY = 1000; // 1 second of estimated latency

interface MusicLyricsProps extends BoxProps {
  trackSpotifyId: string | undefined | null;
  progress: number | undefined | null;
  duration: number;
}

const MusicLyrics: FC<MusicLyricsProps> = ({
  trackSpotifyId,
  progress,
  duration,
  ...otherProps
}) => {
  const [{ data, error }, executeQuery] = useQuery<
    MusicLyricsQuery,
    MusicLyricsQueryVariables
  >({
    query: MUSIC_LYRICS_QUERY,
    pause: !trackSpotifyId,
  });
  useQueryErrorToast(error, "Failed to load music lyrics");
  useEffect(
    () => {
      if (trackSpotifyId) {
        executeQuery();
      }
    },
    [trackSpotifyId], // eslint-disable-line react-hooks/exhaustive-deps
  );

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
