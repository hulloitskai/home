import React, { FC, useEffect, useMemo } from "react";
import NextLink from "next/link";

import { HiChevronDown, HiLogout } from "react-icons/hi";

import { BoxProps } from "@chakra-ui/react";
import { StackProps, VStack, HStack, Center, Spacer } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { LinkBox, LinkOverlay, Link } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

import { gql } from "@apollo/client";
import { useUser } from "@auth0/nextjs-auth0";
import { useLayoutFooterViewerQuery } from "apollo";

export interface LayoutProps extends Omit<StackProps, "direction"> {
  badge: string;
  badgeTooltip?: string;
  showGreeting?: boolean;
}

export const Layout: FC<LayoutProps> = ({
  badge,
  badgeTooltip,
  showGreeting = true,
  children,
  ...otherProps
}) => {
  const tooltipBg = useColorModeValue("gray.900", undefined);
  const tooltipStyles = useMemo(
    () => ({
      hasArrow: true,
      bg: tooltipBg,
    }),
    [tooltipBg],
  );
  return (
    <VStack align="stretch" spacing={0} minH="100vh" {...otherProps}>
      <HStack px={6} py={4}>
        <HStack spacing={3}>
          <Tooltip
            label="You are loved."
            placement="bottom-end"
            {...tooltipStyles}
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
                    <Text
                      fontFamily="AppleColorEmoji, sans-serif"
                      fontSize="2xl"
                    >
                      ❤️
                    </Text>
                  </LinkOverlay>
                </NextLink>
              </Center>
            </LinkBox>
          </Tooltip>
          {showGreeting && (
            <Tooltip label="Hullo!" placement="bottom" {...tooltipStyles}>
              <Badge fontSize="sm" colorScheme="red">
                <NextLink href="/" passHref>
                  <Link _hover={{ textDecor: "none" }}>It&apos;s Kai</Link>
                </NextLink>
              </Badge>
            </Tooltip>
          )}
        </HStack>
        <Spacer />
        {!!badge && (
          <Tooltip
            label={badgeTooltip}
            placement="bottom-start"
            {...tooltipStyles}
          >
            <Badge
              fontSize="sm"
              bg="gray.500"
              color="gray.50"
              _dark={{ bg: "gray.700", color: "gray.300" }}
            >
              {badge}
            </Badge>
          </Tooltip>
        )}
      </HStack>
      {children}
      <LayoutFooter />
    </VStack>
  );
};

gql`
  query LayoutFooterViewer {
    viewer {
      id
      email
      isAdmin
    }
  }
`;

export type LayoutFooterProps = BoxProps;

export const LayoutFooter: FC<LayoutFooterProps> = () => {
  const { user, isLoading: userIsLoading } = useUser();

  const { data, refetch } = useLayoutFooterViewerQuery({
    skip: userIsLoading,
  });
  useEffect(() => {
    refetch();
  }, [user]);
  const { email, isAdmin } = data?.viewer ?? {};

  const tooltipBg = useColorModeValue("gray.900", undefined);
  const tooltipStyles = useMemo(
    () => ({
      hasArrow: true,
      bg: tooltipBg,
    }),
    [tooltipBg],
  );

  return (
    <HStack p={4} color="gray.600" _dark={{ color: "gray.400" }}>
      <Tooltip label="Thanks for coming!" placement="top" {...tooltipStyles}>
        <Text fontSize={["sm", "md"]}>
          Made by <chakra.span fontWeight="semibold">Kai</chakra.span>
          <chakra.span display={["none", "initial"]}>, with ❤️</chakra.span>.
        </Text>
      </Tooltip>
      <Spacer />
      {user ? (
        <Menu>
          <Tooltip
            label={isAdmin ? "Welcome back, supreme leader." : "Oh hai there!"}
            placement="top-start"
            {...tooltipStyles}
          >
            <MenuButton
              as={Button}
              variant="outline"
              size="sm"
              rightIcon={<Icon as={HiChevronDown} />}
            >
              <Text
                maxW={[24, 44, 56]}
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflowX="hidden"
              >
                {email}
              </Text>
            </MenuButton>
          </Tooltip>
          <MenuList>
            <Link href="/api/auth/logout" _hover={{ textDecor: "none" }}>
              <MenuItem
                icon={<Icon as={HiLogout} fontSize="md" color="red.600" />}
                iconSpacing={2}
              >
                Sign Out
              </MenuItem>
            </Link>
          </MenuList>
        </Menu>
      ) : (
        <Link href="/api/auth/login" _hover={{ textDecor: "none" }}>
          <Button size="sm" variant="outline">
            Sign In
          </Button>
        </Link>
      )}
    </HStack>
  );
};
