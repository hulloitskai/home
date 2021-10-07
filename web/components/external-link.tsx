import React from "react";
import { LinkProps, Link } from "@chakra-ui/react";
import { forwardRef } from "@chakra-ui/react";
import { LinkOverlayProps, LinkOverlay } from "@chakra-ui/react";

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
