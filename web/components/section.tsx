import React, { FC } from "react";

import { StackProps, Container, VStack } from "@chakra-ui/react";
import { TextProps, Text } from "@chakra-ui/react";

export type SectionProps = StackProps;

export const Section: FC<SectionProps> = ({ children, ...otherProps }) => (
  <Container as={VStack} spacing={3} {...otherProps}>
    {children}
  </Container>
);

export type SectionTextProps = TextProps;

export const SectionText: FC<SectionTextProps> = ({
  children,
  ...otherProps
}) => (
  <Text
    color="gray.500"
    fontSize="lg"
    fontWeight="semibold"
    maxW={64}
    {...otherProps}
  >
    {children}
  </Text>
);
