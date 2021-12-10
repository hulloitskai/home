import React, { FC, useMemo } from "react";
import { isEmpty } from "lodash";

import type { IconType } from "react-icons";
import {
  HiAnnotation,
  HiArchive,
  HiExternalLink,
  HiInboxIn,
  HiMenu,
  HiPencilAlt,
  HiRewind,
  HiTrash,
} from "react-icons/hi";

import { BoxProps, Box, VStack, HStack, Spacer } from "@chakra-ui/react";
import { Wrap } from "@chakra-ui/react";
import { BadgeProps, Badge } from "@chakra-ui/react";
import { Text, Code, Icon } from "@chakra-ui/react";
import { Button, IconButton } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";

import {
  MenuItemProps,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import { Disclosure } from "components/disclosure";
import { ExternalLink } from "components/link";
import { DeleteDialog } from "components/delete-dialog";

import { FormResponseDialog } from "components/form-response-dialog";
import {
  UpdateFormDialogProps,
  UpdateFormDialog,
} from "components/update-form-dialog";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useDeleteFormMutation, DeleteFormMutation } from "apollo/schema";
import { useArchiveFormMutation, ArchiveFormMutation } from "apollo/schema";
import { useRestoreFormMutation, RestoreFormMutation } from "apollo/schema";
import type { UpdateFormMutation } from "apollo/schema";
import type { FormCardFormFragment } from "apollo/schema";

gql`
  fragment FormCardForm on Form {
    id
    handle
    name
    description
    responses {
      id
      respondent
    }
    isArchived
  }
`;

export interface FormCardProps
  extends BoxProps,
    Pick<UpdateFormDialogProps, "onUpdate">,
    Pick<DeleteFormMenuItemProps, "onDelete">,
    Pick<ArchiveFormMenuItemProps, "onArchive">,
    Pick<RestoreFormMenuItemProps, "onRestore"> {
  readonly form: FormCardFormFragment;
}

export const FormCard: FC<FormCardProps> = ({
  form,
  onUpdate,
  onDelete,
  onArchive,
  onRestore,
  ...otherProps
}) => {
  const { id: formId, handle, name, description, responses, isArchived } = form;
  return (
    <VStack
      align="stretch"
      borderWidth={1}
      borderRadius="md"
      p={3}
      {...otherProps}
    >
      <HStack align="start">
        <VStack align="start" spacing={1}>
          <Text fontSize="lg" fontWeight="semibold">
            {name}
          </Text>
          <Code fontSize="xs">
            <ExternalLink href={`/research/${handle}`}>
              /research/{handle}
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
              <EditFormMenuItem {...{ formId, onUpdate }} />
              {isArchived ? (
                <RestoreFormMenuItem {...{ formId, onRestore }} />
              ) : (
                <ArchiveFormMenuItem {...{ formId, onArchive }} />
              )}
              <DeleteFormMenuItem {...{ formId, onDelete }} />
            </MenuList>
          </Menu>
          <ExternalLink
            href={`/research/${handle}`}
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
          label={`${responses.length} responses`}
          value={responses.length}
        />
        {isArchived ? (
          <FormStatBadge
            name="Archived"
            icon={HiArchive}
            label="Closed and no longer receiving responses"
            value="Archived"
            colorScheme="yellow"
          />
        ) : (
          <FormStatBadge
            name="Open"
            icon={HiInboxIn}
            label="Open and receiving responses"
            value="Open"
            colorScheme="green"
          />
        )}
      </HStack>
      {!!description && (
        <Text
          noOfLines={2}
          _light={{ color: "gray.500" }}
          _dark={{ color: "gray.400" }}
        >
          {description}
        </Text>
      )}
      {!isEmpty(responses) && (
        <>
          <Box />
          <VStack align="stretch" spacing={1.5}>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              _light={{ color: "gray.700" }}
              _dark={{ color: "gray.300" }}
            >
              Responses
            </Text>
            <Wrap spacing={1} shouldWrapChildren>
              {responses.map(({ id, respondent }) => (
                <Disclosure
                  key={id}
                  renderTrigger={({ open }) => (
                    <Button
                      variant="outline"
                      size="xs"
                      rounded="full"
                      onClick={open}
                      _light={{ color: "gray.600" }}
                      _dark={{ color: "gray.400" }}
                    >
                      {respondent}
                    </Button>
                  )}
                >
                  {props => <FormResponseDialog responseId={id} {...props} />}
                </Disclosure>
              ))}
            </Wrap>
          </VStack>
        </>
      )}
    </VStack>
  );
};

interface FormStatBadgeProps extends BadgeProps {
  readonly name: string;
  readonly icon: IconType;
  readonly value: string | number;
  readonly label?: string;
}

const FormStatBadge: FC<FormStatBadgeProps> = ({
  name,
  icon,
  value,
  label,
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
    <Tooltip label={label || name} {...tooltipStyles}>
      <Badge colorScheme="red" {...otherProps}>
        <HStack spacing={1}>
          <Icon as={icon} aria-label={name} />
          <Text>{value}</Text>
        </HStack>
      </Badge>
    </Tooltip>
  );
};

interface EditFormMenuItemProps extends MenuItemProps {
  readonly formId: string;
  readonly onUpdate?: (payload: UpdateFormMutation["payload"]) => void;
}

const EditFormMenuItem: FC<EditFormMenuItemProps> = ({
  formId,
  onUpdate,
  ...otherProps
}) => {
  return (
    <Disclosure
      renderTrigger={({ open }) => (
        <MenuItem
          icon={<Icon as={HiPencilAlt} fontSize="md" color="blue.500" />}
          onClick={open}
          {...otherProps}
        >
          Edit
        </MenuItem>
      )}
    >
      {props => (
        <UpdateFormDialog formId={formId} onUpdate={onUpdate} {...props} />
      )}
    </Disclosure>
  );
};

gql`
  mutation ArchiveForm($input: ArchiveFormInput!) {
    payload: archiveForm(input: $input) {
      form {
        id
        isArchived
      }
    }
  }
`;

interface ArchiveFormMenuItemProps extends MenuItemProps {
  readonly formId: string;
  readonly onArchive?: (payload: ArchiveFormMutation["payload"]) => void;
}

const ArchiveFormMenuItem: FC<ArchiveFormMenuItemProps> = ({
  formId,
  onArchive,
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to archive form");
  const [runMutation, { loading: isLoading }] = useArchiveFormMutation({
    onError: handleQueryError,
    onCompleted: ({ payload }) => {
      if (onArchive) {
        onArchive(payload);
      }
    },
  });
  return (
    <MenuItem
      icon={<Icon as={HiArchive} fontSize="md" color="yellow.500" />}
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
      Archive
    </MenuItem>
  );
};

gql`
  mutation RestoreForm($input: RestoreFormInput!) {
    payload: restoreForm(input: $input) {
      form {
        id
        isArchived
      }
    }
  }
`;

interface RestoreFormMenuItemProps extends MenuItemProps {
  readonly formId: string;
  readonly onRestore?: (payload: RestoreFormMutation["payload"]) => void;
}

const RestoreFormMenuItem: FC<RestoreFormMenuItemProps> = ({
  formId,
  onRestore,
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to restore form");
  const [runMutation, { loading: isLoading }] = useRestoreFormMutation({
    onError: handleQueryError,
    onCompleted: ({ payload }) => {
      if (onRestore) {
        onRestore(payload);
      }
    },
  });
  return (
    <MenuItem
      icon={<Icon as={HiRewind} fontSize="md" color="purple.500" />}
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
      Archive
    </MenuItem>
  );
};

gql`
  mutation DeleteForm($input: DeleteFormInput!) {
    payload: deleteForm(input: $input) {
      ok
    }
  }
`;

interface DeleteFormMenuItemProps extends MenuItemProps {
  readonly formId: string;
  readonly onDelete?: (payload: DeleteFormMutation["payload"]) => void;
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
    <Disclosure
      renderTrigger={({ open }) => (
        <MenuItem
          icon={<Icon as={HiTrash} fontSize="md" color="red.500" />}
          isDisabled={isLoading}
          onClick={open}
          {...otherProps}
        >
          Delete
        </MenuItem>
      )}
    >
      {props => (
        <DeleteDialog
          name="Form"
          onDelete={() => {
            runMutation({
              variables: {
                input: {
                  formId,
                },
              },
            });
          }}
          {...props}
        />
      )}
    </Disclosure>
  );
};
