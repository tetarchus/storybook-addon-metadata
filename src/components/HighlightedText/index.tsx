import { useMemo } from 'react';

import { Search } from '@/classes';

import { Highlight, Text } from './styled';

import type { HighlightedTextProps } from './prop.types';
import type { FC } from 'react';

/** Text with a highlighted section. */
const HighlightedText: FC<HighlightedTextProps> = ({
  searchTerm,
  text,
  variant = 'primary',
}: HighlightedTextProps) => {
  const parts = useMemo(() => {
    const stringParts: Array<{ content: string; type: 'highlight' | 'standard' }> = [];
    const searchParts = Search.getSearchParts(searchTerm);
    const matches: Array<{ index: number; length: number }> = [];
    let startIndex = 0;

    // Get the indexes of the matches
    for (const part of searchParts) {
      const index = text.toLowerCase().indexOf(part.toLowerCase());
      const length = part.length;
      if (index > -1) {
        matches.push({ index, length });
      }
    }

    // Work through any matches and extract the text for each match
    if (matches.length === searchParts.length) {
      for (const match of matches) {
        const end = match.index + match.length;
        const before = text.substring(startIndex, match.index);
        const highlight = text.substring(match.index, end);
        startIndex = end;
        before.trim().length && stringParts.push({ content: before, type: 'standard' });
        highlight.trim().length && stringParts.push({ content: highlight, type: 'highlight' });
      }
      const remaining = text.substring(startIndex);
      stringParts.push({ content: remaining, type: 'standard' });
    } else {
      stringParts.push({ content: text, type: 'standard' });
    }

    return stringParts;
  }, [searchTerm, text]);

  return (
    <Text variant={variant}>
      {parts.map(part =>
        part.type === 'standard' ? (
          part.content
        ) : (
          <Highlight variant={variant}>{part.content}</Highlight>
        ),
      )}
    </Text>
  );
};

export { HighlightedText };
export type { HighlightedTextProps } from './prop.types';
