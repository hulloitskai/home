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

export type KnowledgeGraph = {
  __typename?: 'KnowledgeGraph';
  entries: Array<KnowledgeGraphEntry>;
  entry?: Maybe<KnowledgeGraphEntry>;
};


export type KnowledgeGraphEntryArgs = {
  id: Scalars['String'];
};

export type KnowledgeGraphEntry = {
  __typename?: 'KnowledgeGraphEntry';
  id: Scalars['String'];
  names: Array<Scalars['String']>;
  links: KnowledgeGraphLinks;
};

export type KnowledgeGraphLinks = {
  __typename?: 'KnowledgeGraphLinks';
  outgoing: Array<Scalars['String']>;
  incoming: Array<Scalars['String']>;
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
  knowledge: KnowledgeGraph;
  heartRate?: Maybe<HeartRate>;
  musicInfo?: Maybe<MusicInfo>;
};

export type HeartStatHeartRateFragment = { __typename?: 'HeartRate', id: string, measurement: number, timestamp: any };

export type HeartSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type HeartSectionQuery = { __typename?: 'Query', heartRate?: Maybe<{ __typename?: 'HeartRate', id: string, measurement: number, timestamp: any }> };

export type KnowledgeGraphEntryFragment = { __typename?: 'KnowledgeGraphEntry', id: string, links: { __typename?: 'KnowledgeGraphLinks', incoming: Array<string>, outgoing: Array<string> } };

export type MusicSectionQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string, spotifyUrl: string, name: string, duration: number, album: { __typename?: 'MusicAlbum', spotifyId: string, spotifyUrl: string, name: string }, artists: Array<{ __typename?: 'MusicArtist', spotifyId: string, spotifyUrl: string, name: string }> } }> };

export type MusicSectionHeartbeatQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicSectionHeartbeatQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', isPlaying: boolean, progress: number, track: { __typename?: 'MusicTrack', spotifyId: string } }> };

export type MusicLyricsQueryVariables = Exact<{ [key: string]: never; }>;


export type MusicLyricsQuery = { __typename?: 'Query', musicInfo?: Maybe<{ __typename?: 'MusicInfo', track: { __typename?: 'MusicTrack', spotifyId: string, lyrics?: Maybe<{ __typename?: 'Lyrics', lines: Array<{ __typename?: 'LyricLine', text: string, position: number }> }> } }> };

export type HomeQueryVariables = Exact<{
  dailyNoteId: Scalars['String'];
}>;


export type HomeQuery = { __typename?: 'Query', knowledge: { __typename?: 'KnowledgeGraph', dailyEntry?: Maybe<{ __typename?: 'KnowledgeGraphEntry', id: string, links: { __typename?: 'KnowledgeGraphLinks', outgoing: Array<string>, incoming: Array<string> } }> } };

export type KnowledgeQueryVariables = Exact<{ [key: string]: never; }>;


export type KnowledgeQuery = { __typename?: 'Query', knowledge: { __typename?: 'KnowledgeGraph', entries: Array<{ __typename?: 'KnowledgeGraphEntry', id: string, links: { __typename?: 'KnowledgeGraphLinks', incoming: Array<string>, outgoing: Array<string> } }> } };

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
        "name": "KnowledgeGraph",
        "fields": [
          {
            "name": "entries",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "KnowledgeGraphEntry",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          },
          {
            "name": "entry",
            "type": {
              "kind": "OBJECT",
              "name": "KnowledgeGraphEntry",
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
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "KnowledgeGraphEntry",
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
                "name": "KnowledgeGraphLinks",
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
        "name": "KnowledgeGraphLinks",
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
                    "kind": "SCALAR",
                    "name": "Any"
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
                    "kind": "SCALAR",
                    "name": "Any"
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
            "name": "knowledge",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "KnowledgeGraph",
                "ofType": null
              }
            },
            "args": []
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