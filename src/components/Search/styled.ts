import { styled } from '@storybook/theming';

/** List wrapper for search results. */
const SearchResults = styled.ul`
  background-color: var(--color-sidebar);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: fit-content;
  margin-block-start: 0;
  margin-block-end: 0;
  max-height: 100%;
  overflow-y: auto;
  padding-inline-start: 0;
`;

/** Wrapper around the search input and results. */
const SearchWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  max-width: 100%;
  height: 100%;
`;

export { SearchResults, SearchWrapper };
