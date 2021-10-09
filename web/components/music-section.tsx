import React, { FC, useEffect, useMemo, useState } from "react";
import { first } from "lodash";
import { DateTime } from "luxon";

import { VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { ExternalLink } from "components/external-link";

import { SectionProps, Section, SectionText } from "components/section";
import { MusicLyrics } from "components/music-lyrics";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useMusicSectionQuery } from "apollo";
import { useMusicSectionHeartbeatQuery } from "apollo";

import type { MusicSectionQuery } from "apollo";

gql`
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

gql`
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
  const handleQueryError = useHandleQueryError("Failed to load music info");
  const { data } = useMusicSectionQuery({
    onError: handleQueryError,
  });
  const { musicInfo } = data ?? {};

  // Record data timestamp.
  const dataTimestamp = useMemo(
    () => DateTime.now(),
    [data], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Send heartbeat signal every 2.5 seconds.
  useMusicSectionHeartbeatQuery({
    fetchPolicy: "network-only",
    pollInterval: 2500,
    ssr: false,
  });

  // An interpolated progress accounts for the time since the last progress
  // check (heartbeat).
  const [interpolatedProgress, setInterpolatedProgress] = useState<
    number | undefined
  >(() => {
    const { progress } = musicInfo ?? {};
    if (progress) {
      const elapsed = dataTimestamp.diffNow().milliseconds;
      return progress - elapsed;
    }
  });
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
