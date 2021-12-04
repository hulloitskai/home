import React, { FC, useMemo } from "react";
import { zipWith } from "lodash";

import { Box, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { OrderedList, ListItem } from "@chakra-ui/react";
import { CheckboxGroup, Checkbox } from "@chakra-ui/react";
import { RadioGroup, Radio } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/react";

import {
  ModalProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from "@chakra-ui/react";

import { TextareaAutosize } from "components/textarea";
import { SkeletonBlock } from "components/skeleton";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useFormResponseDialogQuery } from "apollo";

gql`
  query FormResponseDialog($responseId: ID!) {
    formResponse(id: $responseId) {
      id
      respondent
      fields {
        text
        singleChoice
        multipleChoice
      }
      form {
        id
        name
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
      }
    }
  }
`;

export interface FormResponseDialogProps extends Omit<ModalProps, "children"> {
  readonly responseId: string;
}

export const FormResponseDialog: FC<FormResponseDialogProps> = ({
  responseId,
  isOpen,
  ...otherProps
}) => {
  const handleQueryError = useHandleQueryError("Failed to load form response");
  const { data } = useFormResponseDialogQuery({
    variables: {
      responseId,
    },
    skip: !isOpen,
    fetchPolicy: "network-only",
    onError: handleQueryError,
  });

  const { respondent, form, fields: responseFields } = data?.formResponse ?? {};
  const { name: formName, fields: formFields } = form ?? {};

  type Field = {
    question: string;
    input: FieldInput;
  };
  type FieldInput = {
    text?: { value: string };
    singleChoice?: { options: string[]; value: string };
    multipleChoice?: { options: string[]; value: string[] };
  };

  const fields = useMemo<Field[] | undefined>(() => {
    if (formFields && responseFields) {
      return zipWith(
        formFields,
        responseFields,
        /* eslint-disable @typescript-eslint/no-unused-vars */
        ({ question, input: formInput }, response): Field => {
          const input: FieldInput = {};
          if (formInput.text) {
            if (!response.text) {
              throw new Error("Missing text response.");
            }
            input.text = {
              value: response.text,
            };
          }
          if (formInput.singleChoice) {
            if (!response.singleChoice) {
              throw new Error("Missing single-choice response.");
            }
            input.singleChoice = {
              options: formInput.singleChoice.options,
              value: response.singleChoice,
            };
          }
          if (formInput.multipleChoice) {
            if (!response.multipleChoice) {
              throw new Error("Missing multiple-choice response.");
            }
            input.multipleChoice = {
              options: formInput.multipleChoice.options,
              value: response.multipleChoice,
            };
          }
          return { question, input };
        },
        /* eslint-enable @typescript-eslint/no-unused-vars */
      );
    }
  }, [formFields, responseFields]);

  return (
    <Modal {...{ isOpen }} {...otherProps}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="stretch" spacing={!data ? 1 : 0}>
            <Skeleton isLoaded={!!respondent}>
              <Text>Response from {respondent || "Placeholder"}</Text>
            </Skeleton>
            <Skeleton isLoaded={!!formName}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                _light={{ color: "gray.500" }}
                _dark={{ color: "gray.400" }}
              >
                On &quot;{formName || "Placeholder"}&quot;
              </Text>
            </Skeleton>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {fields ? (
            <OrderedList spacing={4}>
              {fields.map(({ question, input }) => (
                <ListItem
                  key={question}
                  fontWeight="medium"
                  _light={{
                    "::marker": {
                      color: "gray.500",
                    },
                  }}
                  _dark={{
                    "::marker": {
                      color: "gray.400",
                    },
                  }}
                >
                  <VStack align="stretch" spacing={1}>
                    <Text
                      _light={{ color: "gray.500" }}
                      _dark={{ color: "gray.400" }}
                    >
                      {question}
                    </Text>
                    <Box fontWeight="normal" color="inherit">
                      {!!input.text && (
                        <TextareaAutosize
                          value={input.text.value}
                          minRows={1}
                          isReadOnly
                        />
                      )}
                      {!!input.singleChoice && (
                        <RadioGroup value={input.singleChoice.value}>
                          <VStack align="stretch" spacing={1}>
                            {input.singleChoice.options.map(option => (
                              <Radio key={option} value={option} isReadOnly>
                                {option}
                              </Radio>
                            ))}
                          </VStack>
                        </RadioGroup>
                      )}
                      {!!input.multipleChoice && (
                        <CheckboxGroup value={input.multipleChoice.value}>
                          <VStack align="stretch" spacing={1}>
                            {input.multipleChoice.options.map(option => (
                              <Checkbox key={option} value={option} isReadOnly>
                                {option}
                              </Checkbox>
                            ))}
                          </VStack>
                        </CheckboxGroup>
                      )}{" "}
                    </Box>
                  </VStack>
                </ListItem>
              ))}
            </OrderedList>
          ) : (
            <SkeletonBlock />
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};
