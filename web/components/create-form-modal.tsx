import React, { FC, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@chakra-ui/react";

import {
  ModalProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { FormFields } from "components/form-fields";
import { parseFormFieldValues, FormFieldValues } from "components/form-fields";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { CreateFormMutation, useCreateFormMutation } from "apollo";

gql`
  mutation CreateForm($input: CreateFormInput!) {
    payload: createForm(input: $input) {
      form {
        id
        handle
        name
        description
        fields {
          question
          input {
            text
            singleChoice {
              options
            }
            multipleChoice {
              options
            }
          }
        }
        respondentLabel
        respondentHelper
      }
    }
  }
`;

export interface CreateFormModalProps extends Omit<ModalProps, "children"> {
  onCreate?: (payload: CreateFormMutation["payload"]) => void;
}

export const CreateFormModal: FC<CreateFormModalProps> = ({
  onCreate,
  onClose,
  isOpen,
  ...otherProps
}) => {
  const handleMutationError = useHandleQueryError("Failed to create form");
  const [runMutation, { loading: isMutationLoading }] = useCreateFormMutation({
    onError: handleMutationError,
    onCompleted: ({ payload }) => {
      onClose();
      if (onCreate) {
        onCreate(payload);
      }
    },
  });

  const formMethods = useForm<FormFieldValues>({ mode: "all" });
  const {
    handleSubmit,
    reset,
    formState: { isValid },
  } = formMethods;
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen]);

  const onSubmit = handleSubmit(async values => {
    await runMutation({
      variables: {
        input: parseFormFieldValues(values),
      },
    });
  });

  return (
    <Modal {...{ isOpen, onClose }} {...otherProps}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit}>
        <ModalHeader>Create Form</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormFields formMethods={formMethods} mode="create" />
        </ModalBody>
        <ModalFooter>
          <Button
            type="submit"
            colorScheme="black"
            isDisabled={!isValid}
            isLoading={isMutationLoading}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
