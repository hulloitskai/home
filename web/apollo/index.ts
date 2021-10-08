import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * Implement the DateTime<FixedOffset> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: any;
};

export type BuildInfo = {
  __typename?: 'BuildInfo';
  timestamp: Scalars['DateTime'];
  version?: Maybe<Scalars['String']>;
};

export type HeartRate = {
  __typename?: 'HeartRate';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  measurement: Scalars['Int'];
  timestamp: Scalars['DateTime'];
};

export type KnowledgeEntry = {
  __typename?: 'KnowledgeEntry';
  id: Scalars['String'];
  names: Array<Scalars['String']>;
  links: KnowledgeEntryLinks;
  tags: Array<Scalars['String']>;
};

export type KnowledgeEntryLinks = {
  __typename?: 'KnowledgeEntryLinks';
  outgoing: Array<KnowledgeEntry>;
  incoming: Array<KnowledgeEntry>;
};

export type LyricLine = {
  __typename?: 'LyricLine';
  text: Scalars['String'];
  position: Scalars['Int'];
};

export type Lyrics = {
  __typename?: 'Lyrics';
  lines: Array<LyricLine>;
};

export type MusicAlbum = {
  __typename?: 'MusicAlbum';
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['String'];
  name: Scalars['String'];
  imageUrl: Scalars['String'];
};

export type MusicArtist = {
  __typename?: 'MusicArtist';
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['String'];
  name: Scalars['String'];
};

export type MusicInfo = {
  __typename?: 'MusicInfo';
  isPlaying: Scalars['Boolean'];
  track: MusicTrack;
  progress: Scalars['Int'];
};

export type MusicTrack = {
  __typename?: 'MusicTrack';
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['String'];
  name: Scalars['String'];
  duration: Scalars['Int'];
  album: MusicAlbum;
  artists: Array<MusicArtist>;
  lyrics?: Maybe<Lyrics>;
};

export type Query = {
  __typename?: 'Query';
  buildInfo: BuildInfo;
  knowledgeEntries: Array<KnowledgeEntry>;
  knowledgeEntry?: Maybe<KnowledgeEntry>;
  heartRate?: Maybe<HeartRate>;
  musicInfo?: Maybe<MusicInfo>;
};


export type QueryKnowledgeEntryArgs = {
  id: Scalars['String'];
};

export type HeartStatHeartRateFragment = { __typename?: 'HeartRate', id: string, measurement: number, timestamp: any };

export type HeartSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type HeartSectionQuery = { __typename?: 'Query', heartRate?: Maybe<{ __typename?: 'HeartRate', id: string, measurement: number, timestamp: any }> };

export type KnowledgeGraphEntryFragment = { __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } };

export type MusicLyricsQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicLyricsQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', track: { __typename?: 'MusicTrack', spotifyId: string, lyrics?: Maybe<{ __typename?: 'Lyrics', lines: Array<{ __typename?: 'LyricLine', text: string, position: number }> }> } }> };

export type MusicSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string, spotifyUrl: string, name: string, duration: number, album: { __typename?: 'MusicAlbum', spotifyId: string, spotifyUrl: string, name: string }, artists: Array<{ __typename?: 'MusicArtist', spotifyId: string, spotifyUrl: string, name: string }> } }> };

export type MusicSectionHeartbeatQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionHeartbeatQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string } }> };

export type HomePageQueryVariables = Exact<{
  dailyNoteId: Scalars['String'];
}>;


export type HomePageQuery = { __typename?: 'Query', dailyEntry?: Maybe<{ __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }> } }> };

export type KnowledgePageQueryVariables = Exact<{ [key: string]: never; }>;


export type KnowledgePageQuery = { __typename?: 'Query', entries: Array<{ __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }> };

export const HeartStatHeartRateFragmentDoc = gql`
    fragment HeartStatHeartRate on HeartRate {
  id
  measurement
  timestamp
}
    `;
export const KnowledgeGraphEntryFragmentDoc = gql`
    fragment KnowledgeGraphEntry on KnowledgeEntry {
  id
  tags
  links {
    incoming {
      id
    }
    outgoing {
      id
    }
  }
}
    `;
export const HeartSectionDocument = gql`
    query HeartSection {
  heartRate {
    id
    ...HeartStatHeartRate
  }
}
    ${HeartStatHeartRateFragmentDoc}`;

/**
 * __useHeartSectionQuery__
 *
 * To run a query within a React component, call `useHeartSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeartSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeartSectionQuery({
 *   variables: {
 *   },
 * });
 */
export function useHeartSectionQuery(baseOptions?: Apollo.QueryHookOptions<HeartSectionQuery, HeartSectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HeartSectionQuery, HeartSectionQueryVariables>(HeartSectionDocument, options);
      }
export function useHeartSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HeartSectionQuery, HeartSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HeartSectionQuery, HeartSectionQueryVariables>(HeartSectionDocument, options);
        }
export type HeartSectionQueryHookResult = ReturnType<typeof useHeartSectionQuery>;
export type HeartSectionLazyQueryHookResult = ReturnType<typeof useHeartSectionLazyQuery>;
export type HeartSectionQueryResult = Apollo.QueryResult<HeartSectionQuery, HeartSectionQueryVariables>;
export const MusicLyricsDocument = gql`
    query MusicLyrics {
  musicInfo {
    track {
      spotifyId
      lyrics {
        lines {
          text
          position
        }
      }
    }
  }
}
    `;

/**
 * __useMusicLyricsQuery__
 *
 * To run a query within a React component, call `useMusicLyricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMusicLyricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMusicLyricsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMusicLyricsQuery(baseOptions?: Apollo.QueryHookOptions<MusicLyricsQuery, MusicLyricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MusicLyricsQuery, MusicLyricsQueryVariables>(MusicLyricsDocument, options);
      }
export function useMusicLyricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MusicLyricsQuery, MusicLyricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MusicLyricsQuery, MusicLyricsQueryVariables>(MusicLyricsDocument, options);
        }
export type MusicLyricsQueryHookResult = ReturnType<typeof useMusicLyricsQuery>;
export type MusicLyricsLazyQueryHookResult = ReturnType<typeof useMusicLyricsLazyQuery>;
export type MusicLyricsQueryResult = Apollo.QueryResult<MusicLyricsQuery, MusicLyricsQueryVariables>;
export const MusicSectionDocument = gql`
    query MusicSection {
  musicInfo {
    isPlaying
    track {
      spotifyId
      spotifyUrl
      name
      album {
        spotifyId
        spotifyUrl
        name
      }
      artists {
        spotifyId
        spotifyUrl
        name
      }
      duration
    }
    progress
  }
}
    `;

/**
 * __useMusicSectionQuery__
 *
 * To run a query within a React component, call `useMusicSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useMusicSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMusicSectionQuery({
 *   variables: {
 *   },
 * });
 */
export function useMusicSectionQuery(baseOptions?: Apollo.QueryHookOptions<MusicSectionQuery, MusicSectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MusicSectionQuery, MusicSectionQueryVariables>(MusicSectionDocument, options);
      }
export function useMusicSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MusicSectionQuery, MusicSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MusicSectionQuery, MusicSectionQueryVariables>(MusicSectionDocument, options);
        }
export type MusicSectionQueryHookResult = ReturnType<typeof useMusicSectionQuery>;
export type MusicSectionLazyQueryHookResult = ReturnType<typeof useMusicSectionLazyQuery>;
export type MusicSectionQueryResult = Apollo.QueryResult<MusicSectionQuery, MusicSectionQueryVariables>;
export const MusicSectionHeartbeatDocument = gql`
    query MusicSectionHeartbeat {
  musicInfo {
    isPlaying
    track {
      spotifyId
    }
    progress
  }
}
    `;

/**
 * __useMusicSectionHeartbeatQuery__
 *
 * To run a query within a React component, call `useMusicSectionHeartbeatQuery` and pass it any options that fit your needs.
 * When your component renders, `useMusicSectionHeartbeatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMusicSectionHeartbeatQuery({
 *   variables: {
 *   },
 * });
 */
export function useMusicSectionHeartbeatQuery(baseOptions?: Apollo.QueryHookOptions<MusicSectionHeartbeatQuery, MusicSectionHeartbeatQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MusicSectionHeartbeatQuery, MusicSectionHeartbeatQueryVariables>(MusicSectionHeartbeatDocument, options);
      }
export function useMusicSectionHeartbeatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MusicSectionHeartbeatQuery, MusicSectionHeartbeatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MusicSectionHeartbeatQuery, MusicSectionHeartbeatQueryVariables>(MusicSectionHeartbeatDocument, options);
        }
export type MusicSectionHeartbeatQueryHookResult = ReturnType<typeof useMusicSectionHeartbeatQuery>;
export type MusicSectionHeartbeatLazyQueryHookResult = ReturnType<typeof useMusicSectionHeartbeatLazyQuery>;
export type MusicSectionHeartbeatQueryResult = Apollo.QueryResult<MusicSectionHeartbeatQuery, MusicSectionHeartbeatQueryVariables>;
export const HomePageDocument = gql`
    query HomePage($dailyNoteId: String!) {
  dailyEntry: knowledgeEntry(id: $dailyNoteId) {
    id
    links {
      incoming {
        id
        ...KnowledgeGraphEntry
      }
      outgoing {
        id
        ...KnowledgeGraphEntry
      }
    }
    ...KnowledgeGraphEntry
  }
}
    ${KnowledgeGraphEntryFragmentDoc}`;

/**
 * __useHomePageQuery__
 *
 * To run a query within a React component, call `useHomePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomePageQuery({
 *   variables: {
 *      dailyNoteId: // value for 'dailyNoteId'
 *   },
 * });
 */
export function useHomePageQuery(baseOptions: Apollo.QueryHookOptions<HomePageQuery, HomePageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HomePageQuery, HomePageQueryVariables>(HomePageDocument, options);
      }
export function useHomePageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HomePageQuery, HomePageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HomePageQuery, HomePageQueryVariables>(HomePageDocument, options);
        }
export type HomePageQueryHookResult = ReturnType<typeof useHomePageQuery>;
export type HomePageLazyQueryHookResult = ReturnType<typeof useHomePageLazyQuery>;
export type HomePageQueryResult = Apollo.QueryResult<HomePageQuery, HomePageQueryVariables>;
export const KnowledgePageDocument = gql`
    query KnowledgePage {
  entries: knowledgeEntries {
    id
    ...KnowledgeGraphEntry
  }
}
    ${KnowledgeGraphEntryFragmentDoc}`;

/**
 * __useKnowledgePageQuery__
 *
 * To run a query within a React component, call `useKnowledgePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useKnowledgePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useKnowledgePageQuery({
 *   variables: {
 *   },
 * });
 */
export function useKnowledgePageQuery(baseOptions?: Apollo.QueryHookOptions<KnowledgePageQuery, KnowledgePageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<KnowledgePageQuery, KnowledgePageQueryVariables>(KnowledgePageDocument, options);
      }
export function useKnowledgePageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<KnowledgePageQuery, KnowledgePageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<KnowledgePageQuery, KnowledgePageQueryVariables>(KnowledgePageDocument, options);
        }
export type KnowledgePageQueryHookResult = ReturnType<typeof useKnowledgePageQuery>;
export type KnowledgePageLazyQueryHookResult = ReturnType<typeof useKnowledgePageLazyQuery>;
export type KnowledgePageQueryResult = Apollo.QueryResult<KnowledgePageQuery, KnowledgePageQueryVariables>;