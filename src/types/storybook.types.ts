import type { Optional } from './util.types';
import type { CoreCommon_StorybookInfo } from '@storybook/types';
import type { getConfigInfo, getStoryTitle } from 'storybook/internal/common';
import type { StaticStory } from 'storybook/internal/csf-tools';
import type { Primitive, Simplify } from 'type-fest';
import type { ValueType } from './variable.types';

/** Fields in the parsed config that may or may not contain a value. */
type OptionalConfigFields = 'mainConfig' | 'managerConfig' | 'previewConfig';

/** The base StorybookConfig value containing all values. */
type BaseStorybookConfiguration = Simplify<
  CoreCommon_StorybookInfo &
    ReturnType<typeof getConfigInfo> & {
      storyTitleOptions: Omit<Parameters<typeof getStoryTitle>[0], 'storyFilePath'>;
    }
>;

/** The Storybook config returned by `getStorybookConfig`. */
type StorybookConfig = Omit<BaseStorybookConfiguration, OptionalConfigFields> &
  Optional<Pick<BaseStorybookConfiguration, OptionalConfigFields>> & {
    root: string;
  };

type ArgValue = {
  spreadOf?: ArgValue | string | null;
  type: ValueType;
  value: Primitive | Primitive[] | null;
};
interface ArgRecord {
  [key: string]: ArgValue | ArgRecord;
}

type StoryWithArgs = StaticStory & {
  args: ArgRecord;
};

/** Data from a story file when parsed by the vite plugin. */
type ParsedStoryFile = {
  /** The local alias that the component was imported as. */
  componentAlias: string | undefined;
  /** Path to the component used in the story file. */
  componentPath: string | null;
  /**
   * The name of the component. This is based on the export name and may not
   * actually be the displayName/expected name. That will be extracted later.
   */
  componentName: string | undefined;
  /** Regular expression or ID string array of stories to exclude. */
  excludeStories: RegExp | string[];
  /** Regular expression or ID string array of stories to include. */
  includeStories: RegExp | string[];
  /** The ID of the story meta. */
  id: string | undefined;
  /** Story data merged from the CSF and jiti parses. */
  stories: StoryWithArgs[];
  /** Path to the story file. */
  storyFilePath: string;
  /** Array of tags applied to the story. */
  tags: string[];
  /** The title of the story meta. */
  title: string | undefined;
  /** Whether the story file has been used in the tree generation. */
  used: boolean;
};

export type { ArgRecord, ArgValue, ParsedStoryFile, StorybookConfig, StoryWithArgs };
