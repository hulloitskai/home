import React from "react";
import type { NextPage, GetServerSideProps } from "next";

import { useForm } from "react-hook-form";

/* This page is a WIP: */
/* eslint-disable */

import { Container, Center, VStack, HStack } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import { Section } from "components/section";
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

import { Layout } from "components/layout";
import { TextareaAutosize } from "components/textarea";

import { patchNodeFetchForSSR } from "components/apollo";
import { initializeApolloClient } from "components/apollo";
import { gql } from "@apollo/client";
// import { useHandleQueryError } from "components/apollo";

import {
  AdminFormPagePropsDocument,
  AdminFormPagePropsQuery,
  AdminFormPagePropsQueryVariables,
} from "apollo";

// import { useSubmitFormMutation } from "apollo";
import { useTransparentize } from "components/chakra";

interface AdminFormPageProps {
  form: NonNullable<AdminFormPagePropsQuery["form"]>;
}

// gql`
//   mutation SubmitForm($input: SubmitFormInput!) {
//     payload: submitForm(input: $input) {
//       ok
//     }
//   }
// `;

const AdminFormPage: NextPage<AdminFormPageProps> = ({ form }) => {
  const { name, description } = form;

  const { register, control, formState } = useForm<{
    respondent: string;
    fields: {
      text?: string;
      singleChoice?: string;
      multipleChoice?: string[];
    }[];
  }>({ mode: "all" });
  const { errors: formErrors, isValid: formIsValid } = formState;

  // const router = useRouter();
  // const handleSubmitMutationError = useHandleQueryError("Submission failed");
  // const [runSubmitMutation, { loading: submitMutationIsLoading }] =
  //   useSubmitFormMutation({
  //     onCompleted: ({ payload }) => {
  //       if (payload.ok) {
  //         router.push({
  //           pathname: "/research/[form]/complete",
  //           query: {
  //             form: handle,
  //           },
  //         });
  //       }
  //     },
  //     onError: handleSubmitMutationError,
  //   });

  // const onSubmit = handleSubmit(({ respondent, fields }) => {
  //   runSubmitMutation({
  //     variables: {
  //       input: {
  //         formId,
  //         respondent,
  //         fields,
  //       },
  //     },
  //   });
  // });

  const transparentBlueLight = useTransparentize("blue.400", 0.4);
  const transparentBlueDark = useTransparentize("blue.400", 0.2);
  const transparentBlack = useTransparentize("black", 0.5);
  return (
    <Layout
      badge="Admin"
      badgeTooltip="With great power comes great responsibility."
      // py={[2, 4, 8]}
    >
      {/* <Container as="form">
        <VStack align="stretch" spacing={8}>
          <VStack align="stretch" spacing={4}>
            <VStack align="stretch" spacing={1}>
              <Heading>{name}</Heading>
              {!!description && <Text color="gray.500">{description}</Text>}
            </VStack>
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
        </VStack>
      </Container> */}
      <Center flex={1}>
        <Section>
          <Center>
            <Text fontSize="3xl">🚧</Text>
          </Center>
          <Text color="gray.500" fontSize="lg" fontWeight="semibold">
            <Text as="span" color="gray.800" _dark={{ color: "gray.200" }}>
              This is a work-in-progress.
            </Text>
            <br />
            Come back again later!
          </Text>
        </Section>
      </Center>
    </Layout>
  );
};

export default AdminFormPage;

gql`
  query AdminFormPageProps($formId: ID!) {
    form(id: $formId) {
      id
      handle
      name
      description
      # fields {
      #   question
      #   input {
      #     text
      #     singleChoice {
      #       options
      #     }
      #     multipleChoice {
      #       options
      #     }
      #   }
      # }
      # respondentLabel
      # respondentHelper
    }
  }
`;

export const getServerSideProps: GetServerSideProps<AdminFormPageProps> =
  async ({ query }) => {
    const { formId: formIdParam } = query;
    const formId = Array.isArray(formIdParam) ? formIdParam[0] : formIdParam;
    if (!formId) {
      return { notFound: true };
    }

    await patchNodeFetchForSSR();
    const client = initializeApolloClient();
    const { data } = await client.query<
      AdminFormPagePropsQuery,
      AdminFormPagePropsQueryVariables
    >({
      query: AdminFormPagePropsDocument,
      variables: {
        formId,
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
