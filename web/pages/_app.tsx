import React, { ReactElement } from "react";

import NextApp from "next/app";
import type { AppProps as NextAppProps } from "next/app";
import type { AppInitialProps as NextAppInitialProps } from "next/app";
import type { AppContext as NextAppContext } from "next/app";

import { ApolloProvider as ApolloProviderSSR } from "@apollo/client";
import { ApolloProvider } from "components/apollo";
import { initializeApolloClient } from "components/apollo";

import { ChakraProvider } from "components/chakra";
import { MetaTitle, MetaDescription, MetaType } from "components/meta";

import "../styles.css";

const App = ({ Component, pageProps }: NextAppProps): ReactElement => {
  const { cookieHeader, apolloState, ...otherProps } = pageProps;
  return (
    <>
      <>
        <MetaTitle />
        <MetaDescription description="Are you human? I'm human too! It's nice to meet you :)" />
        <MetaType type="website" />
      </>
      <ChakraProvider cookies={cookieHeader}>
        <ApolloProvider initialState={apolloState}>
          <Component {...otherProps} />
        </ApolloProvider>
      </ChakraProvider>
    </>
  );
};

App.getInitialProps = async (
  appCtx: NextAppContext,
): Promise<NextAppInitialProps> => {
  const { pageProps } = await NextApp.getInitialProps(appCtx);

  // If SSR, supply app with cookies and initial Apollo state.
  const { AppTree, ctx } = appCtx;
  if (ctx.req && !ctx.res?.writableEnded) {
    const { cookie: cookieHeader } = ctx.req.headers;

    const client = initializeApolloClient();
    try {
      const { getDataFromTree } = await import("@apollo/client/react/ssr");
      await getDataFromTree(
        <ApolloProviderSSR client={client}>
          <AppTree pageProps={{ ...pageProps, cookieHeader }} />
        </ApolloProviderSSR>,
      );
    } catch (error) {
      console.error(`[App] Error while pre-fetching queries: ${error}`);
    }
    const apolloState = client.extract();

    return {
      pageProps: {
        ...pageProps,
        cookieHeader,
        apolloState,
      },
    };
  }

  return { pageProps };
};

export default App;
