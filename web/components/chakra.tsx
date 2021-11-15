import React, { FC, useMemo } from "react";

import {
  gray,
  rose,
  amber,
  orange,
  green,
  teal,
  cyan,
  purple,
  pink,
  blue,
} from "tailwindcss/colors";

import { ChakraProvider as Provider } from "@chakra-ui/react";
import { ThemeConfig, useTheme, extendTheme } from "@chakra-ui/react";
import { StorageManager, ColorMode } from "@chakra-ui/react";

import { StyleFunctionProps } from "@chakra-ui/theme-tools";
import { transparentize, mode } from "@chakra-ui/theme-tools";

const config: ThemeConfig = {
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    gray,
    red: rose,
    orange,
    yellow: amber,
    green,
    teal,
    blue,
    cyan,
    purple,
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
        bg: mode("white", "gray.900")(props),
      },
    }),
  },
  components: {
    Button: {
      variants: {
        solid: (props: Record<string, any>) => {
          const { colorScheme } = props;
          if (colorScheme === "black") {
            const bg = mode("black", "white")(props);
            return {
              bg,
              _hover: {
                bg: mode("gray.700", "gray.100")(props),
                _disabled: { bg },
              },
              _active: {
                bg: mode("gray.600", "gray.200")(props),
              },
            };
          }
        },
      },
    },
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
  },
});

export interface ChakraProviderProps {
  cookies?: string;
}

export const ChakraProvider: FC<ChakraProviderProps> = ({
  cookies,
  children,
}) => {
  const manager = useMemo(() => colorModeManager(cookies), [cookies]);
  return (
    <Provider theme={theme} colorModeManager={manager}>
      {children}
    </Provider>
  );
};

export const useTransparentize = (color: string, opacity: number): string => {
  const theme = useTheme();
  return transparentize(color, opacity)(theme);
};

const colorModeCookieName = "chakra_color_mode";

const colorModeManager = (cookies = ""): StorageManager => ({
  get(init) {
    const match = cookies.match(
      new RegExp(`(^| )${colorModeCookieName}=([^;]+)`),
    );
    if (match) {
      return match[2] as ColorMode;
    }
    return init;
  },
  set(value) {
    document.cookie = `${colorModeCookieName}=${value}; max-age=31536000; path=/`;
  },
  type: "cookie",
});
