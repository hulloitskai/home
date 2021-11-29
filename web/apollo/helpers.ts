import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type ArchiveFormPayloadKeySpecifier = ('form' | 'ok' | ArchiveFormPayloadKeySpecifier)[];
export type ArchiveFormPayloadFieldPolicy = {
	form?: FieldPolicy<any> | FieldReadFunction<any>,
	ok?: FieldPolicy<any> | FieldReadFunction<any>
};
export type BuildInfoKeySpecifier = ('timestamp' | 'version' | BuildInfoKeySpecifier)[];
export type BuildInfoFieldPolicy = {
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>,
	version?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateFormPayloadKeySpecifier = ('form' | 'ok' | CreateFormPayloadKeySpecifier)[];
export type CreateFormPayloadFieldPolicy = {
	form?: FieldPolicy<any> | FieldReadFunction<any>,
	ok?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteFormPayloadKeySpecifier = ('ok' | DeleteFormPayloadKeySpecifier)[];
export type DeleteFormPayloadFieldPolicy = {
	ok?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FormKeySpecifier = ('archivedAt' | 'createdAt' | 'description' | 'fields' | 'handle' | 'id' | 'isArchived' | 'name' | 'respondentHelper' | 'respondentLabel' | 'responses' | 'responsesCount' | 'updatedAt' | FormKeySpecifier)[];
export type FormFieldPolicy = {
	archivedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	fields?: FieldPolicy<any> | FieldReadFunction<any>,
	handle?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	isArchived?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	respondentHelper?: FieldPolicy<any> | FieldReadFunction<any>,
	respondentLabel?: FieldPolicy<any> | FieldReadFunction<any>,
	responses?: FieldPolicy<any> | FieldReadFunction<any>,
	responsesCount?: FieldPolicy<any> | FieldReadFunction<any>,
	updatedAt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FormFieldKeySpecifier = ('input' | 'question' | FormFieldKeySpecifier)[];
export type FormFieldFieldPolicy = {
	input?: FieldPolicy<any> | FieldReadFunction<any>,
	question?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FormFieldInputConfigKeySpecifier = ('multipleChoice' | 'singleChoice' | 'text' | FormFieldInputConfigKeySpecifier)[];
export type FormFieldInputConfigFieldPolicy = {
	multipleChoice?: FieldPolicy<any> | FieldReadFunction<any>,
	singleChoice?: FieldPolicy<any> | FieldReadFunction<any>,
	text?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FormFieldMultipleChoiceInputConfigKeySpecifier = ('options' | FormFieldMultipleChoiceInputConfigKeySpecifier)[];
export type FormFieldMultipleChoiceInputConfigFieldPolicy = {
	options?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FormFieldSingleChoiceInputConfigKeySpecifier = ('options' | FormFieldSingleChoiceInputConfigKeySpecifier)[];
export type FormFieldSingleChoiceInputConfigFieldPolicy = {
	options?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FormResponseKeySpecifier = ('createdAt' | 'fields' | 'id' | 'respondent' | 'updatedAt' | FormResponseKeySpecifier)[];
export type FormResponseFieldPolicy = {
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	fields?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	respondent?: FieldPolicy<any> | FieldReadFunction<any>,
	updatedAt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FormResponseFieldKeySpecifier = ('multipleChoice' | 'singleChoice' | 'text' | FormResponseFieldKeySpecifier)[];
export type FormResponseFieldFieldPolicy = {
	multipleChoice?: FieldPolicy<any> | FieldReadFunction<any>,
	singleChoice?: FieldPolicy<any> | FieldReadFunction<any>,
	text?: FieldPolicy<any> | FieldReadFunction<any>
};
export type HeartRateKeySpecifier = ('createdAt' | 'id' | 'measurement' | 'timestamp' | 'updatedAt' | HeartRateKeySpecifier)[];
export type HeartRateFieldPolicy = {
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	measurement?: FieldPolicy<any> | FieldReadFunction<any>,
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>,
	updatedAt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KnowledgeEntryKeySpecifier = ('id' | 'links' | 'names' | 'tags' | KnowledgeEntryKeySpecifier)[];
export type KnowledgeEntryFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	links?: FieldPolicy<any> | FieldReadFunction<any>,
	names?: FieldPolicy<any> | FieldReadFunction<any>,
	tags?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KnowledgeEntryLinksKeySpecifier = ('incoming' | 'outgoing' | KnowledgeEntryLinksKeySpecifier)[];
export type KnowledgeEntryLinksFieldPolicy = {
	incoming?: FieldPolicy<any> | FieldReadFunction<any>,
	outgoing?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LyricLineKeySpecifier = ('position' | 'text' | LyricLineKeySpecifier)[];
export type LyricLineFieldPolicy = {
	position?: FieldPolicy<any> | FieldReadFunction<any>,
	text?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LyricsKeySpecifier = ('lines' | LyricsKeySpecifier)[];
export type LyricsFieldPolicy = {
	lines?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicAlbumKeySpecifier = ('imageUrl' | 'name' | 'spotifyId' | 'spotifyUrl' | MusicAlbumKeySpecifier)[];
export type MusicAlbumFieldPolicy = {
	imageUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyId?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicArtistKeySpecifier = ('name' | 'spotifyId' | 'spotifyUrl' | MusicArtistKeySpecifier)[];
export type MusicArtistFieldPolicy = {
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyId?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicInfoKeySpecifier = ('isPlaying' | 'progress' | 'track' | MusicInfoKeySpecifier)[];
export type MusicInfoFieldPolicy = {
	isPlaying?: FieldPolicy<any> | FieldReadFunction<any>,
	progress?: FieldPolicy<any> | FieldReadFunction<any>,
	track?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MusicTrackKeySpecifier = ('album' | 'artists' | 'duration' | 'lyrics' | 'name' | 'spotifyId' | 'spotifyUrl' | MusicTrackKeySpecifier)[];
export type MusicTrackFieldPolicy = {
	album?: FieldPolicy<any> | FieldReadFunction<any>,
	artists?: FieldPolicy<any> | FieldReadFunction<any>,
	duration?: FieldPolicy<any> | FieldReadFunction<any>,
	lyrics?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyId?: FieldPolicy<any> | FieldReadFunction<any>,
	spotifyUrl?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('archiveForm' | 'createForm' | 'deleteForm' | 'submitForm' | 'test' | 'testFailure' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	archiveForm?: FieldPolicy<any> | FieldReadFunction<any>,
	createForm?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteForm?: FieldPolicy<any> | FieldReadFunction<any>,
	submitForm?: FieldPolicy<any> | FieldReadFunction<any>,
	test?: FieldPolicy<any> | FieldReadFunction<any>,
	testFailure?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('buildInfo' | 'form' | 'formByHandle' | 'forms' | 'heartRate' | 'knowledgeEntries' | 'knowledgeEntry' | 'musicInfo' | 'test' | 'viewer' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	buildInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	form?: FieldPolicy<any> | FieldReadFunction<any>,
	formByHandle?: FieldPolicy<any> | FieldReadFunction<any>,
	forms?: FieldPolicy<any> | FieldReadFunction<any>,
	heartRate?: FieldPolicy<any> | FieldReadFunction<any>,
	knowledgeEntries?: FieldPolicy<any> | FieldReadFunction<any>,
	knowledgeEntry?: FieldPolicy<any> | FieldReadFunction<any>,
	musicInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	test?: FieldPolicy<any> | FieldReadFunction<any>,
	viewer?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubmitFormPayloadKeySpecifier = ('ok' | 'response' | SubmitFormPayloadKeySpecifier)[];
export type SubmitFormPayloadFieldPolicy = {
	ok?: FieldPolicy<any> | FieldReadFunction<any>,
	response?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscriptionKeySpecifier = ('test' | SubscriptionKeySpecifier)[];
export type SubscriptionFieldPolicy = {
	test?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TestPayloadKeySpecifier = ('ok' | 'value' | TestPayloadKeySpecifier)[];
export type TestPayloadFieldPolicy = {
	ok?: FieldPolicy<any> | FieldReadFunction<any>,
	value?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('email' | 'id' | 'isAdmin' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	isAdmin?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	ArchiveFormPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ArchiveFormPayloadKeySpecifier | (() => undefined | ArchiveFormPayloadKeySpecifier),
		fields?: ArchiveFormPayloadFieldPolicy,
	},
	BuildInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BuildInfoKeySpecifier | (() => undefined | BuildInfoKeySpecifier),
		fields?: BuildInfoFieldPolicy,
	},
	CreateFormPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateFormPayloadKeySpecifier | (() => undefined | CreateFormPayloadKeySpecifier),
		fields?: CreateFormPayloadFieldPolicy,
	},
	DeleteFormPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteFormPayloadKeySpecifier | (() => undefined | DeleteFormPayloadKeySpecifier),
		fields?: DeleteFormPayloadFieldPolicy,
	},
	Form?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FormKeySpecifier | (() => undefined | FormKeySpecifier),
		fields?: FormFieldPolicy,
	},
	FormField?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FormFieldKeySpecifier | (() => undefined | FormFieldKeySpecifier),
		fields?: FormFieldFieldPolicy,
	},
	FormFieldInputConfig?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FormFieldInputConfigKeySpecifier | (() => undefined | FormFieldInputConfigKeySpecifier),
		fields?: FormFieldInputConfigFieldPolicy,
	},
	FormFieldMultipleChoiceInputConfig?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FormFieldMultipleChoiceInputConfigKeySpecifier | (() => undefined | FormFieldMultipleChoiceInputConfigKeySpecifier),
		fields?: FormFieldMultipleChoiceInputConfigFieldPolicy,
	},
	FormFieldSingleChoiceInputConfig?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FormFieldSingleChoiceInputConfigKeySpecifier | (() => undefined | FormFieldSingleChoiceInputConfigKeySpecifier),
		fields?: FormFieldSingleChoiceInputConfigFieldPolicy,
	},
	FormResponse?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FormResponseKeySpecifier | (() => undefined | FormResponseKeySpecifier),
		fields?: FormResponseFieldPolicy,
	},
	FormResponseField?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FormResponseFieldKeySpecifier | (() => undefined | FormResponseFieldKeySpecifier),
		fields?: FormResponseFieldFieldPolicy,
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
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	SubmitFormPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubmitFormPayloadKeySpecifier | (() => undefined | SubmitFormPayloadKeySpecifier),
		fields?: SubmitFormPayloadFieldPolicy,
	},
	Subscription?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscriptionKeySpecifier | (() => undefined | SubscriptionKeySpecifier),
		fields?: SubscriptionFieldPolicy,
	},
	TestPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TestPayloadKeySpecifier | (() => undefined | TestPayloadKeySpecifier),
		fields?: TestPayloadFieldPolicy,
	},
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;