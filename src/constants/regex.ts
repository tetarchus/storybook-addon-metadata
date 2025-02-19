const REGEX = {
  /** Regular expression for matching CRLF line-endings. */
  CRLF: /\r\n/gu,
  /** Regular expression for matching file system URLs. */
  FILE_PATH: /^file:\/\//u,
  /** Regular expression for matching non-alphanumeric characters. */
  NON_ALPHA: /[^A-Z0-9]*/giu,
  /** Regular expression for matching non-alphanumeric characters at the start of a string. */
  NON_ALPHA_START: /^[^A-Z]*/giu,
  /** Regular expression matching the semver caret(^) or tile(~) markers at the start of a version. */
  SEMVER: /^[\^~]/iu,
  /** Regular expression for matching path separators. */
  SEP: /[\\/]/gu,
  /** Regular expression for matching `undefined` in a type union. */
  UNDEFINED_TYPE: / ?\| ?undefined/gu,

  /** Common replacement values. */
  REPLACEMENTS: {
    /** Replace with an empty string. */
    EMPTY: '',
    /** Replace with a single newline. */
    NEWLINE: '\n',
  },
} as const;

export { REGEX };
