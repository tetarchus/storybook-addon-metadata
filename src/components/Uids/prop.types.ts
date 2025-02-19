import type { UsageTree } from '@/classes';

/** Props for the Uids component. */
type UidsProps = {
  /** Function to switch to a selected story. */
  handleSwitchStory: (storyId: string, preventSwitch?: boolean) => void;
  /** The restored usage tree. */
  tree: UsageTree | null;
};

export type { UidsProps };
