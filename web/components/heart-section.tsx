import React, { FC } from "react";

import { Text } from "@chakra-ui/react";
import { SectionProps, Section, SectionText } from "components/section";

import { HeartStat } from "components/heart-stat";
import { HeartStatHeartRateFragmentDoc } from "apollo";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useHeartSectionQuery } from "apollo";

gql`
  fragment HeartStatHeartRate on HeartRate {
    id
    measurement
    timestamp
  }
`;

gql`
  query HeartSection {
    heartRate {
      id
      ...HeartStatHeartRate
    }
  }

  ${HeartStatHeartRateFragmentDoc}
`;

export type HeartSectionProps = SectionProps;

export const HeartSection: FC<HeartSectionProps> = ({ ...otherProps }) => {
  const handleQueryError = useHandleQueryError("Failed to load heart rate");
  const { data, error } = useHeartSectionQuery({
    pollInterval: 5000,
    onError: handleQueryError,
  });
  const { heartRate } = data ?? {};
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
