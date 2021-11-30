import React, { FC, useEffect, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0";

import { HiChevronUp, HiLogout, HiTerminal } from "react-icons/hi";

import { BoxProps, Box } from "@chakra-ui/react";
import { StackProps, VStack, HStack, Center, Spacer } from "@chakra-ui/react";
import { Text, Icon, Badge, Link, LinkBox } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";

import { InternalLink, InternalLinkOverlay } from "components/link";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useLayoutFooterViewerQuery } from "apollo";

export interface LayoutProps extends Omit<StackProps, "direction"> {
  badge: string;
  badgeTooltip?: string;
}

export const Layout: FC<LayoutProps> = ({
  badge,
  badgeTooltip,
  p,
  px,
  py,
  pl,
  pr,
  pt,
  pb,
  padding,
  paddingX,
  paddingY,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  flexDir,
  flexDirection,
  align = "stretch",
  alignContent,
  alignItems,
  justify,
  justifyContent,
  justifyItems,
  spacing,
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
      <HStack align="start" p={4}>
        <Box px={0.5}>
          <Tooltip
            label="You are loved."
            placement="bottom-end"
            {...tooltipStyles}
          >
            <LinkBox pos="relative">
              <Text fontFamily="emoji" fontSize="xl" filter="blur(0.6rem)">
                ❤️
              </Text>
              <Center pos="absolute" inset={0}>
                <InternalLinkOverlay href="/">
                  <Text fontFamily="emoji" fontSize="2xl">
                    ❤️
                  </Text>
                </InternalLinkOverlay>
              </Center>
            </LinkBox>
          </Tooltip>
        </Box>
        <Spacer />
        {!!badge && (
          <Tooltip
            label={badgeTooltip}
            placement="bottom-start"
            {...tooltipStyles}
          >
            <Badge
              fontSize="sm"
              _light={{ color: "gray.50", bg: "gray.500" }}
              _dark={{ color: "gray.300", bg: "gray.700" }}
            >
              {badge}
            </Badge>
          </Tooltip>
        )}
      </HStack>
      <VStack
        flex={1}
        flexDir={flexDir ?? flexDirection}
        align={align ?? alignItems}
        alignContent={alignContent}
        justify={justify ?? justifyContent}
        justifyItems={justifyItems}
        {...{
          p,
          px,
          py,
          pl,
          pr,
          pt,
          pb,
          padding,
          paddingX,
          paddingY,
          paddingLeft,
          paddingRight,
          paddingTop,
          paddingBottom,
          spacing,
        }}
      >
        {children}
      </VStack>
      <LayoutFooter justifySelf="end" />
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

  const handleQueryError = useHandleQueryError("Failed to load viewer");
  const {
    data,
    refetch,
    loading: queryIsLoading,
  } = useLayoutFooterViewerQuery({
    skip: userIsLoading,
    onError: handleQueryError,
  });
  const { viewer } = data ?? {};
  const { email, isAdmin } = viewer ?? {};
  useEffect(() => {
    refetch();
  }, [user]);

  const tooltipBg = useColorModeValue("gray.900", undefined);
  const tooltipStyles = useMemo(
    () => ({
      hasArrow: true,
      bg: tooltipBg,
    }),
    [tooltipBg],
  );

  return (
    <HStack p={4} _light={{ color: "gray.600" }} _dark={{ color: "gray.400" }}>
      <Tooltip
        label={
          <>
            Thanks for visiting!{" "}
            <chakra.span fontFamily="emoji">️☺</chakra.span>
          </>
        }
        placement="top"
        {...tooltipStyles}
      >
        <Text fontSize="sm">
          Made by <chakra.span fontWeight="semibold">Kai</chakra.span>
          <chakra.span display={["none", "initial"]}>
            , with <chakra.span fontFamily="emoji">❤️</chakra.span>
          </chakra.span>
          .
        </Text>
      </Tooltip>
      <Spacer />
      {viewer || (user && queryIsLoading) ? (
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
              iconSpacing={1}
              rightIcon={<Icon as={HiChevronUp} fontSize="md" />}
              isLoading={queryIsLoading}
              isDisabled={!viewer}
            >
              <Text
                maxW={[24, 44, 56]}
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflowX="hidden"
              >
                {email || "example@example.com"}
              </Text>
            </MenuButton>
          </Tooltip>
          <MenuList>
            {isAdmin && (
              <InternalLink href="/admin" _hover={{ textDecor: "none" }}>
                <MenuItem
                  icon={<Icon as={HiTerminal} fontSize="md" color="red.600" />}
                  iconSpacing={2}
                >
                  Manage
                </MenuItem>
              </InternalLink>
            )}
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
        <Tooltip
          label={
            <>
              Only for internal use right now.{" "}
              <chakra.span fontFamily="emoji">🤫</chakra.span>
            </>
          }
          placement="top-start"
          {...tooltipStyles}
        >
          <Link href="/api/auth/login" _hover={{ textDecor: "none" }}>
            <Button size="sm" variant="outline" tabIndex={-1}>
              Sign In
            </Button>
          </Link>
        </Tooltip>
      )}
    </HStack>
  );
};
