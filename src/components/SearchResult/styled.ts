import { styled } from '@storybook/theming';

/** Wrapper for the Icon/Name. */
const HeadingWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: var(--spacing-x-small);
`;

/** Button wrapper to allow click-to-navigate. */
const LinkButton = styled.button`
  align-items: flex-start;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xx-small);
  outline: none;
  padding: var(--spacing-x-small);
  width: 100%;
`;

/** Horizontal rule to separate results. */
const Rule = styled.hr`
  border-color: var(--color-border);
  border-style: none;
  border-top-style: solid;
  margin: 0;
  margin-block: 0;
  margin-inline: 0;
  width: 100%;
`;

/** Wrapper component containing a single search result. */
const SearchResultWrapper = styled.li`
  border-radius: var(--border-radius);

  &:hover,
  &[data-selected='true']:hover {
    background-color: var(--color-hover-secondary);
  }

  &[data-selected='true'] {
    var(--color-active-secondary);
  }
`;

/** Wrapper around the text elements of a Search Result. */
const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
`;

export { HeadingWrapper, LinkButton, Rule, SearchResultWrapper, TextWrapper };
