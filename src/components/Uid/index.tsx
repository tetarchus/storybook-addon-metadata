import { useStorybookApi } from 'storybook/internal/manager-api';

import { SubHeading } from '../styled';
import {
  Prop,
  Props,
  PropTitle,
  PropValue,
  Stories,
  StoryLink,
  Text,
  UidTitle,
  UidWrapper,
} from './styled';

import type { UidProps } from './prop.types';
import type { FC } from 'react';

const Uid: FC<UidProps> = ({ handleSwitchStory, props = {}, stories = [], uid }: UidProps) => {
  const api = useStorybookApi();

  return (
    <UidWrapper>
      <UidTitle>{uid}</UidTitle>
      <Props>
        <SubHeading>Required Prop Values</SubHeading>
        {Object.keys(props).length > 0 ? (
          Object.entries(props).map(([prop, value]) => (
            <Prop key={prop}>
              <PropTitle>{`${prop}:`}</PropTitle>
              <PropValue>{String(value)}</PropValue>
            </Prop>
          ))
        ) : (
          <Text>No Required Props</Text>
        )}
      </Props>
      <Stories>
        <SubHeading>Stories</SubHeading>
        {stories.length > 0 ? (
          stories.map(storyId => {
            const data = api.getData(storyId);

            return (
              <StoryLink key={storyId} onClick={() => handleSwitchStory(storyId)}>
                {`${data.name} (${data.title.split('/').join(' / ')})`}
              </StoryLink>
            );
          })
        ) : (
          <Text>No Matching Stories</Text>
        )}
      </Stories>
    </UidWrapper>
  );
};

export { Uid };
export type { UidProps } from './prop.types';
