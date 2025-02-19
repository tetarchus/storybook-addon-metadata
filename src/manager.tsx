import { addons, types } from 'storybook/internal/manager-api';

import { Tab } from '@/components';
import { ADDON_ID, TAB_ID, TAB_TITLE } from '@/constants';

// Register the addon
addons.register(ADDON_ID, () => {
  addons.add(TAB_ID, {
    type: types.TAB,
    title: TAB_TITLE,
    render: ({ active = false }) => <Tab active={active} />,
  });
});
