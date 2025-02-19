/** Variants for the highlighted text. */
type TextVariant = 'primary' | 'secondary' | 'tertiary';

/** Props for the HighlightedText component. */
type HighlightedTextProps = {
  /** The search term to highlight. */
  searchTerm: string;
  /** The full text to display. */
  text: string;
  /** The component variant. */
  variant?: TextVariant;
};

export type { HighlightedTextProps, TextVariant };
