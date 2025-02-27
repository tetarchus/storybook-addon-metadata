import type { SimpleObject } from './base.types';
import type { API_HashEntry } from '@storybook/types';
import type { FunctionComponent as ReactFunctionComponent } from 'react';

/** Result of the UID generation function. */
type GeneratedUid = {
  /** ID of the component, generated by the addon. */
  componentId: string;
  /** Whether this is an alias for the component's name that may not be unique. */
  isAlias?: boolean;
  /** The specific prop names and values that the UID refers to (if any). */
  props: SimpleObject;
  /** The generated UID string. */
  uid: string;
};

/** A generated UID with additional information added. */
type DetailedUid = GeneratedUid & {
  /** The path to the story file for the component the UIDs are for. */
  storyFilePath: string | null;
  /** Story IDs that match the props for the UID. */
  storyIds: string[];
};

/** Map of UIDs. */
type Uids = Record<string, DetailedUid>;

/** Function that is used to generate UIDs from metadata values. */
type UidGeneratorFn<ComponentMetadata extends SimpleObject> = (
  metadata: ComponentMetadata | null,
  componentId: string,
) => GeneratedUid[];

/** An {@link API_HashEntry} from Storybook enhanced with uids. */
type UidStory = API_HashEntry & { uids: string[] };
/** A custom storybook index with added UIDs. */
type IndexedStories = Record<string, UidStory>;

/** Utility type for defining a React Function Component with additional metadata prop. */
type FunctionComponent<Props, ComponentMetadata> = ReactFunctionComponent<Props> & {
  /** Metadata about the component that can be used to generate UIDs. */
  metadata?: ComponentMetadata;
};

/**
 * Pre-defined type for defining a React Function Component with additional metadata prop.
 * Can be used instead of the {@link ReactFunctionComponent|FunctionComponent} or `FC` types
 * from 'react'.
 */
type FC<Props> = FunctionComponent<Props, SimpleObject>;

export type {
  DetailedUid,
  FC,
  FunctionComponent,
  GeneratedUid,
  IndexedStories,
  UidGeneratorFn,
  UidStory,
  Uids,
};
