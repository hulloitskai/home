import React, { FC, useEffect, useMemo } from "react";
import { useForm, DefaultValues } from "react-hook-form";

import { ButtonProps, Button } from "@chakra-ui/react";

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

import { ModalTrigger } from "components/modal-trigger";

import { FormFields } from "components/form-fields";
import { FormFieldValues } from "components/form-fields";
import { parseFormFieldValues } from "components/form-fields";

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
  const handleCreateFormError = useHandleQueryError("Failed to create form");
  const [runCreateFormMutation, { loading: isCreateFormLoading }] =
    useCreateFormMutation({
      onError: handleCreateFormError,
      onCompleted: ({ payload }) => {
        onClose();
        if (onCreate) {
          onCreate(payload);
        }
      },
    });

  const defaultValues: DefaultValues<FormFieldValues> = useMemo(
    () => ({ fields: [] }),
    [],
  );
  const formMethods = useForm<FormFieldValues>({
    mode: "all",
    defaultValues,
  });
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
    await runCreateFormMutation({
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
          <FormFields formMethods={formMethods} />
        </ModalBody>
        <ModalFooter>
          <Button
            type="submit"
            colorScheme="black"
            isDisabled={!isValid}
            isLoading={isCreateFormLoading}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export interface CreateFormButtonProps
  extends ButtonProps,
    Pick<CreateFormModalProps, "onCreate"> {}

export const CreateFormButton: FC<CreateFormButtonProps> = ({
  onCreate,
  ...otherProps
}) => {
  return (
    <ModalTrigger
      renderTrigger={({ open }) => (
        <Button colorScheme="black" onClick={open} {...otherProps}>
          Create Form
        </Button>
      )}
      renderModal={props => <CreateFormModal onCreate={onCreate} {...props} />}
    />
  );
};
