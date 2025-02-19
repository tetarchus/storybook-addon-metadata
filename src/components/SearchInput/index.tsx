import { CloseIcon, SearchIcon } from '@storybook/icons';
import { useCallback } from 'react';

import { IconWrapper } from '@/components/styled';

import { Input, InputWrapper } from './styled';

import type { SearchInputProps } from './prop.types';
import type { ChangeEvent, FC } from 'react';

/** Input component for component searching. */
const SearchInput: FC<SearchInputProps> = ({ search, setSearch }: SearchInputProps) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearch(e.currentTarget.value);
    },
    [setSearch],
  );

  const handleClear = useCallback(() => {
    setSearch('');
  }, [setSearch]);

  return (
    <InputWrapper>
      <IconWrapper>
        <SearchIcon />
      </IconWrapper>
      <Input onChange={handleChange} placeholder='Search' value={search} />
      <IconWrapper interactive>
        {search.length > 0 ? <CloseIcon onClick={handleClear} /> : null}
      </IconWrapper>
    </InputWrapper>
  );
};

export { SearchInput };
export type { SearchInputProps } from './prop.types';
