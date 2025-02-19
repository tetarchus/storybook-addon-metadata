import { useCallback, useEffect, useState } from 'react';
import { useStorybookApi, useStorybookState } from 'storybook/internal/manager-api';

import { UsageTree } from '@/classes';

import { Search } from '../Search';
import { Uids } from '../Uids';
import { Left, TabMain, TabWrapper } from './styled';

import type { TabProps } from './prop.types';
import type { FC } from 'react';

const hydratedTree = UsageTree.hydrate();

/** Custom Storybook Tab containing usage and metadata. */
const Tab: FC<TabProps> = ({ active }: TabProps) => {
  const [tree, setTree] = useState<UsageTree | null>(null);
  const [switchedStory, setSwitchedStory] = useState(false);

  const api = useStorybookApi();
  const storybookState = useStorybookState();
  const storiesIndex = storybookState?.index;

  useEffect(() => {
    tree?.generateUidStories(storiesIndex);
  }, [storiesIndex, tree]);

  const handleSwitchStory = useCallback(
    (storyId: string, preventSwitch: boolean = false) => {
      api.selectStory(storyId);

      if (!preventSwitch) {
        // Use state to defer click-hack until after the story has changed.
        setSwitchedStory(true);
      }
    },
    [api],
  );

  useEffect(() => {
    const resolveTree = async () => {
      setTree(await hydratedTree);
    };
    void resolveTree();
  }, [active]);

  useEffect(() => {
    if (switchedStory) {
      // Slight hack as the API doesn't allow changing tabs programmatically.
      // Remove the query param to prevent switching back, and click the
      // 'Canvas' button.
      // TODO: Need to look at whether the button text can be changed and how to
      // get the value of it if so...
      const queryParams = api.getUrlState().queryParams;
      delete queryParams['tab'];
      api.setQueryParams(queryParams);
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.innerText.includes('Canvas')) {
          button.click();
        }
      });
      // Reset the hack state
      setSwitchedStory(false);
    }
  }, [api, switchedStory]);

  return (
    <TabWrapper>
      <Left>
        <Search handleSwitchStory={handleSwitchStory} tree={tree} />
      </Left>
      <TabMain>
        <Uids handleSwitchStory={handleSwitchStory} tree={tree} />
      </TabMain>
    </TabWrapper>
  );
};

export { Tab };
export type { TabProps } from './prop.types';
