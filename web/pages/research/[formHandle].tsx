import React from "react";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps } from "next";

import { useForm, Controller } from "react-hook-form";

import { HiEyeOff } from "react-icons/hi";

import { Container, VStack, HStack } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
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

import { MetaTitle, MetaDescription } from "components/meta";
import { Layout } from "components/layout";
import { TextareaAutosize } from "components/textarea";

import { patchNodeFetchForSSR } from "components/apollo";
import { initializeApolloClient } from "components/apollo";
import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";

import {
  ResearchPagePropsDocument,
  ResearchPagePropsQuery,
  ResearchPagePropsQueryVariables,
} from "apollo";

import { useSubmitFormMutation } from "apollo";
import { useTransparentize } from "components/chakra";

interface ResearchPageProps {
  form: NonNullable<ResearchPagePropsQuery["form"]>;
}

gql`
  mutation SubmitForm($input: SubmitFormInput!) {
    payload: submitForm(input: $input) {
      ok
    }
  }
`;

const ResearchPage: NextPage<ResearchPageProps> = ({ form }) => {
  const {
    id: formId,
    handle,
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
            pathname: "/research/[form]/complete",
            query: {
              form: handle,
            },
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

  const transparentBlueLight = useTransparentize("blue.400", 0.4);
  const transparentBlueDark = useTransparentize("blue.400", 0.2);
  const transparentBlack = useTransparentize("black", 0.5);
  return (
    <>
      <MetaTitle page={[name, "Research"]} />
      <MetaDescription description={description || "Help me learn things!"} />
      <Layout
        badge="Research"
        badgeTooltip="Help me learn things!"
        align="center"
        py={[2, 4, 8]}
      >
        <Container as="form" onSubmit={onSubmit}>
          <VStack align="stretch" spacing={8}>
            <VStack align="stretch" spacing={4}>
              <VStack align="stretch" spacing={1}>
                <Heading>{name}</Heading>
                {!!description && (
                  <Text whiteSpace="pre-line" color="gray.500">
                    {description}
                  </Text>
                )}
              </VStack>
              <HStack
                spacing={2}
                rounded="md"
                p={3}
                color="gray.600"
                _light={{ bg: "gray.100" }}
                _dark={{ bg: "black" }}
              >
                <Icon as={HiEyeOff} fontSize="lg" />
                <Text fontSize="sm" fontWeight="medium">
                  Your response is confidential and will not be shared.
                </Text>
              </HStack>
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
                        {...register(`fields.${index}.text`, {
                          required: true,
                        })}
                      />
                    )}
                    {input.singleChoice && (
                      <Controller
                        control={control}
                        name={`fields.${index}.singleChoice`}
                        rules={{ required: true }}
                        render={({ field }) => {
                          const { value, onChange, onBlur } = field;
                          return (
                            <RadioGroup {...{ value, onChange, onBlur }}>
                              <VStack align="stretch">
                                {input.singleChoice!.options.map(option => (
                                  <Radio key={option} value={option}>
                                    {option}
                                  </Radio>
                                ))}
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
                        rules={{ required: true }}
                        render={({ field }) => {
                          const { value, onChange, onBlur } = field;
                          return (
                            <CheckboxGroup {...{ value, onChange, onBlur }}>
                              <VStack align="stretch">
                                {input.multipleChoice!.options.map(option => (
                                  <Checkbox key={option} value={option}>
                                    {option}
                                  </Checkbox>
                                ))}
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
              p={4}
              borderRadius="md"
              borderWidth={1}
              _light={{
                borderColor: "blue.500",
                bg: "blue.50",
              }}
              _dark={{
                borderColor: transparentBlueLight,
                bg: transparentBlueDark,
              }}
            >
              <FormControl isInvalid={!!formErrors.respondent}>
                <FormLabel
                  _light={{ color: "gray.800" }}
                  _dark={{ color: "gray.300" }}
                >
                  {respondentLabel || "Your Name"}
                </FormLabel>
                <Input
                  _light={{ bg: "white" }}
                  _dark={{
                    bg: transparentBlack,
                    borderColor: transparentBlueLight,
                  }}
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
                  <FormHelperText _light={{ color: "gray.500" }}>
                    {respondentHelper}
                  </FormHelperText>
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
    </>
  );
};

export default ResearchPage;

gql`
  query ResearchPageProps($formHandle: String!) {
    form: formByHandle(handle: $formHandle) {
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

export const getServerSideProps: GetServerSideProps<
  ResearchPageProps
> = async ({ query }) => {
  const { formHandle: formHandleParam } = query;
  const formHandle = Array.isArray(formHandleParam)
    ? formHandleParam[0]
    : formHandleParam;
  if (!formHandle) {
    return { notFound: true };
  }

  await patchNodeFetchForSSR();
  const client = initializeApolloClient();
  const { data } = await client.query<
    ResearchPagePropsQuery,
    ResearchPagePropsQueryVariables
  >({
    query: ResearchPagePropsDocument,
    variables: {
      formHandle,
    },
  });

  if (data.form) {
    const { form } = data;
    return {
      props: { form },
    };
  }
  return { notFound: true };
};
