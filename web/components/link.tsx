import React from "react";

import NextLink from "next/link";
import { LinkProps as NextLinkProps } from "next/link";

import { LinkProps, Link } from "@chakra-ui/react";
import { LinkOverlayProps, LinkOverlay } from "@chakra-ui/react";
import { forwardRef } from "@chakra-ui/react";

export type ExternalLinkProps = LinkProps;

export const ExternalLink: typeof Link = forwardRef(
  ({ ...otherProps }, ref) => (
    <Link
      ref={ref}
      target="_blank"
      rel="noopener noreferrer nofollow"
      {...otherProps}
    />
  ),
);

export type ExternalLinkOverlayProps = LinkOverlayProps;

export const ExternalLinkOverlay: typeof LinkOverlay = ({ ...otherProps }) => (
  <LinkOverlay
    target="_blank"
    rel="noopener noreferrer nofollow"
    {...otherProps}
  />
);

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
