import React, { FC, useEffect, useMemo } from "react";
import { useForm, DefaultValues } from "react-hook-form";

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
import {
  parseFormFieldValues,
  FormFieldValues,
  FormFieldValue,
  FormFieldInputConfigValue,
} from "components/form-fields";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useUpdateFormDialogQuery } from "apollo/schema";
import { useUpdateFormMutation, UpdateFormMutation } from "apollo/schema";

gql`
  query UpdateFormDialog($formId: ID!) {
    form(id: $formId) {
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
`;

gql`
  mutation UpdateForm($input: UpdateFormInput!) {
    payload: updateForm(input: $input) {
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

export interface UpdateFormDialogProps extends Omit<ModalProps, "children"> {
  formId: string;
  onUpdate?: (payload: UpdateFormMutation["payload"]) => void;
}

export const UpdateFormDialog: FC<UpdateFormDialogProps> = ({
  formId,
  onUpdate,
  onClose,
  isOpen,
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to load form");
  const { data, loading: isLoading } = useUpdateFormDialogQuery({
    variables: { formId },
    skip: !isOpen,
    onError: handleQueryError,
  });
  const { form } = data ?? {};

  const handleMutationError = useHandleQueryError("Failed to update form");
  const [runMutation, { loading: isMutationLoading }] = useUpdateFormMutation({
    onError: handleMutationError,
    onCompleted: ({ payload }) => {
      onClose();
      if (onUpdate) {
        onUpdate(payload);
      }
    },
  });

  const defaultValues = useMemo<DefaultValues<FormFieldValues>>(() => {
    if (form) {
      const {
        name,
        handle,
        description,
        fields,
        respondentLabel,
        respondentHelper,
      } = form;

      return {
        name,
        handle,
        description: description ?? undefined,
        fields: fields.map(
          ({ question, input }): DefaultValues<FormFieldValue> => {
            return {
              question,
              input: ((): DefaultValues<FormFieldInputConfigValue> => {
                const { text, singleChoice, multipleChoice } = input;
                return {
                  type: ((): FormFieldInputConfigValue["type"] => {
                    if (text) {
                      return "TEXT";
                    }
                    if (singleChoice) {
                      return "SINGLE_CHOICE";
                    }
                    if (multipleChoice) {
                      return "MULTIPLE_CHOICE";
                    }
                    throw new Error("Unknown input type.");
                  })(),
                  singleChoice: (():
                    | FormFieldInputConfigValue["singleChoice"]
                    | undefined => {
                    if (singleChoice) {
                      const { options } = singleChoice;
                      return { options: options.join("; ") };
                    }
                  })(),
                  multipleChoice: (():
                    | FormFieldInputConfigValue["multipleChoice"]
                    | undefined => {
                    if (multipleChoice) {
                      const { options } = multipleChoice;
                      return { options: options.join("; ") };
                    }
                  })(),
                };
              })(),
            };
          },
        ),
        respondent: {
          label: respondentLabel ?? undefined,
          helper: respondentHelper ?? undefined,
        },
      };
    }
    return {};
  }, [form]);

  const formMethods = useForm<FormFieldValues>({
    mode: "all",
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    formState: { isValid },
  } = formMethods;
  useEffect(
    () => {
      if (isOpen) {
        reset(defaultValues);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, defaultValues],
  );

  const onSubmit = handleSubmit(async values => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fields, ...input } = parseFormFieldValues(values);
    await runMutation({
      variables: {
        input: {
          formId,
          ...input,
        },
      },
    });
  });

  return (
    <Modal {...{ isOpen, onClose }} {...otherProps}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit}>
        <ModalHeader>Update Form</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormFields
            formMethods={formMethods}
            mode="update"
            isDisabled={isLoading}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            type="submit"
            colorScheme="black"
            isDisabled={!isValid}
            isLoading={isMutationLoading}
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
