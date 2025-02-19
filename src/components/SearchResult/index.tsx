import { BookmarkHollowIcon, ComponentIcon, DocumentIcon, FolderIcon } from '@storybook/icons';
import { useTheme } from '@storybook/theming';
import { useMemo } from 'react';

import { HighlightedText } from '../HighlightedText';
import { IconWrapper } from '../styled';

import { HeadingWrapper, LinkButton, Rule, SearchResultWrapper, TextWrapper } from './styled';

import type { SearchResultProps } from './prop.types';
import type { FC } from 'react';

/** Result entry in the list of filtered search results. */
const SearchResult: FC<SearchResultProps> = ({
  handleSwitchStory,
  item,
  last = false,
  onMouseEnter: handleMouseEnter,
  searchTerm,
  selected = false,
}: SearchResultProps) => {
  const theme = useTheme();

  const [color, Icon] = useMemo(() => {
    switch (item.type) {
      case 'component':
        return [theme.color.secondary, ComponentIcon];
      case 'docs':
        return [theme.color.gold, DocumentIcon];
      case 'group':
        return [theme.color.ultraviolet, FolderIcon];
      case 'story':
        return [theme.color.seafoam, BookmarkHollowIcon];
      default:
        return [null, null];
    }
  }, [
    item.type,
    theme.color.gold,
    theme.color.seafoam,
    theme.color.secondary,
    theme.color.ultraviolet,
  ]);

  // const handleResultClick = useCallback(() => {
  //   if (item.type === 'component' || item.type === 'story') {
  //     api.selectStory(item.id);
  //   } else if (item.type === 'docs') {
  //     api.selectStory(item.id, item.name, { viewMode: 'docs' });
  //   }
  //   // Use state to defer click-hack until after the story has changed.
  //   setSwitched(true);
  // }, [api, item]);

  // useEffect(() => {
  //   if (switched) {
  //     // Slight hack as the API doesn't allow changing tabs programmatically.
  //     // Remove the query param to prevent switching back, and click the
  //     // 'Canvas' button.
  //     // TODO: Need to look at whether the button text can be changed and how to
  //     // get the value of it if so...
  //     const queryParams = api.getUrlState().queryParams;
  //     delete queryParams['tab'];
  //     api.setQueryParams(queryParams);
  //     const buttons = document.querySelectorAll('button');
  //     buttons.forEach(button => {
  //       if (button.innerText.includes('Canvas')) {
  //         button.click();
  //       }
  //     });
  //     // Reset the hack state
  //     setSwitched(false);
  //   }
  // }, [api, switched]);

  return (
    <SearchResultWrapper
      className='sidebar-item'
      data-nodetype={item.type}
      data-selected={selected}
      onMouseEnter={() => handleMouseEnter(item.id)}
    >
      <LinkButton onClick={() => handleSwitchStory(item.id)}>
        <HeadingWrapper>
          {!!Icon && (
            <IconWrapper>
              <Icon color={color} />
            </IconWrapper>
          )}

          <HighlightedText searchTerm={searchTerm} text={item.name} />
        </HeadingWrapper>
        <HighlightedText searchTerm={searchTerm} text={item.id} variant='tertiary' />
        <TextWrapper>
          {item.uids.map(uid => (
            <HighlightedText searchTerm={searchTerm} text={`- ${uid}`} variant='secondary' />
          ))}
        </TextWrapper>
      </LinkButton>
      {!last && <Rule />}
    </SearchResultWrapper>
  );
};

export { SearchResult };
export type { SearchResultProps } from './prop.types';
