import React, { FC, useMemo } from "react";
import { isEmpty } from "lodash";

import type { IconType } from "react-icons";
import {
  HiAnnotation,
  HiArchive,
  HiExternalLink,
  HiMenu,
  HiPencilAlt,
  HiTrash,
} from "react-icons/hi";

import { BoxProps, Box, VStack, HStack, Spacer } from "@chakra-ui/react";
import { Wrap } from "@chakra-ui/react";
import { Text, Code, Icon, Badge } from "@chakra-ui/react";
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
import { ConfirtDeleteAlert } from "components/confirm-delete-alert";
import { useToast } from "components/toast";

import { FormResponseModal } from "components/form-response-modal";
import {
  UpdateFormModalProps,
  UpdateFormModal,
} from "components/update-form-modal";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useDeleteFormMutation, DeleteFormMutation } from "apollo";
import type { UpdateFormMutation } from "apollo";
import type { FormCardFormFragment } from "apollo";

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
  }
`;

export interface FormCardProps
  extends BoxProps,
    Pick<UpdateFormModalProps, "onUpdate">,
    Pick<DeleteFormMenuItemProps, "onDelete"> {
  readonly form: FormCardFormFragment;
}

export const FormCard: FC<FormCardProps> = ({
  form,
  onUpdate,
  onDelete,
  ...otherProps
}) => {
  const toast = useToast();
  const { id: formId, handle, name, description, responses } = form;
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
              <MenuItem
                icon={<Icon as={HiArchive} fontSize="md" color="yellow.500" />}
                onClick={() => {
                  toast({
                    status: "info",
                    description: "Not implemented!",
                  });
                }}
              >
                Archive
              </MenuItem>
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
          value={responses.length}
        />
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
                  {props => <FormResponseModal responseId={id} {...props} />}
                </Disclosure>
              ))}
            </Wrap>
          </VStack>
        </>
      )}
    </VStack>
  );
};

interface FormStatBadgeProps {
  readonly name: string;
  readonly icon: IconType;
  readonly value: string | number;
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
        <UpdateFormModal formId={formId} onUpdate={onUpdate} {...props} />
      )}
    </Disclosure>
  );
};

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
        <ConfirtDeleteAlert
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
