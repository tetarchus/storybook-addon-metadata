import { styled } from '@storybook/theming';

import type { CSSProperties } from 'react';

/** Search input component. */
const Input = styled.input`
  appearance: none;
  background: transparent;
  border: none;
  box-sizing: border-box;
  color: inherit;
  flex-shrink: 1;
  font-family: inherit;
  font-size: var(--font-size-medium);
  height: var(--height-input);
  padding-left: var(--spacing-xx-small);
  padding-right: var(--spacing-x-small);
  transition: all 150ms;
  width: 100%;

  &:focus {
    outline: none;
  }
`;

/** Wrapper around the search input and icons. */
const InputWrapper = styled.div`
  align-items: center;
  background: ${({ theme }): CSSProperties['background'] => theme.input.background};
  border-color: ${({ theme }): CSSProperties['borderColor'] => theme.input.border};
  border-radius: ${({ theme }): number => theme.input.borderRadius}px;
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0 var(--spacing-x-small);
  position: relative;
  width: 100%;

  &:focus-within {
    border-color: var(--color-secondary);
  }
`;

export { Input, InputWrapper };
