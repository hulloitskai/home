import React, { FC, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0";

import type { IconType } from "react-icons";
import { HiAnnotation, HiExternalLink, HiPencil } from "react-icons/hi";

import { BoxProps, VStack, HStack, Spacer } from "@chakra-ui/react";
import { Heading, Text, Code } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";

import { Section } from "components/section";
import { InternalLink } from "components/internal-link";
import { ExternalLink } from "components/external-link";

import { gql } from "@apollo/client";
import { useAdminResearchSectionQuery } from "apollo";
import { useHandleQueryError } from "./apollo";

gql`
  query AdminResearchSection($skip: Int = 0) {
    forms(skip: $skip) {
      id
      handle
      name
      description
      responsesCount
      isArchived
    }
  }
`;

export type AdminResearchSectionProps = BoxProps;

export const AdminResearchSection: FC<AdminResearchSectionProps> = ({
  ...otherProps
}) => {
  const { user } = useUser();
  const handleQueryError = useHandleQueryError("Failed to load forms");
  const { data } = useAdminResearchSectionQuery({
    skip: !user,
    onError: handleQueryError,
  });
  const { forms } = data ?? {};
  return (
    <Section align="stretch" {...otherProps}>
      <Heading>Research</Heading>
      {forms ? (
        <VStack align="stretch">
          {forms.map(
            ({
              id: formId,
              handle: formHandle,
              name,
              description,
              responsesCount,
            }) => (
              <VStack
                key={formId}
                align="stretch"
                borderWidth={1}
                borderRadius="md"
                p={3}
              >
                <HStack align="start">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="semibold">
                      {name}
                    </Text>
                    <Code fontSize="xs">
                      <ExternalLink href={`/research/${formHandle}`}>
                        /research/{formHandle}
                      </ExternalLink>
                    </Code>
                  </VStack>
                  <Spacer />
                  <HStack spacing={1.5}>
                    <InternalLink
                      href={`/admin/form/${formId}`}
                      _hover={{ textDecor: "none" }}
                    >
                      <IconButton
                        icon={<Icon as={HiPencil} fontSize="sm" />}
                        aria-label="Open"
                        size="xs"
                        colorScheme="black"
                        isRound
                      />
                    </InternalLink>
                    <ExternalLink
                      href={`/research/${formHandle}`}
                      _hover={{ textDecor: "none" }}
                    >
                      <IconButton
                        icon={<Icon as={HiExternalLink} fontSize="sm" />}
                        aria-label="Open"
                        size="xs"
                        colorScheme="black"
                        isRound
                      />
                    </ExternalLink>
                  </HStack>
                </HStack>
                <HStack>
                  <FormStatBadge
                    name="Responses"
                    icon={HiAnnotation}
                    value={responsesCount}
                  />
                </HStack>
                <Text color="gray.500" noOfLines={2}>
                  {description}
                </Text>
              </VStack>
            ),
          )}
        </VStack>
      ) : (
        <Skeleton h={48} />
      )}
      {/* {forms.forEach()} */}
    </Section>
  );
};

interface FormStatBadgeProps {
  name: string;
  icon: IconType;
  value: string | number;
}

const FormStatBadge: FC<FormStatBadgeProps> = ({ name, icon, value }) => {
  const tooltipBg = useColorModeValue("gray.900", undefined);
  const tooltipStyles = useMemo(
    () => ({
      hasArrow: true,
      bg: tooltipBg,
    }),
    [tooltipBg],
  );
  return (
    <Tooltip label={name} {...tooltipStyles}>
      <Badge colorScheme="red">
        <HStack spacing={1}>
          <Icon as={icon} aria-label={name} />
          <Text>{value}</Text>
        </HStack>
      </Badge>
    </Tooltip>
  );
};
