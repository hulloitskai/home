import React, { FC } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";

import { ChakraProvider } from "components";

import "../styles.css";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Kai</title>
      </Head>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default App;
