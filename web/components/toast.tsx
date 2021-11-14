import { useToast as _useToast } from "@chakra-ui/react";
import { UseToastOptions as _UseToastOptions } from "@chakra-ui/react";

const getNodeText = (node: any): string => {
  if (["string", "number"].includes(typeof node)) {
    return node;
  }
  if (node instanceof Array) {
    return node.map(getNodeText).join("");
  }
  if (typeof node === "object" && node) {
    return getNodeText(node.props.children);
  }
  return "";
};

export type UseToastOptions = _UseToastOptions;

export const useToast = (
  options?: UseToastOptions,
): ReturnType<typeof _useToast> => {
  const toast = _useToast({
    position: "bottom",
    duration: 2400,
    isClosable: true,
    ...options,
  });
  const { close, closeAll, update, isActive } = toast;

  function patchedToast(options?: UseToastOptions) {
    const { status, title, description } = options ?? {};
    if (status === "error") {
      let message: string | undefined;
      if (title && description) {
        message = `${getNodeText(title)} (${getNodeText(description)})`;
      } else if (title) {
        message = getNodeText(title);
      } else if (description) {
        message = getNodeText(description);
      }
      if (message) {
        console.error(`[Toast] ${message}`);
      }
    }
    return toast(options);
  }
  patchedToast.update = update;
  patchedToast.close = close;
  patchedToast.closeAll = closeAll;
  patchedToast.isActive = isActive;

  return patchedToast;
};
