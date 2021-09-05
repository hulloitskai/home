import { useToast as _useToast } from "@chakra-ui/react";
import { UseToastOptions as _UseToastOptions } from "@chakra-ui/react";

export type UseToastOptions = _UseToastOptions;
export const useToast = (
  options?: UseToastOptions,
): ReturnType<typeof _useToast> => {
  return _useToast({
    position: "bottom",
    duration: 2400,
    isClosable: true,
    ...options,
  });
};
