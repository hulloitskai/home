import React from "react";

import NextLink from "next/link";
import { LinkProps as NextLinkProps } from "next/link";

import { LinkProps, Link } from "@chakra-ui/react";
import { LinkOverlayProps, LinkOverlay } from "@chakra-ui/react";
import { forwardRef } from "@chakra-ui/react";

export interface InternalLinkProps
  extends Omit<NextLinkProps, "passHref">,
    Omit<LinkProps, "as" | "href"> {}

export const InternalLink = forwardRef<InternalLinkProps, "a">(
  (
    { href, as, replace, scroll, shallow, prefetch, locale, ...otherProps },
    ref,
  ) => (
    <NextLink
      passHref
      {...{ href, as, replace, scroll, shallow, prefetch, locale }}
    >
      <Link ref={ref} {...otherProps} />
    </NextLink>
  ),
);

export interface InternalLinkOverlayProps
  extends Omit<NextLinkProps, "passHref">,
    Omit<LinkOverlayProps, "as" | "href"> {}

export const InternalLinkOverlay = forwardRef<InternalLinkOverlayProps, "a">(
  (
    { href, as, replace, scroll, shallow, prefetch, locale, ...otherProps },
    ref,
  ) => (
    <NextLink
      passHref
      {...{ href, as, replace, scroll, shallow, prefetch, locale }}
    >
      <LinkOverlay ref={ref} {...otherProps} />
    </NextLink>
  ),
);
