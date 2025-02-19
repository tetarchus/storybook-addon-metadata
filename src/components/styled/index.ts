import { styled } from '@storybook/theming';

import type { CSSProperties } from 'react';

/** Positioning element for icons. */
const IconWrapper = styled.div<{ interactive?: boolean }>`
  align-items: center;
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'auto')};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  min-width: var(--font-size-medium);
`;

/** Section heading. */
const Heading = styled.h2`
  align-items: center;
  display: flex;
  font-weight: bold;
  gap: var(--spacing-xx-small);
`;

const SubHeading = styled.h5`
  align-items: center;
  display: flex;
  font-weight: bold;
  gap: var(--spacing-xx-small);
`;

/** Basic UI button. */
const Button = styled.button<{ variant?: 'invisible' | 'primary' }>`
  align-items: center;
  background: none;
  background-color: ${({ variant }) =>
    variant === 'invisible' ? 'none' : 'var(--color-tertiary)'};
  border: none;
  border-radius: 0;
  border-right: ${({ variant }) =>
    variant === 'invisible' ? 'none' : '1px solid var(--color-border)'};
  color: ${({ variant }) =>
    variant === 'invisible' ? 'var(--color-text)' : 'var(--color-text-inverse)'};
  cursor: pointer;
  display: flex;
  font-family: var(--font-mono);
  font-size: var(--font-size-small);
  font-weight: bold;
  gap: var(--spacing-xx-small);
  justify-content: center;
  padding: ${({ variant }): CSSProperties['padding'] =>
    variant === 'invisible' ? '0' : 'var(--spacing-tiny) var(--spacing-xx-small)'};

  &.active {
    background-color: var(--color-secondary);
  }

  &:hover {
    background-color: ${({ variant }): CSSProperties['backgroundColor'] =>
      variant === 'invisible' ? 'none' : 'var(--color-secondary)'};
    opacity: 0.8;
  }

  &:disabled {
    cursor: default;
    opacity: 0.4;
  }

  &:first-child {
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }

  &:last-child {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    border-right: none;
  }
`;

export { Button, Heading, IconWrapper, SubHeading };
