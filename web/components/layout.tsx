import React, { FC } from "react";
import NextLink from "next/link";

import { StackProps } from "@chakra-ui/react";
import { VStack, HStack, Center, Spacer } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { LinkBox, LinkOverlay } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";

export interface LayoutProps extends Omit<StackProps, "direction"> {
  badge?: string;
}

export const Layout: FC<LayoutProps> = ({ badge, children, ...otherProps }) => (
  <VStack align="stretch" minH="100vh" pb={14} {...otherProps}>
    <HStack px={6} py={4}>
      <Tooltip
        label="You are loved."
        placement="bottom-end"
        hasArrow
        _light={{ bg: "gray.900" }}
      >
        <LinkBox pos="relative">
          <Text
            fontFamily="AppleColorEmoji, sans-serif"
            fontSize="xl"
            filter="blur(0.6rem)"
          >
            ❤️
          </Text>
          <Center pos="absolute" inset={0}>
            <NextLink href="/" passHref>
              <LinkOverlay>
                <Text fontFamily="AppleColorEmoji, sans-serif" fontSize="2xl">
                  ❤️
                </Text>
              </LinkOverlay>
            </NextLink>
          </Center>
        </LinkBox>
      </Tooltip>
      <Spacer />
      {!!badge && (
        <Badge
          fontSize="sm"
          bg="gray.500"
          color="gray.50"
          _dark={{ bg: "gray.700", color: "gray.400" }}
        >
          {badge}
        </Badge>
      )}
    </HStack>
    {children}
  </VStack>
);
