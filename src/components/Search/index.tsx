import { SearchIcon } from '@storybook/icons';
import { useCallback, useEffect, useState } from 'react';

import { SearchInput } from '../SearchInput';
import { SearchResult } from '../SearchResult';
import { Heading, IconWrapper } from '../styled';
import { SearchResults, SearchWrapper } from './styled';

import type { SearchProps } from './prop.types';
import type { UidStory } from '@/types';
import type { FC } from 'react';

/** Search functional component including input and results. */
const Search: FC<SearchProps> = ({ handleSwitchStory, tree }: SearchProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UidStory[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const filterResults = useCallback(() => {
    const filtered = tree?.getFilteredItems(search) ?? [];

    setResults(filtered);
  }, [search, tree]);

  const handleMouseEnter = useCallback((key: string) => {
    setSelected(key);
  }, []);

  useEffect(() => {
    filterResults();
  }, [filterResults, search]);

  return (
    <SearchWrapper>
      <Heading>
        <IconWrapper>
          <SearchIcon />
        </IconWrapper>
        Search
      </Heading>
      <SearchInput search={search} setSearch={setSearch} />
      <SearchResults>
        {results.map((result, index) => (
          <SearchResult
            handleSwitchStory={handleSwitchStory}
            item={result}
            key={result.id}
            last={index === results.length - 1}
            onMouseEnter={handleMouseEnter}
            searchTerm={search}
            selected={selected === result.id}
          />
        ))}
      </SearchResults>
    </SearchWrapper>
  );
};

export { Search };
