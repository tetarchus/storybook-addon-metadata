import { useEffect, useState } from 'react';
import { PiIdentificationBadgeBold } from 'react-icons/pi';
import { useStorybookApi } from 'storybook/internal/manager-api';

import { Heading } from '../styled';
import { Uid } from '../Uid';

import type { UidsProps } from './prop.types';
import type { DetailedUid } from '@/types';
import type { FC } from 'react';

const Uids: FC<UidsProps> = ({ handleSwitchStory, tree }: UidsProps) => {
  const api = useStorybookApi();
  const [storyUids, setStoryUids] = useState<DetailedUid[]>([]);
  const current = api.getCurrentStoryData();

  useEffect(() => {
    setStoryUids(tree?.getComponentUids(current?.importPath) ?? []);
  }, [current?.importPath, tree]);

  return (
    <div>
      <Heading>
        <PiIdentificationBadgeBold />
        Uids
      </Heading>
      {storyUids.length > 0 ? (
        storyUids.map(uid => (
          <Uid
            handleSwitchStory={handleSwitchStory}
            key={uid.uid}
            props={uid.props}
            stories={uid.storyIds}
            uid={uid.uid}
          />
        ))
      ) : (
        <div>No UIDs found</div>
      )}
    </div>
  );
};

export { Uids };
export type { UidsProps } from './prop.types';
