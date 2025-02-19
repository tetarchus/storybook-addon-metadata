/** Standard values that shouldn't change. */
const DEFAULTS = {
  /** Connector character for object access. */
  CONNECTOR: '.',
  /** Indent size for JSON.stringify. */
  INDENT_SIZE: 2,
  /** Connector character for optional object access. */
  OPTIONAL_CONNECTOR: '?.',
} as const;

/** Fallback values when a value is not provided. */
const FALLBACK = {
  ARG: '[[Missing Arg]]',
  /** Story title to use when no title can be extracted. */
  STORY_TITLE: '[[Missing Story Title]]',
  /** Storybook ID to use when none is provided. */
  STORYBOOK_ID: 'defaultStorybook',
  /** Fallback name to use for ThisKeyword. */
  THIS: '[this]',
} as const;

/** Values for Storybook. */
const STORYBOOK = {
  /** The short config flag for specifying the configuration directory. */
  CONFIG_FLAG: '-c',
  /** The long config option for specifying the configuration directory. */
  CONFIG_OPTION: '--config-dir',
  /** The default storybook configuration directory name. */
  DIR_NAME: '.storybook',
} as const;

export { DEFAULTS, FALLBACK, STORYBOOK };
