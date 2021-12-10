import React, { FC, useEffect, useMemo } from "react";
import { isEmpty, uniq } from "lodash";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { useWatch, get } from "react-hook-form";

import { HiPlusCircle } from "react-icons/hi";

import { BoxProps, Box, VStack } from "@chakra-ui/react";
import { Icon, Badge } from "@chakra-ui/react";
import { UnorderedList, ListItem } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Select, Input } from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";

import { HandleField, WithHandleFieldValues } from "components/handle-field";
import { TextareaAutosize } from "components/textarea";

import { FormFieldInput, FormFieldInputConfigInput } from "apollo/schema";

export interface FormFieldValues extends WithHandleFieldValues {
  name: string;
  description: string;
  respondent: { label: string; helper: string };
  fields: FormFieldValue[];
}

export type FormFieldValue = {
  question: string;
  input: FormFieldInputConfigValue;
};

export type FormFieldInputConfigValue = {
  type: "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  singleChoice: {
    options: string;
  };
  multipleChoice: {
    options: string;
  };
};

export const parseFormFieldValues = (values: FormFieldValues) => {
  const { handle, name, description, fields, respondent } = values;
  return {
    handle,
    name,
    description: description || null,
    fields: fields.map(parseFormFieldValue),
    respondentLabel: respondent?.label || null,
    respondentHelper: respondent?.helper || null,
  };
};

const parseFormFieldValue = (value: FormFieldValue): FormFieldInput => {
  const { question, input } = value;
  return {
    question,
    input: parseFormFieldInputConfigValue(input),
  };
};

const parseInputOptionsValue = (optionsValue: string): string[] => {
  const options = optionsValue
    .split(";")
    .map(x => x.trim())
    .filter(x => !!x);
  return uniq(options);
};

const parseFormFieldInputConfigValue = (
  config: FormFieldInputConfigValue,
): FormFieldInputConfigInput => {
  const { type, singleChoice, multipleChoice } = config;

  switch (type) {
    case "TEXT":
      return { text: true };
    case "SINGLE_CHOICE":
      return {
        singleChoice: {
          options: parseInputOptionsValue(singleChoice.options),
        },
      };
    case "MULTIPLE_CHOICE":
      return {
        multipleChoice: {
          options: parseInputOptionsValue(multipleChoice.options),
        },
      };
  }
};

export interface FormFieldsProps extends BoxProps {
  readonly formMethods: UseFormReturn<FormFieldValues>;
  readonly mode: "create" | "update";
  readonly isDisabled?: boolean;
}

export const FormFields: FC<FormFieldsProps> = ({
  formMethods,
  mode,
  isDisabled,
  ...otherProps
}) => {
  const {
    register,
    formState: { errors },
  } = formMethods;
  return (
    <VStack {...otherProps}>
      <FormControl isRequired isInvalid={!!errors.name} isDisabled={isDisabled}>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          placeholder="My Form"
          {...register("name", { required: true })}
        />
        {!!errors.name?.message && (
          <FormErrorMessage>{errors.name.message}</FormErrorMessage>
        )}
      </FormControl>
      <HandleField
        formMethods={formMethods}
        placeholder="my-form"
        isDisabled={isDisabled}
      />
      <FormControl isInvalid={!!errors.description} isDisabled={isDisabled}>
        <FormLabel>Description</FormLabel>
        <TextareaAutosize
          placeholder="This is a cool-ass form."
          minRows={2}
          maxRows={4}
          {...register("description")}
        />
        {!!errors.description?.message && (
          <FormErrorMessage>{errors.description.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormFieldsFields {...{ formMethods, mode, isDisabled }} />
      <FormControl isInvalid={!!errors.respondent}>
        <FormLabel>Respondent</FormLabel>
        <VStack align="stretch" p={3} borderWidth={1} borderRadius="md">
          <FormControl
            isInvalid={!!get(errors, `respondent.label`)}
            isDisabled={isDisabled}
          >
            <FormLabel fontSize="sm">Label</FormLabel>
            <Input
              type="text"
              placeholder="Your Name"
              size="sm"
              {...register(`respondent.label`)}
            />
            {!!errors.respondent?.label?.message && (
              <FormErrorMessage>
                {errors.respondent.label.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl
            isInvalid={!!get(errors, `respondent.helper`)}
            isDisabled={isDisabled}
          >
            <FormLabel fontSize="sm">Helper Text</FormLabel>
            <Input
              type="text"
              placeholder="Your username on Discord."
              size="sm"
              {...register(`respondent.helper`)}
            />
            {!!errors.respondent?.helper?.message && (
              <FormErrorMessage>
                {errors.respondent.helper.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </VStack>
      </FormControl>
    </VStack>
  );
};

interface FormFieldsFieldsProps extends BoxProps {
  readonly formMethods: UseFormReturn<FormFieldValues>;
  readonly mode: "create" | "update";
  readonly isDisabled?: boolean;
}

const FormFieldsFields: FC<FormFieldsFieldsProps> = ({
  formMethods,
  mode,
  isDisabled,
}) => {
  const {
    control,
    formState: { errors },
  } = formMethods;

  const { fields, append } = useFieldArray({
    control,
    name: "fields",
  });
  useEffect(
    () => {
      if (isEmpty(fields)) {
        append({}, { shouldFocus: false });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <FormControl isInvalid={!!errors.fields}>
      <FormLabel>Fields</FormLabel>
      <VStack align="stretch">
        {fields.map(({ id, ...value }, index) => (
          <FormFieldsFieldCard
            key={id}
            {...{ formMethods, mode, value, index, isDisabled }}
          />
        ))}
        <Button
          size="sm"
          leftIcon={<Icon as={HiPlusCircle} fontSize="md" />}
          isFullWidth
          isDisabled={isDisabled || mode === "update"}
          onClick={() => {
            append({});
          }}
        >
          Add Field
        </Button>
      </VStack>
    </FormControl>
  );
};

interface FormFieldsFieldCardProps extends BoxProps {
  readonly formMethods: UseFormReturn<FormFieldValues>;
  readonly mode: "create" | "update";
  readonly value: FormFieldValue;
  readonly index: number;
  readonly isDisabled?: boolean;
}

const FormFieldsFieldCard: FC<FormFieldsFieldCardProps> = ({
  formMethods,
  mode,
  value,
  index,
  isDisabled,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = formMethods;

  const { question, input } = value;
  const inputType = useWatch({ control, name: `fields.${index}.input.type` });

  const inputSingleChoiceOptionsValue = useWatch({
    control,
    name: `fields.${index}.input.singleChoice.options`,
  });
  const inputSingleChoiceOptions = useMemo(() => {
    if (inputSingleChoiceOptionsValue) {
      return parseInputOptionsValue(inputSingleChoiceOptionsValue);
    }
    return [];
  }, [inputSingleChoiceOptionsValue]);

  const inputMultipleChoiceOptionsValue = useWatch({
    control,
    name: `fields.${index}.input.multipleChoice.options`,
  });
  const inputMultipleChoiceOptions = useMemo(() => {
    if (inputMultipleChoiceOptionsValue) {
      return parseInputOptionsValue(inputMultipleChoiceOptionsValue);
    }
    return [];
  }, [inputMultipleChoiceOptionsValue]);

  return (
    <VStack align="stretch" p={3} borderWidth={1} borderRadius="md">
      <Badge alignSelf="end">Field {index + 1}</Badge>
      <FormControl
        isRequired
        isInvalid={!!get(errors, `fields.${index}.question`)}
        isDisabled={isDisabled || mode === "update"}
      >
        <FormLabel fontSize="sm">Question</FormLabel>
        <Input
          type="text"
          defaultValue={question}
          placeholder="Ya like jazz?"
          size="sm"
          {...register(`fields.${index}.question`, { required: true })}
        />
        {!!get(errors, `fields.${index}.question.message`) && (
          <FormErrorMessage>
            {get(errors, `fields.${index}.question.message`)}
          </FormErrorMessage>
        )}
      </FormControl>
      <FormControl
        isRequired
        isInvalid={!!get(errors, `fields.${index}.input.type`)}
        isDisabled={isDisabled || mode === "update"}
      >
        <FormLabel fontSize="sm">Input</FormLabel>
        <Select
          defaultValue={input?.type}
          placeholder="Select input type"
          size="sm"
          {...register(`fields.${index}.input.type`, { required: true })}
        >
          <option value="TEXT">Text</option>
          <option value="SINGLE_CHOICE">Single Choice</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
        </Select>
        {!!get(errors, `fields.${index}.input.type.message`) && (
          <FormErrorMessage>
            {get(errors, `fields.${index}.input.type.message`)}
          </FormErrorMessage>
        )}
      </FormControl>
      {inputType === "SINGLE_CHOICE" && (
        <FormControl
          isRequired
          isInvalid={
            !!get(errors, `fields.${index}.input.singleChoice.options`)
          }
          isDisabled={isDisabled || mode === "update"}
        >
          <FormLabel fontSize="sm">Options</FormLabel>
          <Input
            type="text"
            defaultValue={question}
            placeholder="Peeling potato; Cooking potato; Eating potato"
            size="sm"
            {...register(`fields.${index}.input.singleChoice.options`, {
              required: true,
            })}
          />
          {!!get(
            errors,
            `fields.${index}.input.singleChoice.options.message`,
          ) && (
            <FormErrorMessage>
              {get(
                errors,
                `fields.${index}.input.singleChoice.options.message`,
              )}
            </FormErrorMessage>
          )}
          <FormHelperText>
            Enter a semicolon-delimited set of options.
          </FormHelperText>
          {!isEmpty(inputSingleChoiceOptions) && (
            <Box
              p={2}
              pl={3}
              mt={2}
              rounded="md"
              _light={{ color: "gray.600", bg: "gray.100" }}
              _dark={{ color: "gray.400", bg: "gray.800" }}
            >
              <UnorderedList>
                {inputSingleChoiceOptions.map(option => (
                  <ListItem key={option} fontSize="sm">
                    {option}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          )}
        </FormControl>
      )}
      {inputType === "MULTIPLE_CHOICE" && (
        <FormControl
          isRequired
          isInvalid={
            !!get(errors, `fields.${index}.input.multipleChoice.options`)
          }
          isDisabled={isDisabled || mode === "update"}
        >
          <FormLabel fontSize="sm">Options</FormLabel>
          <Input
            type="text"
            defaultValue={question}
            placeholder="Peeling potato; Cooking potato; Eating potato"
            size="sm"
            {...register(`fields.${index}.input.multipleChoice.options`, {
              required: true,
            })}
          />
          {!!get(
            errors,
            `fields.${index}.input.multipleChoice.options.message`,
          ) && (
            <FormErrorMessage>
              {get(
                errors,
                `fields.${index}.input.multipleChoice.options.message`,
              )}
            </FormErrorMessage>
          )}
          <FormHelperText>
            Enter a semicolon-delimited set of options.
          </FormHelperText>
          {!isEmpty(inputMultipleChoiceOptions) && (
            <Box p={2} pl={3} mt={2} bg="gray.100" rounded="md">
              <UnorderedList>
                {inputMultipleChoiceOptions.map(option => (
                  <ListItem key={option} color="gray.600" fontSize="sm">
                    {option}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          )}
        </FormControl>
      )}
    </VStack>
  );
};
