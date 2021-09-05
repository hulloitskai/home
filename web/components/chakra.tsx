import React, { FC, useMemo } from "react";
import { NextPageContext } from "next";

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
import { ThemeConfig, useTheme, extendTheme } from "@chakra-ui/react";
import { cookieStorageManager } from "@chakra-ui/react";

import { StyleFunctionProps } from "@chakra-ui/theme-tools";
import { transparentize, mode } from "@chakra-ui/theme-tools";

const config: ThemeConfig = {
  useSystemColorMode: true,
};

export const ChakraTheme = extendTheme({
  config,
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
    global: (props: StyleFunctionProps) => ({
      html: {
        WebkitFontSmoothing: "auto",
      },
      body: {
        lineHeight: "normal",
        bg: mode("white", "black")(props),
      },
    }),
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

export interface ChakraProviderProps {
  cookies?: string;
}

export const ChakraProvider: FC<ChakraProviderProps> = ({
  cookies,
  children,
}) => {
  const colorModeManager = useMemo(() => {
    return cookieStorageManager(cookies);
  }, [cookies]);
  return (
    <Provider theme={ChakraTheme} colorModeManager={colorModeManager}>
      {children}
    </Provider>
  );
};

export const getPageCookies = ({
  req,
}: NextPageContext): string | undefined => {
  const { cookie } = req?.headers ?? {};
  return cookie
    ? Array.isArray(cookie)
      ? cookie.join("; ")
      : cookie
    : undefined;
};

export const useTransparentize = (color: string, opacity: number): string => {
  const theme = useTheme();
  return transparentize(color, opacity)(theme);
};
