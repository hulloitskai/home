import React, { FC, useMemo } from "react";
import { isEmpty } from "lodash";
import { useUser } from "@auth0/nextjs-auth0";

import type { IconType } from "react-icons";
import {
  HiAnnotation,
  HiArchive,
  HiExternalLink,
  HiMenu,
  HiPencilAlt,
  HiPlusCircle,
  HiTrash,
} from "react-icons/hi";

import { BoxProps, VStack, HStack, Spacer } from "@chakra-ui/react";
import { Heading, Text, Code } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";

import {
  MenuItemProps,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import { Section } from "components/section";
import { SkeletonBlock } from "components/skeleton";
import { NoContent } from "components/no-content";
import { ExternalLink } from "components/external-link";
import { useToast } from "components/toast";

import { CreateFormButton } from "components/create-form-modal";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useAdminResearchSectionQuery } from "apollo";
import { useDeleteFormMutation, DeleteFormMutation } from "apollo";

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

gql`
  mutation DeleteForm($input: DeleteFormInput!) {
    payload: deleteForm(input: $input) {
      ok
    }
  }
`;

export type AdminResearchSectionProps = BoxProps;

export const AdminResearchSection: FC<AdminResearchSectionProps> = ({
  ...otherProps
}) => {
  const toast = useToast();
  const { user } = useUser();

  const handleQueryError = useHandleQueryError("Failed to load forms");
  const { data, refetch } = useAdminResearchSectionQuery({
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
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<Icon as={HiMenu} fontSize="sm" />}
                        aria-label="Actions"
                        size="xs"
                        colorScheme="black"
                        isRound
                      />
                      <MenuList>
                        <MenuItem
                          icon={
                            <Icon
                              as={HiPencilAlt}
                              fontSize="md"
                              color="blue.500"
                            />
                          }
                          onClick={() => {
                            toast({
                              status: "info",
                              description: "Not implemented!",
                            });
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={
                            <Icon
                              as={HiArchive}
                              fontSize="md"
                              color="yellow.500"
                            />
                          }
                          onClick={() => {
                            toast({
                              status: "info",
                              description: "Not implemented!",
                            });
                          }}
                        >
                          Archive
                        </MenuItem>
                        <DeleteFormMenuItem
                          formId={formId}
                          onDelete={() => {
                            refetch();
                          }}
                        />
                      </MenuList>
                    </Menu>
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
          {isEmpty(forms) && (
            <NoContent>You don&apos;t have any forms.</NoContent>
          )}
          <CreateFormButton
            leftIcon={<Icon as={HiPlusCircle} fontSize="lg" />}
            onCreate={() => {
              refetch();
            }}
          />
        </VStack>
      ) : (
        <SkeletonBlock />
      )}
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

interface DeleteFormMenuItemProps extends MenuItemProps {
  formId: string;
  onDelete?: (payload: DeleteFormMutation["payload"]) => void;
}

const DeleteFormMenuItem: FC<DeleteFormMenuItemProps> = ({
  formId,
  onDelete,
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to delete form");
  const [runMutation, { loading: isLoading }] = useDeleteFormMutation({
    onError: handleQueryError,
    onCompleted: ({ payload }) => {
      if (onDelete) {
        onDelete(payload);
      }
    },
  });
  return (
    <MenuItem
      icon={<Icon as={HiTrash} fontSize="md" color="red.500" />}
      isDisabled={isLoading}
      onClick={() => {
        runMutation({
          variables: {
            input: {
              formId,
            },
          },
        });
      }}
      {...otherProps}
    >
      Delete
    </MenuItem>
  );
};
