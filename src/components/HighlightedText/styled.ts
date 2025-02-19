import { styled } from '@storybook/theming';

import type { TextVariant } from './prop.types';
import type { CSSProperties } from 'react';

/** Highlighted portion of text with a stand-out color. */
const Highlight = styled.span<{ variant: TextVariant }>`
  color: ${({ variant }): CSSProperties['color'] =>
    variant === 'primary' || variant === 'secondary'
      ? 'var(--color-primary)'
      : 'var(--color-secondary)'};
  font-weight: bold;
`;

/** Wrapper for all text with a default color. */
const Text = styled.div<{ variant: TextVariant }>`
  color: ${({ variant }): CSSProperties['color'] =>
    variant === 'primary' || variant === 'secondary'
      ? 'var(--color-text)'
      : 'var(--color-text-secondary)'};
  font-size: ${({ variant }): CSSProperties['fontSize'] =>
    variant === 'primary'
      ? 'var(--font-size-body)'
      : variant === 'secondary'
        ? 'var(--font-size-medium)'
        : 'var(--font-size-small)'};
  font-weight: normal;
  text-align: start;
`;

export { Highlight, Text };
