import type { UidStory } from '@/types';

/** Props for the SearchResult component. */
type SearchResultProps = {
  // TODO:
  handleSwitchStory: (storyId: string, preventSwitch?: boolean) => void;
  /** The item being displayed. */
  item: UidStory;
  /** Whether this is the last result. */
  last?: boolean;
  /** Callback function for mouse enter. */
  onMouseEnter: (key: string) => void;
  /** The current search term. */
  searchTerm: string;
  /** Whether the item is currently selected. */
  selected?: boolean;
};

export type { SearchResultProps };
