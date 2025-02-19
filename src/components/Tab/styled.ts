import { styled } from '@storybook/theming';

import type { CSSProperties } from 'react';

/** Wrapper for the left content sidebar. */
const Left = styled.div`
  flex-grow: 0;
  flex-shrink: 1;
  min-width: 30%;
`;

/** Wrapper for the main content. */
const TabMain = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 1;
  min-width: 0;
  height: 100%;
  width: 100%;
`;

/** Wrapper for the entire tab, determining layout, and providing CSS variables. */
const TabWrapper = styled.div`
  // Borders
  --border-style: 1px solid ${({ theme }): CSSProperties['color'] => theme.appBorderColor};
  --border-radius: ${({ theme }): number => theme.appBorderRadius}px;

  // Colors
  --color-background: ${({ theme }): CSSProperties['backgroundColor'] => theme.background.content};
  --color-border: ${({ theme }): CSSProperties['backgroundColor'] => theme.appBorderColor};
  --color-primary: ${({ theme }): CSSProperties['backgroundColor'] => theme.color.primary};
  --color-secondary: ${({ theme }): CSSProperties['backgroundColor'] => theme.color.secondary};
  --color-sidebar: ${({ theme }): CSSProperties['backgroundColor'] => theme.background.app};
  --color-hover-secondary: ${({ theme }): CSSProperties['backgroundColor'] =>
    theme.color.secondary}12;
  --color-active-secondary: ${({ theme }): CSSProperties['backgroundColor'] =>
    theme.color.secondary}1A;
  --color-tet: ${({ theme }): CSSProperties['backgroundColor'] => theme.color.tertiary};
  --color-tertiary: ${({ theme }): CSSProperties['backgroundColor'] => theme.color.tertiary};
  --color-parent: ${({ theme }): CSSProperties['backgroundColor'] => theme.color.negative};
  --color-child: ${({ theme }): CSSProperties['backgroundColor'] => theme.color.positive};
  --color-shadow: ${({ theme }): CSSProperties['color'] => theme.color.inverseText}1A;
  --color-text: ${({ theme }): CSSProperties['color'] => theme.color.defaultText};
  --color-text-inverse: ${({ theme }): CSSProperties['color'] => theme.color.inverseText};
  --color-text-secondary: ${({ theme }): CSSProperties['color'] => theme.color.defaultText};

  // Fonts
  --font-base: ${({ theme }): CSSProperties['fontFamily'] => theme.typography.fonts.base};
  --font-mono: ${({ theme }): CSSProperties['fontFamily'] => theme.typography.fonts.mono};

  // Font Sizes
  --font-size-heading: ${({ theme }) => theme.typography.size.m2}px; // 24px
  --font-size-body: ${({ theme }): number => theme.typography.size.s3}px; // 16px
  --font-size-medium: ${({ theme }): number => theme.typography.size.s2}px; // 14px
  --font-size-small: ${({ theme }): number => theme.typography.size.s1}px; // 12px
  --font-size-tiny: 0.5rem;

  // Sizes
  --height-input: 1.75rem; // 28px
  --width-node: 16rem; // 256px

  // Spacing
  --spacing-x-large: 2rem; // 32px
  --spacing-large: 1.5rem; // 24px
  --spacing-medium: 1rem; // 16px
  --spacing-small: 0.75rem; // 12px
  --spacing-x-small: 0.5em; // 8px
  --spacing-xx-small: 0.25rem; // 4px
  --spacing-tiny: 0.125rem; // 2px;

  background: var(--color-background);
  box-sizing: border-box;
  color: var(--color-text);
  display: flex;
  font-family: var(--font-base);
  gap: var(--spacing-medium);
  height: 100%;
  max-height: 100%;
  min-height: 100%;
  padding: var(--spacing-x-large) var(--spacing-medium);
  width: 100%;
`;

export { Left, TabMain, TabWrapper };
