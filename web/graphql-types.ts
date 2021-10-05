export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type KnowledgeGraphEntryFragment = { __typename?: 'KnowledgeEntry', id: string, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } };

export type MusicSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string, spotifyUrl: string, name: string, duration: number, album: { __typename?: 'MusicAlbum', spotifyId: string, spotifyUrl: string, name: string }, artists: Array<{ __typename?: 'MusicArtist', spotifyId: string, spotifyUrl: string, name: string }> } }> };

export type MusicSectionHeartbeatQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionHeartbeatQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string } }> };

export type MusicLyricsQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicLyricsQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', track: { __typename?: 'MusicTrack', spotifyId: string, lyrics?: Maybe<{ __typename?: 'Lyrics', lines: Array<{ __typename?: 'LyricLine', text: string, position: number }> }> } }> };

export type HomeQueryVariables = Exact<{
  dailyNoteId: Scalars['String'];
}>;


export type HomeQuery = { __typename?: 'Query', dailyEntry?: Maybe<{ __typename?: 'KnowledgeEntry', id: string, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }> } }> };

export type KnowledgeQueryVariables = Exact<{ [key: string]: never; }>;


export type KnowledgeQuery = { __typename?: 'Query', entries: Array<{ __typename?: 'KnowledgeEntry', id: string, links: { __typename?: 'KnowledgeEntryLinks', incoming: Array<{ __typename?: 'KnowledgeEntry', id: string }>, outgoing: Array<{ __typename?: 'KnowledgeEntry', id: string }> } }> };

import { IntrospectionQuery } from 'graphql';
export default {
  "__schema": {
    "queryType": {
      "name": "Query"
    },
    "mutationType": null,
    "subscriptionType": null,
    "types": [
      {
        "kind": "OBJECT",
        "name": "BuildInfo",
        "fields": [
          {
            "name": "timestamp",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "version",
            "type": {
              "kind": "SCALAR",
              "name": "Any"
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "HeartRate",
        "fields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "createdAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "measurement",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "timestamp",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "KnowledgeEntry",
        "fields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "names",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Any"
                  }
                }
              }
            },
            "args": []
          },
          {
            "name": "links",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "KnowledgeEntryLinks",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "KnowledgeEntryLinks",
        "fields": [
          {
            "name": "outgoing",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "KnowledgeEntry",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          },
          {
            "name": "incoming",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "KnowledgeEntry",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "LyricLine",
        "fields": [
          {
            "name": "text",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "position",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Lyrics",
        "fields": [
          {
            "name": "lines",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "LyricLine",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "MusicAlbum",
        "fields": [
          {
            "name": "spotifyId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "spotifyUrl",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "imageUrl",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "MusicArtist",
        "fields": [
          {
            "name": "spotifyId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "spotifyUrl",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "MusicInfo",
        "fields": [
          {
            "name": "isPlaying",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "track",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "MusicTrack",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "progress",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "MusicTrack",
        "fields": [
          {
            "name": "spotifyId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "spotifyUrl",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "duration",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Any"
              }
            },
            "args": []
          },
          {
            "name": "album",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "MusicAlbum",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "artists",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "MusicArtist",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          },
          {
            "name": "lyrics",
            "type": {
              "kind": "OBJECT",
              "name": "Lyrics",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Query",
        "fields": [
          {
            "name": "buildInfo",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "BuildInfo",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "knowledgeEntries",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "KnowledgeEntry",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          },
          {
            "name": "knowledgeEntry",
            "type": {
              "kind": "OBJECT",
              "name": "KnowledgeEntry",
              "ofType": null
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Any"
                  }
                }
              }
            ]
          },
          {
            "name": "heartRate",
            "type": {
              "kind": "OBJECT",
              "name": "HeartRate",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "musicInfo",
            "type": {
              "kind": "OBJECT",
              "name": "MusicInfo",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "Any"
      }
    ],
    "directives": []
  }
} as unknown as IntrospectionQuery;