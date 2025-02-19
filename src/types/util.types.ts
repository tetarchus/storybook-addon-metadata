/** Defines a type as being optional, as well as accepting null/undefined. */
type Optional<T> = { [P in keyof T]?: T[P] | null | undefined };

/** Alias for the return values of the `typeof` keyword. */
type Typeof =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined';

export type { Optional, Typeof };
