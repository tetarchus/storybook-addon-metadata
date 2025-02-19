import type { Dispatch, SetStateAction } from 'react';

/** Props for the SearchInput component. */
type SearchInputProps = {
  /** The search text. */
  search: string;
  /** Set state function for the search text. */
  setSearch: Dispatch<SetStateAction<string>>;
};

export type { SearchInputProps };
