import { styled } from '@storybook/theming';

const Props = styled.div`
  margin-top: var(--spacing-xx-small);
`;

const UidTitle = styled.h4`
  font-weight: bold;
`;

const UidWrapper = styled.div`
  border: var(--border-style);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-xx-small);
  padding: var(--spacing-xx-small);
`;

const Prop = styled.div`
  font-family: var(--font-mono);
  font-size: var(--font-size-small);
`;

const PropTitle = styled.span`
  font-weight: bold;
  margin-right: var(--spacing-x-small);
`;

const PropValue = styled.span``;

const StoryLink = styled.div`
  color: var(--color-secondary);
  cursor: pointer;
  font-size: var(--font-size-small);
`;

const Stories = styled.div`
  margin-top: var(--spacing-x-small);
`;

const Text = styled.div`
  font-size: var(--font-size-small);
`;

export { PropTitle, PropValue, Prop, Props, Stories, StoryLink, Text, UidTitle, UidWrapper };
