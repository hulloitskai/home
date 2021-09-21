import React, { FC, useEffect, useMemo } from "react";
import first from "lodash/first";

import { useClient, gql } from "urql";
import { useQuery } from "urql";
import { useQueryErrorToast } from "components/urql";

import { BoxProps, Box, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
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

  // Send heartbeat signal every second.
  const client = useClient();
  useEffect(() => {
    const interval = setInterval(() => {
      client
        .query(MUSIC_SECTION_HEARTBEAT_QUERY, undefined, {
          requestPolicy: "network-only",
        })
        .toPromise();
    }, 1000);
    return () => clearInterval(interval);
  }, [client]);

  if (!musicInfo?.track) {
    return null;
  }

  const { isPlaying, track, progress } = musicInfo;
  const { artists } = track;
  const artist = first(artists);
  return (
    <Section {...otherProps}>
      {/* <MusicStat rate={error ? null : musicRate} /> */}
      <VStack spacing={1}>
        <Text fontSize="3xl">🎤</Text>
        {isPlaying && (
          <MusicLyrics trackSpotifyId={track.spotifyId} progress={progress} />
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

interface MusicLyricsProps extends BoxProps {
  trackSpotifyId: string | undefined | null;
  progress: number | undefined | null;
}

const MusicLyrics: FC<MusicLyricsProps> = ({
  trackSpotifyId,
  progress,
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
      const firstLine = first(lines);
      if (firstLine && progress >= firstLine.position) {
        for (let i = 1; i < lines.length; i++) {
          const { position, text } = lines[i];
          if (position > progress) {
            return lines[i - 1].text;
          }
          if (i === lines.length - 1) {
            return text;
          }
        }
      }
    }
    return null;
  }, [data, progress]);

  if (!line) {
    return null;
  }
  return (
    <Box
      bg="black"
      color="white"
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
  );
};
