import React, { FC } from "react";
import { chakra } from "@chakra-ui/react";

import { Text } from "@chakra-ui/react";
import { SectionProps, Section, SectionText } from "components/section";

import { HeartStat } from "components/heart-stat";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useHomeHeartSectionQuery } from "apollo";

gql`
  fragment HeartStatHeartRate on HeartRate {
    id
    measurement
    timestamp
  }
`;

gql`
  query HomeHeartSection {
    heartRate {
      id
      ...HeartStatHeartRate
    }
  }
`;

export type HomeHeartSectionProps = SectionProps;

export const HomeHeartSection: FC<HomeHeartSectionProps> = ({
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to load heart rate");
  const { data, error } = useHomeHeartSectionQuery({
    pollInterval: 5000,
    onError: handleQueryError,
  });
  const { heartRate } = data ?? {};
  return (
    <Section {...otherProps}>
      <HeartStat rate={error ? null : heartRate} />
      {heartRate && (
        <SectionText>
          <chakra.span
            _light={{ color: "gray.800" }}
            _dark={{ color: "gray.200" }}
          >
            I am currently alive
          </chakra.span>
          , although little else is known about me at the moment.
        </SectionText>
      )}
      {(heartRate === null || error) && (
        <SectionText>
          <chakra.span
            _light={{ color: "gray.800" }}
            _dark={{ color: "gray.200" }}
          >
            It is unknown whether I am alive.
          </chakra.span>{" "}
          Little else is known about me at the moment.
        </SectionText>
      )}
      {heartRate === undefined && !error && <Text>Loading...</Text>}
    </Section>
  );
};
