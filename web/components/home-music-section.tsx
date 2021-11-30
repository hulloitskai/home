import React, { FC, useEffect, useMemo, useState } from "react";
import { first } from "lodash";
import { DateTime } from "luxon";

import { VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import { SectionProps, Section, SectionText } from "components/section";
import { ExternalLink } from "components/link";
import { MusicLyrics } from "components/music-lyrics";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useHomeMusicSectionQuery } from "apollo";
import { useHomeMusicSectionHeartbeatQuery } from "apollo";

import type { HomeMusicSectionQuery } from "apollo";

gql`
  query HomeMusicSection {
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
  query HomeMusicSectionHeartbeat {
    musicInfo {
      isPlaying
      track {
        spotifyId
      }
      progress
    }
  }
`;

export type HomeMusicSectionProps = SectionProps;

export const HomeMusicSection: FC<HomeMusicSectionProps> = ({
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to load music info");
  const { data } = useHomeMusicSectionQuery({
    onError: handleQueryError,
  });
  const { musicInfo } = data ?? {};

  // Record data timestamp.
  const dataTimestamp = useMemo(() => DateTime.now(), [data]);

  // Send heartbeat signal every 2.5 seconds.
  useHomeMusicSectionHeartbeatQuery({
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
  useEffect(() => {
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
  }, [musicInfo]);

  const render = (info: NonNullable<HomeMusicSectionQuery["musicInfo"]>) => {
    const { isPlaying, track } = info;
    const { duration, artists } = track;
    const artist = first(artists);
    return (
      <Section {...otherProps}>
        <VStack spacing={1}>
          <Text fontFamily="emoji" fontSize="3xl">
            {isPlaying ? "🔊" : "🔈"}
          </Text>
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
            _light={{ color: "gray.800" }}
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
                _light={{ color: "gray.800" }}
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
