import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type BuildInfoKeySpecifier = ('timestamp' | 'version' | BuildInfoKeySpecifier)[];
export type BuildInfoFieldPolicy = {
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>,
	version?: FieldPolicy<any> | FieldReadFunction<any>
};
export type HeartRateKeySpecifier = ('id' | 'createdAt' | 'updatedAt' | 'measurement' | 'timestamp' | HeartRateKeySpecifier)[];
export type HeartRateFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	updatedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	measurement?: FieldPolicy<any> | FieldReadFunction<any>,
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KnowledgeEntryKeySpecifier = ('id' | 'names' | 'links' | 'tags' | KnowledgeEntryKeySpecifier)[];
export type KnowledgeEntryFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	names?: FieldPolicy<any> | FieldReadFunction<any>,
	links?: FieldPolicy<any> | FieldReadFunction<any>,
	tags?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KnowledgeEntryLinksKeySpecifier = ('outgoing' | 'incoming' | KnowledgeEntryLinksKeySpecifier)[];
export type KnowledgeEntryLinksFieldPolicy = {
	outgoing?: FieldPolicy<any> | FieldReadFunction<any>,
	incoming?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LyricLineKeySpecifier = ('text' | 'position' | LyricLineKeySpecifier)[];
export type LyricLineFieldPolicy = {
	text?: FieldPolicy<any> | FieldReadFunction<any>,
	position?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LyricsKeySpecifier = ('lines' | LyricsKeySpecifier)[];
export type LyricsFieldPolicy = {
	lines?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicAlbumKeySpecifier = ('spotifyId' | 'spotifyUrl' | 'name' | 'imageUrl' | MusicAlbumKeySpecifier)[];
export type MusicAlbumFieldPolicy = {
	spotifyId?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	imageUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicArtistKeySpecifier = ('spotifyId' | 'spotifyUrl' | 'name' | MusicArtistKeySpecifier)[];
export type MusicArtistFieldPolicy = {
	spotifyId?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicInfoKeySpecifier = ('isPlaying' | 'track' | 'progress' | MusicInfoKeySpecifier)[];
export type MusicInfoFieldPolicy = {
	isPlaying?: FieldPolicy<any> | FieldReadFunction<any>,
	track?: FieldPolicy<any> | FieldReadFunction<any>,
	progress?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicTrackKeySpecifier = ('spotifyId' | 'spotifyUrl' | 'name' | 'duration' | 'album' | 'artists' | 'lyrics' | MusicTrackKeySpecifier)[];
export type MusicTrackFieldPolicy = {
	spotifyId?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	duration?: FieldPolicy<any> | FieldReadFunction<any>,
	album?: FieldPolicy<any> | FieldReadFunction<any>,
	artists?: FieldPolicy<any> | FieldReadFunction<any>,
	lyrics?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('buildInfo' | 'knowledgeEntries' | 'knowledgeEntry' | 'heartRate' | 'musicInfo' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	buildInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	knowledgeEntries?: FieldPolicy<any> | FieldReadFunction<any>,
	knowledgeEntry?: FieldPolicy<any> | FieldReadFunction<any>,
	heartRate?: FieldPolicy<any> | FieldReadFunction<any>,
	musicInfo?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	BuildInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BuildInfoKeySpecifier | (() => undefined | BuildInfoKeySpecifier),
		fields?: BuildInfoFieldPolicy,
	},
	HeartRate?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | HeartRateKeySpecifier | (() => undefined | HeartRateKeySpecifier),
		fields?: HeartRateFieldPolicy,
	},
	KnowledgeEntry?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KnowledgeEntryKeySpecifier | (() => undefined | KnowledgeEntryKeySpecifier),
		fields?: KnowledgeEntryFieldPolicy,
	},
	KnowledgeEntryLinks?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KnowledgeEntryLinksKeySpecifier | (() => undefined | KnowledgeEntryLinksKeySpecifier),
		fields?: KnowledgeEntryLinksFieldPolicy,
	},
	LyricLine?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LyricLineKeySpecifier | (() => undefined | LyricLineKeySpecifier),
		fields?: LyricLineFieldPolicy,
	},
	Lyrics?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LyricsKeySpecifier | (() => undefined | LyricsKeySpecifier),
		fields?: LyricsFieldPolicy,
	},
	MusicAlbum?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MusicAlbumKeySpecifier | (() => undefined | MusicAlbumKeySpecifier),
		fields?: MusicAlbumFieldPolicy,
	},
	MusicArtist?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MusicArtistKeySpecifier | (() => undefined | MusicArtistKeySpecifier),
		fields?: MusicArtistFieldPolicy,
	},
	MusicInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MusicInfoKeySpecifier | (() => undefined | MusicInfoKeySpecifier),
		fields?: MusicInfoFieldPolicy,
	},
	MusicTrack?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MusicTrackKeySpecifier | (() => undefined | MusicTrackKeySpecifier),
		fields?: MusicTrackFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;