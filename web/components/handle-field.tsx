import React, { useEffect } from "react";
import slugify from "slugify";

import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { BoxProps } from "@chakra-ui/react";
import { InputProps, Input } from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";

interface HandleFieldValues {
  name: string;
  handle: string;
}

export interface HandleFieldProps<TFieldValues extends HandleFieldValues>
  extends BoxProps,
    Pick<InputProps, "defaultValue" | "placeholder"> {
  readonly formMethods: UseFormReturn<TFieldValues>;
}

const HANDLE_REGEX = /^([a-z0-9]+-*)*[a-z0-9]$/;

export const HandleField = <TFieldValues extends HandleFieldValues>({
  formMethods,
  defaultValue,
  placeholder,
  ...otherProps
}: HandleFieldProps<TFieldValues>) => {
  // TODO: Hack because of the limitations of react-hook-form@v7:
  // https://github.com/react-hook-form/react-hook-form/issues/4373
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = formMethods as unknown as UseFormReturn<HandleFieldValues>;

  const name = useWatch({
    control,
    name: "name",
  });
  useEffect(() => {
    if (name !== undefined) {
      const handle = slugify(name, { lower: true, strict: true });
      const handleTrimmed = handle.substr(0, 32);
      setValue("handle", handleTrimmed, {
        shouldTouch: true,
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [name]);

  return (
    <FormControl isRequired isInvalid={!!errors.handle} {...otherProps}>
      <FormLabel>Handle</FormLabel>
      <Input
        type="text"
        pattern={HANDLE_REGEX.source}
        {...{ defaultValue, placeholder }}
        {...register("handle", {
          required: true,
          pattern: {
            value: HANDLE_REGEX,
            message: "Invalid format.",
          },
          minLength: {
            value: 2,
            message: "Too short.",
          },
          maxLength: {
            value: 32,
            message: "Too long.",
          },
        })}
      />
      {!!errors.handle?.message && (
        <FormErrorMessage>{errors.handle.message}</FormErrorMessage>
      )}
      <FormHelperText>
        Can only contain lowercase letters, numbers, and dashes.
      </FormHelperText>
    </FormControl>
  );
};
