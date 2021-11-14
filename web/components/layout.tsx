import React, { FC } from "react";
import NextLink from "next/link";

import { StackProps } from "@chakra-ui/react";
import { VStack, HStack, Center, Spacer } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { LinkBox, LinkOverlay, Link } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";

export interface LayoutProps extends Omit<StackProps, "direction"> {
  badge?: string;
  badgeTooltip?: string;
}

const LAYOUT_TOOLTIP_THEME = {
  hasArrow: true,
  _light: { bg: "gray.900" },
};

export const Layout: FC<LayoutProps> = ({
  badge,
  badgeTooltip,
  children,
  ...otherProps
}) => (
  <VStack align="stretch" minH="100vh" pb={14} {...otherProps}>
    <HStack px={6} py={4}>
      <HStack spacing={3}>
        <Tooltip
          label="You are loved."
          placement="bottom-end"
          {...LAYOUT_TOOLTIP_THEME}
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
        <Tooltip label="Hullo!" placement="bottom" {...LAYOUT_TOOLTIP_THEME}>
          <Badge fontSize="sm" colorScheme="red">
            <NextLink href="/" passHref>
              <Link _hover={{ textDecor: "none" }}>It&apos;s Kai</Link>
            </NextLink>
          </Badge>
        </Tooltip>
      </HStack>
      <Spacer />
      {!!badge && (
        <Tooltip
          label={badgeTooltip}
          placement="bottom-start"
          {...LAYOUT_TOOLTIP_THEME}
        >
          <Badge
            fontSize="sm"
            bg="gray.500"
            color="gray.50"
            _dark={{ bg: "gray.800", color: "gray.300" }}
          >
            {badge}
          </Badge>
        </Tooltip>
      )}
    </HStack>
    {children}
  </VStack>
);