import React from "react";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps } from "next";

import { useForm, Controller } from "react-hook-form";

import { Container, VStack } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import { RadioGroup, Radio } from "@chakra-ui/react";
import { CheckboxGroup, Checkbox } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";

import { Layout } from "components/layout";
import { TextareaAutosize } from "components/textarea";

import { initializeApolloClient, useHandleQueryError } from "components/apollo";
import { gql } from "@apollo/client";

import {
  ResearchPagePropsDocument,
  ResearchPagePropsQuery,
  ResearchPagePropsQueryVariables,
} from "apollo";

import { useSubmitFormMutation } from "apollo";
import { useTransparentize } from "components/chakra";

type ResearchPageParams = {
  handle: string;
};

interface ResearchPageProps {
  form: NonNullable<ResearchPagePropsQuery["form"]>;
  params: ResearchPageParams;
}

gql`
  mutation SubmitForm($input: SubmitFormInput!) {
    payload: submitForm(input: $input) {
      ok
    }
  }
`;

const ResearchPage: NextPage<ResearchPageProps> = ({ form, params }) => {
  const {
    id: formId,
    name,
    description,
    fields,
    respondentLabel,
    respondentHelper,
  } = form;

  const { register, control, formState, handleSubmit } = useForm<{
    respondent: string;
    fields: {
      text?: string;
      singleChoice?: string;
      multipleChoice?: string[];
    }[];
  }>({ mode: "all" });
  const { errors: formErrors, isValid: formIsValid } = formState;

  const router = useRouter();
  const handleSubmitMutationError = useHandleQueryError("Submission failed");
  const [runSubmitMutation, { loading: submitMutationIsLoading }] =
    useSubmitFormMutation({
      onCompleted: ({ payload }) => {
        if (payload.ok) {
          router.push({
            pathname: "/research/[handle]/complete",
            query: params,
          });
        }
      },
      onError: handleSubmitMutationError,
    });

  const onSubmit = handleSubmit(({ respondent, fields }) => {
    runSubmitMutation({
      variables: {
        input: {
          formId,
          respondent,
          fields,
        },
      },
    });
  });

  const transparentBlue = useTransparentize("blue.400", 0.25);
  const transparentBlueBorder = useTransparentize("blue.400", 0.4);
  return (
    <Layout badge="Research">
      <Container as="form" onSubmit={onSubmit} alignSelf="center">
        <VStack align="stretch" spacing={8}>
          <VStack align="stretch" spacing={1}>
            <Heading>{name}</Heading>
            {!!description && <Text color="gray.500">{description}</Text>}
          </VStack>
          {fields.map(({ question, input }, index) => {
            return (
              <VStack key={index} align="stretch">
                <Text fontWeight="medium" color="gray.500">
                  {question}
                </Text>
                <FormControl isInvalid={!!(formErrors.fields ?? [])[index]}>
                  {input.text && (
                    <TextareaAutosize
                      {...register(`fields.${index}.text`, { required: true })}
                    />
                  )}
                  {input.singleChoice && (
                    <Controller
                      control={control}
                      name={`fields.${index}.singleChoice`}
                      render={({ field }) => {
                        const { value, onChange, onBlur } = field;
                        return (
                          <RadioGroup {...{ value, onChange, onBlur }}>
                            <VStack align="stretch">
                              {input.singleChoice!.options.map(option => {
                                return (
                                  <Radio key={option} value={option}>
                                    {option}
                                  </Radio>
                                );
                              })}
                            </VStack>
                          </RadioGroup>
                        );
                      }}
                    />
                  )}
                  {input.multipleChoice && (
                    <Controller
                      control={control}
                      name={`fields.${index}.multipleChoice`}
                      render={({ field }) => {
                        const { value, onChange, onBlur } = field;
                        return (
                          <CheckboxGroup {...{ value, onChange, onBlur }}>
                            <VStack align="stretch">
                              {input.multipleChoice!.options.map(option => {
                                return (
                                  <Checkbox key={option} value={option}>
                                    {option}
                                  </Checkbox>
                                );
                              })}
                            </VStack>
                          </CheckboxGroup>
                        );
                      }}
                    />
                  )}
                </FormControl>
              </VStack>
            );
          })}
          <VStack
            align="stretch"
            spacing={4}
            borderRadius="md"
            borderColor="blue.500"
            borderWidth={1}
            bg="blue.50"
            p={4}
            _dark={{
              bg: transparentBlue,
              borderColor: transparentBlueBorder,
            }}
          >
            <FormControl isInvalid={!!formErrors.respondent}>
              <FormLabel color="gray.800" _dark={{ color: "gray.300" }}>
                {respondentLabel || "Name"}
              </FormLabel>
              <Input
                bg="white"
                _dark={{ bg: "black", borderColor: transparentBlueBorder }}
                {...register("respondent", {
                  required: {
                    value: true,
                    message: "Please let me know who you are!",
                  },
                })}
              />
              {!!formErrors.respondent?.message && (
                <FormErrorMessage>
                  {formErrors.respondent.message}
                </FormErrorMessage>
              )}
              {!!respondentHelper && (
                <FormHelperText>{respondentHelper}</FormHelperText>
              )}
            </FormControl>
            <Button
              type="submit"
              variant="solid"
              colorScheme="black"
              isLoading={submitMutationIsLoading}
              isDisabled={!formIsValid}
            >
              Submit
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Layout>
  );
};

export default ResearchPage;

gql`
  query ResearchPageProps($handle: String!) {
    form: formByHandle(handle: $handle) {
      id
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

export const getServerSideProps: GetServerSideProps<ResearchPageProps> =
  async ({ query }) => {
    const { handle: handleParam } = query;
    const handle = Array.isArray(handleParam) ? handleParam[0] : handleParam;
    if (!handle) {
      return { notFound: true };
    }

    const client = initializeApolloClient();
    const { data } = await client.query<
      ResearchPagePropsQuery,
      ResearchPagePropsQueryVariables
    >({
      query: ResearchPagePropsDocument,
      variables: {
        handle,
      },
    });

    if (data.form) {
      const { form } = data;
      return {
        props: {
          form,
          params: {
            handle,
          },
        },
      };
    }
    return { notFound: true };
  };
