export {};
// import { useEffect } from "react";
// import { first, isEmpty } from "lodash";

// import { CombinedError } from "urql";
// import { withUrqlClient, WithUrqlClientOptions } from "next-urql";
// import { initUrqlClient } from "next-urql";

// import type { Client, ClientOptions, Exchange } from "urql";
// import { dedupExchange, fetchExchange } from "urql";
// // import { authExchange } from "@urql/exchange-auth";
// import { ssrExchange } from "urql";
// import { refocusExchange as focusExchange } from "@urql/exchange-refocus";
// import { persistedFetchExchange } from "@urql/exchange-persisted-fetch";

// import { cacheExchange } from "@urql/exchange-graphcache";
// // import { simplePagination } from "@urql/exchange-graphcache/extras";

// import { useToast } from "components";

// import schema from "graphql-schema";
// import { MusicTrack, MusicAlbum, MusicArtist } from "graphql-types";

// import { HOME_API_URL } from "consts";

// // type AuthState = {
// //   token: string;
// // };

// // type AuthConfig = Parameters<typeof authExchange>[0];

// // const authConfig: AuthConfig = {
// //   addAuthToOperation: ({ operation, authState }) => {
// //     const { token } = (authState as AuthState | undefined) ?? {};
// //     if (!token) {
// //       return operation;
// //     }
// //     const fetchOptions =
// //       typeof operation.context.fetchOptions === "function"
// //         ? operation.context.fetchOptions()
// //         : operation.context.fetchOptions || {};
// //     return {
// //       ...operation,
// //       context: {
// //         ...operation.context,
// //         fetchOptions: {
// //           ...fetchOptions,
// //           headers: {
// //             ...fetchOptions.headers,
// //             Authorization: `Bearer ${token}`,
// //           },
// //         },
// //       },
// //     };
// //   },
// //   getAuth: async () => {
// //     if (!(await AuthClient.isAuthenticated())) {
// //       return null;
// //     }
// //     const { protocol, host } = window.location;
// //     const token = await AuthClient.getTokenSilently({
// //       redirect_uri: `${protocol}//${host}/login/verify`,
// //     });
// //     return token ? { token } : null;
// //   },
// //   didAuthError: ({ error }) => {
// //     for (const { message } of error.graphQLErrors) {
// //       if (
// //         [
// //           "not authorized",
// //           "failed to decode authentication token: ExpiredSignature",
// //         ].includes(message)
// //       ) {
// //         return true;
// //       }
// //     }
// //     return false;
// //   },
// //   willAuthError: () => true,
// // };

// // const paginate = (
// //   ...args: Parameters<typeof simplePagination>
// // ): ReturnType<typeof simplePagination> => {
// //   const [params] = args;
// //   return simplePagination({
// //     limitArgument: "take",
// //     offsetArgument: "skip",
// //     ...params,
// //   });
// // };

// const makeClientOptions = (ssrExchange: Exchange): ClientOptions => {
//   const isClient = typeof window !== "undefined";
//   return {
//     url: isClient ? "/api/graphql" : `${HOME_API_URL}/graphql`,
//     suspense: false,
//     exchanges: [
//       dedupExchange,
//       ...(isClient ? [focusExchange()] : []),
//       cacheExchange({
//         // @ts-ignore
//         schema,
//         keys: {
//           KnowledgeEntryLinks: () => null,
//           MusicInfo: () => null,
//           MusicTrack: data => (data as MusicTrack).spotifyId,
//           MusicAlbum: data => (data as MusicAlbum).spotifyId,
//           MusicArtist: data => (data as MusicArtist).spotifyId,
//           Lyrics: () => null,
//           LyricLine: () => null,
//         },
//       }),
//       // ...(isClient ? [authExchange(authConfig)] : []),
//       ssrExchange,
//       persistedFetchExchange(),
//       fetchExchange,
//     ],
//     requestPolicy: "cache-and-network",
//   };
// };

// export type WithClientOptions = WithUrqlClientOptions;

// export const withClient = (
//   options?: WithClientOptions,
// ): ReturnType<typeof withUrqlClient> => {
//   return withUrqlClient(ssrExchange => makeClientOptions(ssrExchange), options);
// };

// type SSRExchange = ReturnType<typeof ssrExchange>;

// type InitClientReturn = {
//   client: Client;
//   cache: SSRExchange;
// };

// export const initClient = (): InitClientReturn => {
//   const cache = ssrExchange({ isClient: false });
//   const client = initUrqlClient(makeClientOptions(cache), true);
//   if (!client) {
//     throw new Error("Client did not initialize.");
//   }
//   return { client, cache };
// };

// export const formatQueryError = (error: CombinedError): string => {
//   if (!isEmpty(error.graphQLErrors)) {
//     const { message } = first(error.graphQLErrors)!;
//     return message;
//   }
//   if (error.networkError) {
//     const { message } = error.networkError;
//     return message;
//   }
//   return error.message;
// };

// export const useQueryExecutionToast = (
//   data: any | undefined,
//   text: string,
// ): void => {
//   const toast = useToast();
//   return useEffect(
//     () => {
//       if (data) {
//         toast({
//           status: "success",
//           description: text,
//         });
//       }
//     },
//     [data], // eslint-disable-line react-hooks/exhaustive-deps
//   );
// };

// const ACTIVE_QUERY_ERROR_TOASTS = new Set<string>();

// export const useQueryErrorToast = (
//   error: CombinedError | undefined,
//   title: string,
// ): void => {
//   const toast = useToast();
//   return useEffect(
//     () => {
//       if (error && !ACTIVE_QUERY_ERROR_TOASTS.has(title)) {
//         ACTIVE_QUERY_ERROR_TOASTS.add(title);
//         toast({
//           status: "error",
//           title,
//           description: formatQueryError(error),
//           onCloseComplete: () => {
//             ACTIVE_QUERY_ERROR_TOASTS.delete(title);
//           },
//         });
//       }
//     },
//     [error], // eslint-disable-line react-hooks/exhaustive-deps
//   );
// };
