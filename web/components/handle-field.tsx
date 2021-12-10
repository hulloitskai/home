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

export interface WithHandleFieldValues {
  name: string;
  handle: string;
}

export interface HandleFieldProps<TFieldValues extends WithHandleFieldValues>
  extends BoxProps,
    Pick<
      InputProps,
      "defaultValue" | "placeholder" | "isReadOnly" | "isDisabled"
    > {
  readonly formMethods: UseFormReturn<TFieldValues>;
}

const handleRegex = /^([a-z0-9]+-*)*[a-z0-9]$/;
const handleIsRequired = true;
const handleMinLength = 2;
const handleMaxLength = 32;

export const HandleField = <TFieldValues extends WithHandleFieldValues>({
  formMethods,
  defaultValue,
  placeholder,
  ...otherProps
}: HandleFieldProps<TFieldValues>) => {
  // HACK: Type cast due to the limitations of react-hook-form@v7:
  // https://github.com/react-hook-form/react-hook-form/issues/4373
  const {
    register,
    control,
    setValue,
    formState: { errors, isDirty },
  } = formMethods as unknown as UseFormReturn<WithHandleFieldValues>;

  const name = useWatch({
    control,
    name: "name",
  });
  useEffect(() => {
    if (name !== undefined && isDirty) {
      const handle = slugify(name, { lower: true, strict: true });
      const handleTrimmed = handle.substr(0, 32);
      setValue("handle", handleTrimmed, {
        shouldTouch: true,
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [name, isDirty, setValue]);

  return (
    <FormControl
      isRequired={handleIsRequired}
      isInvalid={!!errors.handle}
      {...otherProps}
    >
      <FormLabel>Handle</FormLabel>
      <Input
        type="text"
        isRequired={handleIsRequired}
        minLength={handleMinLength}
        maxLength={handleMaxLength}
        pattern={handleRegex.source}
        {...{ defaultValue, placeholder }}
        {...register("handle", {
          required: handleIsRequired,
          pattern: {
            value: handleRegex,
            message: "Invalid format.",
          },
          minLength: {
            value: handleMinLength,
            message: "Too short.",
          },
          maxLength: {
            value: handleMaxLength,
            message: "Too long.",
          },
        })}
      />
      {!!errors.handle?.message && (
        <FormErrorMessage>{errors.handle.message}</FormErrorMessage>
      )}
      <FormHelperText>
        Can only contain lowercase letters, numbers, and dashes;{" "}
        {handleMinLength}-{handleMaxLength} characters.
      </FormHelperText>
    </FormControl>
  );
};
