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
  /** URL is a String implementing the [URL Standard](http://url.spec.whatwg.org/) */
  Url: any;
};

export type ArchiveFormInput = {
  formId: Scalars['ID'];
};

export type ArchiveFormPayload = {
  __typename?: 'ArchiveFormPayload';
  form: Form;
  ok: Scalars['Boolean'];
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
  isArchived: Scalars['Boolean'];
  name: Scalars['String'];
  respondentHelper?: Maybe<Scalars['String']>;
  respondentLabel?: Maybe<Scalars['String']>;
  responses: Array<FormResponse>;
  responsesCount: Scalars['Int'];
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

export type FormResponse = {
  __typename?: 'FormResponse';
  createdAt: Scalars['DateTime'];
  fields: Array<FormResponseField>;
  form: Form;
  id: Scalars['ID'];
  respondent: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type FormResponseField = {
  __typename?: 'FormResponseField';
  multipleChoice?: Maybe<Array<Scalars['String']>>;
  singleChoice?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
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
  imageUrl: Scalars['Url'];
  name: Scalars['String'];
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['Url'];
};

export type MusicArtist = {
  __typename?: 'MusicArtist';
  name: Scalars['String'];
  spotifyId: Scalars['String'];
  spotifyUrl: Scalars['Url'];
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
  spotifyUrl: Scalars['Url'];
};

export type Mutation = {
  __typename?: 'Mutation';
  archiveForm: ArchiveFormPayload;
  createForm: CreateFormPayload;
  deleteForm: DeleteFormPayload;
  restoreForm: RestoreFormPayload;
  submitForm: SubmitFormPayload;
  test: TestPayload;
  testFailure: TestPayload;
  updateForm: UpdateFormPayload;
};


export type MutationArchiveFormArgs = {
  input: ArchiveFormInput;
};


export type MutationCreateFormArgs = {
  input: CreateFormInput;
};


export type MutationDeleteFormArgs = {
  input: DeleteFormInput;
};


export type MutationRestoreFormArgs = {
  input: RestoreFormInput;
};


export type MutationSubmitFormArgs = {
  input: SubmitFormInput;
};


export type MutationTestArgs = {
  input: TestInput;
};


export type MutationTestFailureArgs = {
  input: TestInput;
};


export type MutationUpdateFormArgs = {
  input: UpdateFormInput;
};

export type Query = {
  __typename?: 'Query';
  buildInfo: BuildInfo;
  form?: Maybe<Form>;
  formByHandle?: Maybe<Form>;
  formResponse?: Maybe<FormResponse>;
  forms: Array<Form>;
  heartRate?: Maybe<HeartRate>;
  knowledgeEntries: Array<KnowledgeEntry>;
  knowledgeEntry?: Maybe<KnowledgeEntry>;
  musicInfo?: Maybe<MusicInfo>;
  test: Scalars['Boolean'];
  viewer?: Maybe<User>;
};


export type QueryFormArgs = {
  id: Scalars['ID'];
};


export type QueryFormByHandleArgs = {
  handle: Scalars['String'];
};


export type QueryFormResponseArgs = {
  id: Scalars['ID'];
};


export type QueryFormsArgs = {
  includeArchived?: Scalars['Boolean'];
  skip?: Scalars['Int'];
  take?: Scalars['Int'];
};


export type QueryKnowledgeEntryArgs = {
  id: Scalars['String'];
};

export type RestoreFormInput = {
  formId: Scalars['ID'];
};

export type RestoreFormPayload = {
  __typename?: 'RestoreFormPayload';
  form: Form;
  ok: Scalars['Boolean'];
};

export type SubmitFormInput = {
  fields: Array<FormFieldResponseInput>;
  formId: Scalars['ID'];
  respondent: Scalars['String'];
};

export type SubmitFormPayload = {
  __typename?: 'SubmitFormPayload';
  ok: Scalars['Boolean'];
  response: FormResponse;
};

export type Subscription = {
  __typename?: 'Subscription';
  test: Scalars['Int'];
};

export type TestInput = {
  value: Scalars['String'];
};

export type TestPayload = {
  __typename?: 'TestPayload';
  ok: Scalars['Boolean'];
  value: Scalars['String'];
};

export type UpdateFormInput = {
  description?: Maybe<Scalars['String']>;
  formId: Scalars['ID'];
  handle: Scalars['String'];
  name: Scalars['String'];
  respondentHelper?: Maybe<Scalars['String']>;
  respondentLabel?: Maybe<Scalars['String']>;
};

export type UpdateFormPayload = {
  __typename?: 'UpdateFormPayload';
  form: Form;
  ok: Scalars['Boolean'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['String'];
  isAdmin: Scalars['Boolean'];
};

export type AdminResearchSectionQueryVariables = Exact<{
  skip?: Maybe<Scalars['Int']>;
}>;


export type AdminResearchSectionQuery = { __typename?: 'Query', forms: Array<{ __typename?: 'Form', id: string, handle: string, name: string, description?: string | null | undefined, isArchived: boolean, responses: Array<{ __typename?: 'FormResponse', id: string, respondent: string }> }> };

export type CreateFormMutationVariables = Exact<{
  input: CreateFormInput;
}>;


export type CreateFormMutation = { __typename?: 'Mutation', payload: { __typename?: 'CreateFormPayload', form: { __typename?: 'Form', id: string, handle: string, name: string, description?: string | null | undefined, respondentLabel?: string | null | undefined, respondentHelper?: string | null | undefined, fields: Array<{ __typename?: 'FormField', question: string, input: { __typename?: 'FormFieldInputConfig', text?: boolean | null | undefined, singleChoice?: { __typename?: 'FormFieldSingleChoiceInputConfig', options: Array<string> } | null | undefined, multipleChoice?: { __typename?: 'FormFieldMultipleChoiceInputConfig', options: Array<string> } | null | undefined } }> } } };

export type FormCardFormFragment = { __typename?: 'Form', id: string, handle: string, name: string, description?: string | null | undefined, isArchived: boolean, responses: Array<{ __typename?: 'FormResponse', id: string, respondent: string }> };

export type ArchiveFormMutationVariables = Exact<{
  input: ArchiveFormInput;
}>;


export type ArchiveFormMutation = { __typename?: 'Mutation', payload: { __typename?: 'ArchiveFormPayload', form: { __typename?: 'Form', id: string, isArchived: boolean } } };

export type RestoreFormMutationVariables = Exact<{
  input: RestoreFormInput;
}>;


export type RestoreFormMutation = { __typename?: 'Mutation', payload: { __typename?: 'RestoreFormPayload', form: { __typename?: 'Form', id: string, isArchived: boolean } } };

export type DeleteFormMutationVariables = Exact<{
  input: DeleteFormInput;
}>;


export type DeleteFormMutation = { __typename?: 'Mutation', payload: { __typename?: 'DeleteFormPayload', ok: boolean } };

export type FormResponseDialogQueryVariables = Exact<{
  responseId: Scalars['ID'];
}>;


export type FormResponseDialogQuery = { __typename?: 'Query', formResponse?: { __typename?: 'FormResponse', id: string, respondent: string, fields: Array<{ __typename?: 'FormResponseField', text?: string | null | undefined, singleChoice?: string | null | undefined, multipleChoice?: Array<string> | null | undefined }>, form: { __typename?: 'Form', id: string, name: string, fields: Array<{ __typename?: 'FormField', question: string, input: { __typename?: 'FormFieldInputConfig', text?: boolean | null | undefined, singleChoice?: { __typename?: 'FormFieldSingleChoiceInputConfig', options: Array<string> } | null | undefined, multipleChoice?: { __typename?: 'FormFieldMultipleChoiceInputConfig', options: Array<string> } | null | undefined } }> } } | null | undefined };

export type HeartStatHeartRateFragment = { __typename?: 'HeartRate', id: string, measurement: number, timestamp: any };

export type HomeHeartSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeHeartSectionQuery = { __typename?: 'Query', heartRate?: { __typename?: 'HeartRate', id: string, measurement: number, timestamp: any } | null | undefined };

export type HomeMusicSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeMusicSectionQuery = { __typename?: 'Query', musicInfo?: { __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string, spotifyUrl: any, name: string, duration: number, album: { __typename?: 'MusicAlbum', spotifyId: string, spotifyUrl: any, name: string }, artists: Array<{ __typename?: 'MusicArtist', spotifyId: string, spotifyUrl: any, name: string }> } } | null | undefined };

export type HomeMusicSectionHeartbeatQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeMusicSectionHeartbeatQuery = { __typename?: 'Query', musicInfo?: { __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string } } | null | undefined };

export type KnowledgeGraphEntryFragment = { __typename?: 'KnowledgeEntry', id: string, tags: Array<string>, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } };

export type LayoutFooterQueryVariables = Exact<{ [key: string]: never; }>;


export type LayoutFooterQuery = { __typename?: 'Query', viewer?: { __typename?: 'User', id: string, email: string, isAdmin: boolean } | null | undefined };

export type MusicLyricsQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicLyricsQuery = { __typename?: 'Query', musicInfo?: { __typename?: 'MusicInfo', track: { __typename?: 'MusicTrack', spotifyId: string, lyrics?: { __typename?: 'Lyrics', lines: Array<{ __typename?: 'LyricLine', text: string, position: number }> } | null | undefined } } | null | undefined };

export type UpdateFormDialogQueryVariables = Exact<{
  formId: Scalars['ID'];
}>;


export type UpdateFormDialogQuery = { __typename?: 'Query', form?: { __typename?: 'Form', id: string, handle: string, name: string, description?: string | null | undefined, respondentLabel?: string | null | undefined, respondentHelper?: string | null | undefined, fields: Array<{ __typename?: 'FormField', question: string, input: { __typename?: 'FormFieldInputConfig', text?: boolean | null | undefined, singleChoice?: { __typename?: 'FormFieldSingleChoiceInputConfig', options: Array<string> } | null | undefined, multipleChoice?: { __typename?: 'FormFieldMultipleChoiceInputConfig', options: Array<string> } | null | undefined } }> } | null | undefined };

export type UpdateFormMutationVariables = Exact<{
  input: UpdateFormInput;
}>;


export type UpdateFormMutation = { __typename?: 'Mutation', payload: { __typename?: 'UpdateFormPayload', form: { __typename?: 'Form', id: string, handle: string, name: string, description?: string | null | undefined, respondentLabel?: string | null | undefined, respondentHelper?: string | null | undefined, fields: Array<{ __typename?: 'FormField', question: string, input: { __typename?: 'FormFieldInputConfig', text?: boolean | null | undefined, singleChoice?: { __typename?: 'FormFieldSingleChoiceInputConfig', options: Array<string> } | null | undefined, multipleChoice?: { __typename?: 'FormFieldMultipleChoiceInputConfig', options: Array<string> } | null | undefined } }> } } };

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
  formHandle: Scalars['String'];
}>;


export type ResearchPagePropsQuery = { __typename?: 'Query', form?: { __typename?: 'Form', id: string, handle: string, name: string, description?: string | null | undefined, respondentLabel?: string | null | undefined, respondentHelper?: string | null | undefined, fields: Array<{ __typename?: 'FormField', question: string, input: { __typename?: 'FormFieldInputConfig', text?: boolean | null | undefined, singleChoice?: { __typename?: 'FormFieldSingleChoiceInputConfig', options: Array<string> } | null | undefined, multipleChoice?: { __typename?: 'FormFieldMultipleChoiceInputConfig', options: Array<string> } | null | undefined } }> } | null | undefined };

export type ResearchCompletePagePropsQueryVariables = Exact<{
  formHandle: Scalars['String'];
}>;


export type ResearchCompletePagePropsQuery = { __typename?: 'Query', form?: { __typename?: 'Form', id: string } | null | undefined };

export type TestMutationVariables = Exact<{
  input: TestInput;
}>;


export type TestMutation = { __typename?: 'Mutation', payload: { __typename?: 'TestPayload', value: string } };

export type TestFailureMutationVariables = Exact<{
  input: TestInput;
}>;


export type TestFailureMutation = { __typename?: 'Mutation', payload: { __typename?: 'TestPayload', value: string } };

export const FormCardFormFragmentDoc = gql`
    fragment FormCardForm on Form {
  id
  handle
  name
  description
  responses {
    id
    respondent
  }
  isArchived
}
    `;
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
export const AdminResearchSectionDocument = gql`
    query AdminResearchSection($skip: Int = 0) {
  forms(skip: $skip, includeArchived: true) {
    id
    ...FormCardForm
  }
}
    ${FormCardFormFragmentDoc}`;

/**
 * __useAdminResearchSectionQuery__
 *
 * To run a query within a React component, call `useAdminResearchSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminResearchSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminResearchSectionQuery({
 *   variables: {
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useAdminResearchSectionQuery(baseOptions?: Apollo.QueryHookOptions<AdminResearchSectionQuery, AdminResearchSectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminResearchSectionQuery, AdminResearchSectionQueryVariables>(AdminResearchSectionDocument, options);
      }
export function useAdminResearchSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminResearchSectionQuery, AdminResearchSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminResearchSectionQuery, AdminResearchSectionQueryVariables>(AdminResearchSectionDocument, options);
        }
export type AdminResearchSectionQueryHookResult = ReturnType<typeof useAdminResearchSectionQuery>;
export type AdminResearchSectionLazyQueryHookResult = ReturnType<typeof useAdminResearchSectionLazyQuery>;
export type AdminResearchSectionQueryResult = Apollo.QueryResult<AdminResearchSectionQuery, AdminResearchSectionQueryVariables>;
export const CreateFormDocument = gql`
    mutation CreateForm($input: CreateFormInput!) {
  payload: createForm(input: $input) {
    form {
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
}
    `;
export type CreateFormMutationFn = Apollo.MutationFunction<CreateFormMutation, CreateFormMutationVariables>;

/**
 * __useCreateFormMutation__
 *
 * To run a mutation, you first call `useCreateFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFormMutation, { data, loading, error }] = useCreateFormMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateFormMutation(baseOptions?: Apollo.MutationHookOptions<CreateFormMutation, CreateFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateFormMutation, CreateFormMutationVariables>(CreateFormDocument, options);
      }
export type CreateFormMutationHookResult = ReturnType<typeof useCreateFormMutation>;
export type CreateFormMutationResult = Apollo.MutationResult<CreateFormMutation>;
export type CreateFormMutationOptions = Apollo.BaseMutationOptions<CreateFormMutation, CreateFormMutationVariables>;
export const ArchiveFormDocument = gql`
    mutation ArchiveForm($input: ArchiveFormInput!) {
  payload: archiveForm(input: $input) {
    form {
      id
      isArchived
    }
  }
}
    `;
export type ArchiveFormMutationFn = Apollo.MutationFunction<ArchiveFormMutation, ArchiveFormMutationVariables>;

/**
 * __useArchiveFormMutation__
 *
 * To run a mutation, you first call `useArchiveFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveFormMutation, { data, loading, error }] = useArchiveFormMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useArchiveFormMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveFormMutation, ArchiveFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveFormMutation, ArchiveFormMutationVariables>(ArchiveFormDocument, options);
      }
export type ArchiveFormMutationHookResult = ReturnType<typeof useArchiveFormMutation>;
export type ArchiveFormMutationResult = Apollo.MutationResult<ArchiveFormMutation>;
export type ArchiveFormMutationOptions = Apollo.BaseMutationOptions<ArchiveFormMutation, ArchiveFormMutationVariables>;
export const RestoreFormDocument = gql`
    mutation RestoreForm($input: RestoreFormInput!) {
  payload: restoreForm(input: $input) {
    form {
      id
      isArchived
    }
  }
}
    `;
export type RestoreFormMutationFn = Apollo.MutationFunction<RestoreFormMutation, RestoreFormMutationVariables>;

/**
 * __useRestoreFormMutation__
 *
 * To run a mutation, you first call `useRestoreFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestoreFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restoreFormMutation, { data, loading, error }] = useRestoreFormMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRestoreFormMutation(baseOptions?: Apollo.MutationHookOptions<RestoreFormMutation, RestoreFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestoreFormMutation, RestoreFormMutationVariables>(RestoreFormDocument, options);
      }
export type RestoreFormMutationHookResult = ReturnType<typeof useRestoreFormMutation>;
export type RestoreFormMutationResult = Apollo.MutationResult<RestoreFormMutation>;
export type RestoreFormMutationOptions = Apollo.BaseMutationOptions<RestoreFormMutation, RestoreFormMutationVariables>;
export const DeleteFormDocument = gql`
    mutation DeleteForm($input: DeleteFormInput!) {
  payload: deleteForm(input: $input) {
    ok
  }
}
    `;
export type DeleteFormMutationFn = Apollo.MutationFunction<DeleteFormMutation, DeleteFormMutationVariables>;

/**
 * __useDeleteFormMutation__
 *
 * To run a mutation, you first call `useDeleteFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFormMutation, { data, loading, error }] = useDeleteFormMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteFormMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFormMutation, DeleteFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFormMutation, DeleteFormMutationVariables>(DeleteFormDocument, options);
      }
export type DeleteFormMutationHookResult = ReturnType<typeof useDeleteFormMutation>;
export type DeleteFormMutationResult = Apollo.MutationResult<DeleteFormMutation>;
export type DeleteFormMutationOptions = Apollo.BaseMutationOptions<DeleteFormMutation, DeleteFormMutationVariables>;
export const FormResponseDialogDocument = gql`
    query FormResponseDialog($responseId: ID!) {
  formResponse(id: $responseId) {
    id
    respondent
    fields {
      text
      singleChoice
      multipleChoice
    }
    form {
      id
      name
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
    }
  }
}
    `;

/**
 * __useFormResponseDialogQuery__
 *
 * To run a query within a React component, call `useFormResponseDialogQuery` and pass it any options that fit your needs.
 * When your component renders, `useFormResponseDialogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFormResponseDialogQuery({
 *   variables: {
 *      responseId: // value for 'responseId'
 *   },
 * });
 */
export function useFormResponseDialogQuery(baseOptions: Apollo.QueryHookOptions<FormResponseDialogQuery, FormResponseDialogQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FormResponseDialogQuery, FormResponseDialogQueryVariables>(FormResponseDialogDocument, options);
      }
export function useFormResponseDialogLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FormResponseDialogQuery, FormResponseDialogQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FormResponseDialogQuery, FormResponseDialogQueryVariables>(FormResponseDialogDocument, options);
        }
export type FormResponseDialogQueryHookResult = ReturnType<typeof useFormResponseDialogQuery>;
export type FormResponseDialogLazyQueryHookResult = ReturnType<typeof useFormResponseDialogLazyQuery>;
export type FormResponseDialogQueryResult = Apollo.QueryResult<FormResponseDialogQuery, FormResponseDialogQueryVariables>;
export const HomeHeartSectionDocument = gql`
    query HomeHeartSection {
  heartRate {
    id
    ...HeartStatHeartRate
  }
}
    ${HeartStatHeartRateFragmentDoc}`;

/**
 * __useHomeHeartSectionQuery__
 *
 * To run a query within a React component, call `useHomeHeartSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomeHeartSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomeHeartSectionQuery({
 *   variables: {
 *   },
 * });
 */
export function useHomeHeartSectionQuery(baseOptions?: Apollo.QueryHookOptions<HomeHeartSectionQuery, HomeHeartSectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HomeHeartSectionQuery, HomeHeartSectionQueryVariables>(HomeHeartSectionDocument, options);
      }
export function useHomeHeartSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HomeHeartSectionQuery, HomeHeartSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HomeHeartSectionQuery, HomeHeartSectionQueryVariables>(HomeHeartSectionDocument, options);
        }
export type HomeHeartSectionQueryHookResult = ReturnType<typeof useHomeHeartSectionQuery>;
export type HomeHeartSectionLazyQueryHookResult = ReturnType<typeof useHomeHeartSectionLazyQuery>;
export type HomeHeartSectionQueryResult = Apollo.QueryResult<HomeHeartSectionQuery, HomeHeartSectionQueryVariables>;
export const HomeMusicSectionDocument = gql`
    query HomeMusicSection {
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
 * __useHomeMusicSectionQuery__
 *
 * To run a query within a React component, call `useHomeMusicSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomeMusicSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomeMusicSectionQuery({
 *   variables: {
 *   },
 * });
 */
export function useHomeMusicSectionQuery(baseOptions?: Apollo.QueryHookOptions<HomeMusicSectionQuery, HomeMusicSectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HomeMusicSectionQuery, HomeMusicSectionQueryVariables>(HomeMusicSectionDocument, options);
      }
export function useHomeMusicSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HomeMusicSectionQuery, HomeMusicSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HomeMusicSectionQuery, HomeMusicSectionQueryVariables>(HomeMusicSectionDocument, options);
        }
export type HomeMusicSectionQueryHookResult = ReturnType<typeof useHomeMusicSectionQuery>;
export type HomeMusicSectionLazyQueryHookResult = ReturnType<typeof useHomeMusicSectionLazyQuery>;
export type HomeMusicSectionQueryResult = Apollo.QueryResult<HomeMusicSectionQuery, HomeMusicSectionQueryVariables>;
export const HomeMusicSectionHeartbeatDocument = gql`
    query HomeMusicSectionHeartbeat {
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
 * __useHomeMusicSectionHeartbeatQuery__
 *
 * To run a query within a React component, call `useHomeMusicSectionHeartbeatQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomeMusicSectionHeartbeatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomeMusicSectionHeartbeatQuery({
 *   variables: {
 *   },
 * });
 */
export function useHomeMusicSectionHeartbeatQuery(baseOptions?: Apollo.QueryHookOptions<HomeMusicSectionHeartbeatQuery, HomeMusicSectionHeartbeatQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HomeMusicSectionHeartbeatQuery, HomeMusicSectionHeartbeatQueryVariables>(HomeMusicSectionHeartbeatDocument, options);
      }
export function useHomeMusicSectionHeartbeatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HomeMusicSectionHeartbeatQuery, HomeMusicSectionHeartbeatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HomeMusicSectionHeartbeatQuery, HomeMusicSectionHeartbeatQueryVariables>(HomeMusicSectionHeartbeatDocument, options);
        }
export type HomeMusicSectionHeartbeatQueryHookResult = ReturnType<typeof useHomeMusicSectionHeartbeatQuery>;
export type HomeMusicSectionHeartbeatLazyQueryHookResult = ReturnType<typeof useHomeMusicSectionHeartbeatLazyQuery>;
export type HomeMusicSectionHeartbeatQueryResult = Apollo.QueryResult<HomeMusicSectionHeartbeatQuery, HomeMusicSectionHeartbeatQueryVariables>;
export const LayoutFooterDocument = gql`
    query LayoutFooter {
  viewer {
    id
    email
    isAdmin
  }
}
    `;

/**
 * __useLayoutFooterQuery__
 *
 * To run a query within a React component, call `useLayoutFooterQuery` and pass it any options that fit your needs.
 * When your component renders, `useLayoutFooterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLayoutFooterQuery({
 *   variables: {
 *   },
 * });
 */
export function useLayoutFooterQuery(baseOptions?: Apollo.QueryHookOptions<LayoutFooterQuery, LayoutFooterQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LayoutFooterQuery, LayoutFooterQueryVariables>(LayoutFooterDocument, options);
      }
export function useLayoutFooterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LayoutFooterQuery, LayoutFooterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LayoutFooterQuery, LayoutFooterQueryVariables>(LayoutFooterDocument, options);
        }
export type LayoutFooterQueryHookResult = ReturnType<typeof useLayoutFooterQuery>;
export type LayoutFooterLazyQueryHookResult = ReturnType<typeof useLayoutFooterLazyQuery>;
export type LayoutFooterQueryResult = Apollo.QueryResult<LayoutFooterQuery, LayoutFooterQueryVariables>;
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
export const UpdateFormDialogDocument = gql`
    query UpdateFormDialog($formId: ID!) {
  form(id: $formId) {
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
 * __useUpdateFormDialogQuery__
 *
 * To run a query within a React component, call `useUpdateFormDialogQuery` and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormDialogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUpdateFormDialogQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useUpdateFormDialogQuery(baseOptions: Apollo.QueryHookOptions<UpdateFormDialogQuery, UpdateFormDialogQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UpdateFormDialogQuery, UpdateFormDialogQueryVariables>(UpdateFormDialogDocument, options);
      }
export function useUpdateFormDialogLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UpdateFormDialogQuery, UpdateFormDialogQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UpdateFormDialogQuery, UpdateFormDialogQueryVariables>(UpdateFormDialogDocument, options);
        }
export type UpdateFormDialogQueryHookResult = ReturnType<typeof useUpdateFormDialogQuery>;
export type UpdateFormDialogLazyQueryHookResult = ReturnType<typeof useUpdateFormDialogLazyQuery>;
export type UpdateFormDialogQueryResult = Apollo.QueryResult<UpdateFormDialogQuery, UpdateFormDialogQueryVariables>;
export const UpdateFormDocument = gql`
    mutation UpdateForm($input: UpdateFormInput!) {
  payload: updateForm(input: $input) {
    form {
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
}
    `;
export type UpdateFormMutationFn = Apollo.MutationFunction<UpdateFormMutation, UpdateFormMutationVariables>;

/**
 * __useUpdateFormMutation__
 *
 * To run a mutation, you first call `useUpdateFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormMutation, { data, loading, error }] = useUpdateFormMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateFormMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFormMutation, UpdateFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFormMutation, UpdateFormMutationVariables>(UpdateFormDocument, options);
      }
export type UpdateFormMutationHookResult = ReturnType<typeof useUpdateFormMutation>;
export type UpdateFormMutationResult = Apollo.MutationResult<UpdateFormMutation>;
export type UpdateFormMutationOptions = Apollo.BaseMutationOptions<UpdateFormMutation, UpdateFormMutationVariables>;
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
    query ResearchPageProps($formHandle: String!) {
  form: formByHandle(handle: $formHandle) {
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
 *      formHandle: // value for 'formHandle'
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
export const ResearchCompletePagePropsDocument = gql`
    query ResearchCompletePageProps($formHandle: String!) {
  form: formByHandle(handle: $formHandle) {
    id
  }
}
    `;

/**
 * __useResearchCompletePagePropsQuery__
 *
 * To run a query within a React component, call `useResearchCompletePagePropsQuery` and pass it any options that fit your needs.
 * When your component renders, `useResearchCompletePagePropsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useResearchCompletePagePropsQuery({
 *   variables: {
 *      formHandle: // value for 'formHandle'
 *   },
 * });
 */
export function useResearchCompletePagePropsQuery(baseOptions: Apollo.QueryHookOptions<ResearchCompletePagePropsQuery, ResearchCompletePagePropsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ResearchCompletePagePropsQuery, ResearchCompletePagePropsQueryVariables>(ResearchCompletePagePropsDocument, options);
      }
export function useResearchCompletePagePropsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ResearchCompletePagePropsQuery, ResearchCompletePagePropsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ResearchCompletePagePropsQuery, ResearchCompletePagePropsQueryVariables>(ResearchCompletePagePropsDocument, options);
        }
export type ResearchCompletePagePropsQueryHookResult = ReturnType<typeof useResearchCompletePagePropsQuery>;
export type ResearchCompletePagePropsLazyQueryHookResult = ReturnType<typeof useResearchCompletePagePropsLazyQuery>;
export type ResearchCompletePagePropsQueryResult = Apollo.QueryResult<ResearchCompletePagePropsQuery, ResearchCompletePagePropsQueryVariables>;
export const TestDocument = gql`
    mutation Test($input: TestInput!) {
  payload: test(input: $input) {
    value
  }
}
    `;
export type TestMutationFn = Apollo.MutationFunction<TestMutation, TestMutationVariables>;

/**
 * __useTestMutation__
 *
 * To run a mutation, you first call `useTestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [testMutation, { data, loading, error }] = useTestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTestMutation(baseOptions?: Apollo.MutationHookOptions<TestMutation, TestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TestMutation, TestMutationVariables>(TestDocument, options);
      }
export type TestMutationHookResult = ReturnType<typeof useTestMutation>;
export type TestMutationResult = Apollo.MutationResult<TestMutation>;
export type TestMutationOptions = Apollo.BaseMutationOptions<TestMutation, TestMutationVariables>;
export const TestFailureDocument = gql`
    mutation TestFailure($input: TestInput!) {
  payload: testFailure(input: $input) {
    value
  }
}
    `;
export type TestFailureMutationFn = Apollo.MutationFunction<TestFailureMutation, TestFailureMutationVariables>;

/**
 * __useTestFailureMutation__
 *
 * To run a mutation, you first call `useTestFailureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTestFailureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [testFailureMutation, { data, loading, error }] = useTestFailureMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTestFailureMutation(baseOptions?: Apollo.MutationHookOptions<TestFailureMutation, TestFailureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TestFailureMutation, TestFailureMutationVariables>(TestFailureDocument, options);
      }
export type TestFailureMutationHookResult = ReturnType<typeof useTestFailureMutation>;
export type TestFailureMutationResult = Apollo.MutationResult<TestFailureMutation>;
export type TestFailureMutationOptions = Apollo.BaseMutationOptions<TestFailureMutation, TestFailureMutationVariables>;