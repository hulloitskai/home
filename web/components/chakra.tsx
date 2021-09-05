import React, { FC } from "react";

import {
  gray,
  rose,
  amber,
  emerald,
  teal,
  indigo,
  violet,
  pink,
  blue,
} from "tailwindcss/colors";

import { ChakraProvider as Provider } from "@chakra-ui/react";
import { Theme, useTheme, extendTheme } from "@chakra-ui/react";
import { transparentize } from "@chakra-ui/theme-tools";

// @ts-ignore
export const ChakraTheme: Theme = extendTheme({
  colors: {
    gray,
    red: rose,
    yellow: amber,
    green: emerald,
    teal,
    blue,
    indigo,
    purple: violet,
    pink,
  },
  fonts: {
    body:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, Avenir, " +
      "'Adobe Heiti Std', 'Segoe UI', 'Trebuchet MS', sans-serif",
    heading:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, Avenir, " +
      "'Adobe Heiti Std', 'Segoe UI', 'Trebuchet MS', sans-serif",
  },
  space: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  sizes: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  styles: {
    global: {
      html: {
        WebkitFontSmoothing: "auto",
      },
      body: {
        lineHeight: "normal",
      },
    },
  },
  components: {
    Form: {
      baseStyle: {
        helperText: {
          mt: 1,
          color: "gray.400",
        },
      },
    },
    FormLabel: {
      baseStyle: {
        color: "gray.500",
        mb: 1,
      },
    },
    FormError: {
      baseStyle: {
        text: {
          mt: 1,
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "gray.400",
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: "gray.400",
      },
    },
    Button: {
      defaultProps: {
        variant: "outline",
      },
    },
    IconButton: {
      defaultProps: {
        variant: "outline",
      },
    },
  },
});

export const ChakraProvider: FC = ({ children }) => (
  <Provider theme={ChakraTheme}>{children}</Provider>
);

export const useTransparentize = (color: string, opacity: number): string => {
  const theme = useTheme();
  return transparentize(color, opacity)(theme);
};
