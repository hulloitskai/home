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
  version: Scalars['String'];
};

export type CreateFormInput = {
  description?: Maybe<Scalars['String']>;
  fields: Array<FormFieldInput>;
  handle: Scalars['String'];
  name: Scalars['String'];
  respondentHelper?: Maybe<Scalars['String']>;
  respondentLabel?: Maybe<Scalars['String']>;
};

export type CreateFormPayload = {
  __typename?: 'CreateFormPayload';
  form: Form;
  ok: Scalars['Boolean'];
};

export type DeleteFormInput = {
  formId: Scalars['ID'];
};

export type DeleteFormPayload = {
  __typename?: 'DeleteFormPayload';
  ok: Scalars['Boolean'];
};

export type Form = {
  __typename?: 'Form';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  fields: Array<FormField>;
  handle: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  respondentHelper?: Maybe<Scalars['String']>;
  respondentLabel?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

export type FormField = {
  __typename?: 'FormField';
  input: FormFieldInputConfig;
  question: Scalars['String'];
};

export type FormFieldInput = {
  input: FormFieldInputConfigInput;
  question: Scalars['String'];
};

export type FormFieldInputConfig = {
  __typename?: 'FormFieldInputConfig';
  multipleChoice?: Maybe<FormFieldMultipleChoiceInputConfig>;
  singleChoice?: Maybe<FormFieldSingleChoiceInputConfig>;
  text?: Maybe<Scalars['Boolean']>;
};

export type FormFieldInputConfigInput = {
  multipleChoice?: Maybe<FormFieldMultipleChoiceInputConfigInput>;
  singleChoice?: Maybe<FormFieldSingleChoiceInputConfigInput>;
  text?: Maybe<Scalars['Boolean']>;
};

export type FormFieldMultipleChoiceInputConfig = {
  __typename?: 'FormFieldMultipleChoiceInputConfig';
  options: Array<Scalars['String']>;
};

export type FormFieldMultipleChoiceInputConfigInput = {
  options: Array<Scalars['String']>;
};

export type FormFieldResponseInput = {
  multipleChoice?: Maybe<Array<Scalars['String']>>;
  singleChoice?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export type FormFieldSingleChoiceInputConfig = {
  __typename?: 'FormFieldSingleChoiceInputConfig';
  options: Array<Scalars['String']>;
};

export type FormFieldSingleChoiceInputConfigInput = {
  options: Array<Scalars['String']>;
};

export type HeartRate = {
  __typename?: 'HeartRate';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  measurement: Scalars['Int'];
  timestamp: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type KnowledgeEntry = {
  __typename?: 'KnowledgeEntry';
  id: Scalars['String'];
  links: KnowledgeEntryLinks;
  names: Array<Scalars['String']>;
  tags: Array<Scalars['String']>;
};

export type KnowledgeEntryLinks = {
  __typename?: 'KnowledgeEntryLinks';
  incoming: Array<KnowledgeEntry>;
  outgoing: Array<KnowledgeEntry>;
};

export type LyricLine = {
  __typename?: 'LyricLine';
  position: Scalars['Int'];
  text: Scalars['String'];
};

export type Lyrics = {
  __typename?: 'Lyrics';
  lines: Array<LyricLine>;
};

export type MusicAlbum = {
  __typename?: 'MusicAlbum';
  imageUrl: Scalars['String'];
  name: Scalars['String'];
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['String'];
};

export type MusicArtist = {
  __typename?: 'MusicArtist';
  name: Scalars['String'];
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['String'];
};

export type MusicInfo = {
  __typename?: 'MusicInfo';
  isPlaying: Scalars['Boolean'];
  progress: Scalars['Int'];
  track: MusicTrack;
};

export type MusicTrack = {
  __typename?: 'MusicTrack';
  album: MusicAlbum;
  artists: Array<MusicArtist>;
  duration: Scalars['Int'];
  lyrics?: Maybe<Lyrics>;
  name: Scalars['String'];
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createForm: CreateFormPayload;
  deleteForm: DeleteFormPayload;
  submitForm: SubmitFormPayload;
  testFailure: TestFailurePayload;
};


export type MutationCreateFormArgs = {
  input: CreateFormInput;
};


export type MutationDeleteFormArgs = {
  input: DeleteFormInput;
};


export type MutationSubmitFormArgs = {
  input: SubmitFormInput;
};

export type Query = {
  __typename?: 'Query';
  buildInfo: BuildInfo;
  form?: Maybe<Form>;
  formByHandle?: Maybe<Form>;
  heartRate?: Maybe<HeartRate>;
  knowledgeEntries: Array<KnowledgeEntry>;
  knowledgeEntry?: Maybe<KnowledgeEntry>;
  musicInfo?: Maybe<MusicInfo>;
  viewer?: Maybe<User>;
};


export type QueryFormArgs = {
  id: Scalars['ID'];
};


export type QueryFormByHandleArgs = {
  handle: Scalars['String'];
};


export type QueryKnowledgeEntryArgs = {
  id: Scalars['String'];
};

export type SubmitFormInput = {
  fields: Array<FormFieldResponseInput>;
  formId: Scalars['ID'];
  respondent: Scalars['String'];
};

export type SubmitFormPayload = {
  __typename?: 'SubmitFormPayload';
  ok: Scalars['Boolean'];
};

export type TestFailurePayload = {
  __typename?: 'TestFailurePayload';
  ok: Scalars['Boolean'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['String'];
  isAdmin: Scalars['Boolean'];
};

export type HeartStatHeartRateFragment = { __typename?: 'HeartRate', id: string, measurement: number, timestamp: any };

export type HeartSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type HeartSectionQuery = { __typename?: 'Query', heartRate?: { __typename?: 'HeartRate', id: string, measurement: number, timestamp: any } | null | undefined };

export type KnowledgeGraphEntryFragment = { __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } };

export type MusicLyricsQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicLyricsQuery = { __typename?: 'Query', musicInfo?: { __typename?: 'MusicInfo', track: { __typename?: 'MusicTrack', spotifyId: string, lyrics?: { __typename?: 'Lyrics', lines: Array<{ __typename?: 'LyricLine', text: string, position: number }> } | null | undefined } } | null | undefined };

export type MusicSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionQuery = { __typename?: 'Query', musicInfo?: { __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string, spotifyUrl: string, name: string, duration: number, album: { __typename?: 'MusicAlbum', spotifyId: string, spotifyUrl: string, name: string }, artists: Array<{ __typename?: 'MusicArtist', spotifyId: string, spotifyUrl: string, name: string }> } } | null | undefined };

export type MusicSectionHeartbeatQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionHeartbeatQuery = { __typename?: 'Query', musicInfo?: { __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string } } | null | undefined };

export type HomePageQueryVariables = Exact<{
  dailyNoteId: Scalars['String'];
}>;


export type HomePageQuery = { __typename?: 'Query', dailyEntry?: { __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }> } } | null | undefined };

export type KnowledgePageQueryVariables = Exact<{ [key: string]: never; }>;


export type KnowledgePageQuery = { __typename?: 'Query', entries: Array<{ __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }> };

export type SubmitFormMutationVariables = Exact<{
  input: SubmitFormInput;
}>;


export type SubmitFormMutation = { __typename?: 'Mutation', payload: { __typename?: 'SubmitFormPayload', ok: boolean } };

export type ResearchPagePropsQueryVariables = Exact<{
  handle: Scalars['String'];
}>;


export type ResearchPagePropsQuery = { __typename?: 'Query', form?: { __typename?: 'Form', id: string, handle: string, name: string, description?: string | null | undefined, respondentLabel?: string | null | undefined, respondentHelper?: string | null | undefined, fields: Array<{ __typename?: 'FormField', question: string, input: { __typename?: 'FormFieldInputConfig', text?: boolean | null | undefined, singleChoice?: { __typename?: 'FormFieldSingleChoiceInputConfig', options: Array<string> } | null | undefined, multipleChoice?: { __typename?: 'FormFieldMultipleChoiceInputConfig', options: Array<string> } | null | undefined } }> } | null | undefined };

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
export const SubmitFormDocument = gql`
    mutation SubmitForm($input: SubmitFormInput!) {
  payload: submitForm(input: $input) {
    ok
  }
}
    `;
export type SubmitFormMutationFn = Apollo.MutationFunction<SubmitFormMutation, SubmitFormMutationVariables>;

/**
 * __useSubmitFormMutation__
 *
 * To run a mutation, you first call `useSubmitFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitFormMutation, { data, loading, error }] = useSubmitFormMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitFormMutation(baseOptions?: Apollo.MutationHookOptions<SubmitFormMutation, SubmitFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitFormMutation, SubmitFormMutationVariables>(SubmitFormDocument, options);
      }
export type SubmitFormMutationHookResult = ReturnType<typeof useSubmitFormMutation>;
export type SubmitFormMutationResult = Apollo.MutationResult<SubmitFormMutation>;
export type SubmitFormMutationOptions = Apollo.BaseMutationOptions<SubmitFormMutation, SubmitFormMutationVariables>;
export const ResearchPagePropsDocument = gql`
    query ResearchPageProps($handle: String!) {
  form: formByHandle(handle: $handle) {
    id
    handle
    name
    description
    fields {
      question
      input {
        text
        singleChoice {
          options
        }
        multipleChoice {
          options
        }
      }
    }
    respondentLabel
    respondentHelper
  }
}
    `;

/**
 * __useResearchPagePropsQuery__
 *
 * To run a query within a React component, call `useResearchPagePropsQuery` and pass it any options that fit your needs.
 * When your component renders, `useResearchPagePropsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useResearchPagePropsQuery({
 *   variables: {
 *      handle: // value for 'handle'
 *   },
 * });
 */
export function useResearchPagePropsQuery(baseOptions: Apollo.QueryHookOptions<ResearchPagePropsQuery, ResearchPagePropsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ResearchPagePropsQuery, ResearchPagePropsQueryVariables>(ResearchPagePropsDocument, options);
      }
export function useResearchPagePropsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ResearchPagePropsQuery, ResearchPagePropsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ResearchPagePropsQuery, ResearchPagePropsQueryVariables>(ResearchPagePropsDocument, options);
        }
export type ResearchPagePropsQueryHookResult = ReturnType<typeof useResearchPagePropsQuery>;
export type ResearchPagePropsLazyQueryHookResult = ReturnType<typeof useResearchPagePropsLazyQuery>;
export type ResearchPagePropsQueryResult = Apollo.QueryResult<ResearchPagePropsQuery, ResearchPagePropsQueryVariables>;