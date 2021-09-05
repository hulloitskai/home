import React, { FC } from "react";
import Head from "next/head";
import type { AppProps as NextAppProps } from "next/app";

import { ChakraProvider } from "components";

import "../styles.css";

const App: FC<NextAppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>It&apos;s Kai</title>
      </Head>
      <ChakraProvider cookies={pageProps.cookies}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default App;
