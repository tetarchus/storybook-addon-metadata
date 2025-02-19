// import type { PropsExtractor } from 'storybook/internal/docs-tools';

import type { SimpleObject } from '@/types';

type UidProps = {
  // TODO:
  handleSwitchStory: (storyId: string, preventSwitch?: boolean) => void;
  props: SimpleObject | undefined;
  stories: string[];
  uid: string;
};

export type { UidProps };
