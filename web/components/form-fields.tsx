import React, { FC, useEffect, useMemo } from "react";
import { isEmpty, uniq } from "lodash";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { useWatch, get } from "react-hook-form";

import { HiPlusCircle } from "react-icons/hi";

import { BoxProps, Box, VStack } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { UnorderedList, ListItem } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Select, Input } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";

import { HandleField } from "components/handle-field";

import {
  CreateFormInput,
  FormFieldInput,
  FormFieldInputConfigInput,
} from "apollo";

export type FormFieldValues = {
  handle: string;
  name: string;
  description: string;
  respondent: { label: string; helper: string };
  fields: FormFieldValue[];
};

type FormFieldValue = {
  question: string;
  input: FormFieldInputConfigValue;
};

type FormFieldInputConfigValue = {
  type: "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  singleChoice: {
    options: string;
  };
  multipleChoice: {
    options: string;
  };
};

export const parseFormFieldValues = (
  values: FormFieldValues,
): CreateFormInput => {
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
}

export const FormFields: FC<FormFieldsProps> = ({
  formMethods,
  ...otherProps
}) => {
  const {
    register,
    formState: { errors },
  } = formMethods;
  return (
    <VStack {...otherProps}>
      <FormControl isRequired isInvalid={!!errors.name}>
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
      <HandleField formMethods={formMethods} placeholder="my-form" />
      <FormControl isInvalid={!!errors.description}>
        <FormLabel>Description</FormLabel>
        <Input
          type="text"
          placeholder="This is a cool-ass form."
          {...register("description")}
        />
        {!!errors.description?.message && (
          <FormErrorMessage>{errors.description.message}</FormErrorMessage>
        )}
      </FormControl>

      <FormFieldsFields formMethods={formMethods} />
      <FormControl isInvalid={!!errors.respondent}>
        <FormLabel>Respondent</FormLabel>
        <VStack align="stretch" p={3} borderWidth={1} borderRadius="md">
          <FormControl isInvalid={!!get(errors, `respondent.label`)}>
            <FormLabel fontSize="sm">Label</FormLabel>
            <Input
              type="text"
              placeholder="Name"
              size="sm"
              {...register(`respondent.label`)}
            />
            {!!errors.respondent?.label?.message && (
              <FormErrorMessage>
                {errors.respondent.label.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!get(errors, `respondent.helper`)}>
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
}

const FormFieldsFields: FC<FormFieldsFieldsProps> = ({ formMethods }) => {
  const {
    control,
    formState: { errors },
  } = formMethods;

  const { fields, append } = useFieldArray({
    control,
    name: "fields",
  });
  useEffect(() => {
    if (isEmpty(fields)) {
      append({}, { shouldFocus: false });
    }
  }, []);

  return (
    <FormControl isInvalid={!!errors.fields}>
      <FormLabel>Fields</FormLabel>
      <VStack align="stretch">
        {fields.map(({ id, ...value }, index) => (
          <FormFieldsFieldCard
            key={id}
            formMethods={formMethods}
            value={value}
            index={index}
          />
        ))}
        <Button
          size="sm"
          isFullWidth
          leftIcon={<Icon as={HiPlusCircle} fontSize="md" />}
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
  readonly value: FormFieldValue;
  readonly index: number;
}

const FormFieldsFieldCard: FC<FormFieldsFieldCardProps> = ({
  formMethods,
  value,
  index,
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
            <Box p={2} pl={3} mt={2} bg="gray.100" rounded="md">
              <UnorderedList>
                {inputSingleChoiceOptions.map(option => (
                  <ListItem key={option} color="gray.600" fontSize="sm">
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
