import type { UsageTree } from '@/classes';

/** Props for the Search component. */
type SearchProps = {
  /** Function to switch to the selected story. */
  handleSwitchStory: (storyId: string, preventSwitch?: boolean) => void;
  /** The restored {@link UsageTree}. */
  tree: UsageTree | null;
};

export type { SearchProps };
