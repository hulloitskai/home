import React, { FC } from "react";
import type { AppProps as NextAppProps } from "next/app";

import { ChakraProvider } from "components/chakra";
import { MetaTitle, MetaDescription, MetaType } from "components/meta";

import "../styles.css";

const App: FC<NextAppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <>
        <MetaTitle />
        <MetaDescription description="Are you human? I'm human too! It's nice to meet you :)" />
        <MetaType type="website" />
      </>
      <ChakraProvider cookies={pageProps.cookies}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default App;
