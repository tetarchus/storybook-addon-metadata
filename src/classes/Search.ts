import { filterFalsy } from '@tetarchus/utils';

import { DEVELOPMENT_MODE } from '@/config';
import { logger } from '@/utils';

import type {
  IndexedStories,
  Logger,
  ParentIndexEntry,
  SearchOptions,
  UidIndexEntryTuple,
  UidStory,
} from '@/types';
import type { UsageTree } from './UsageTree';
import type { API_HashEntry, API_IndexHash } from '@storybook/types';

/** Controller for handling search functionality. */
class Search {
  //===================================
  //== Private Readonly Properties
  //===================================
  /** Custom logger instance. */
  readonly #log: Logger;
  /** Tree that this belongs to. */
  readonly #tree: UsageTree;

  //===================================
  //== Private Properties
  //===================================
  /** Custom index including UIDs. */
  #index: IndexedStories;

  //===================================
  //== Constructor
  //===================================
  constructor({ tree }: SearchOptions) {
    this.#log = logger(DEVELOPMENT_MODE, 'search');
    this.#tree = tree;
    this.#index = {};
    this.#log.verbose('Search initialized.');
  }

  //===================================
  //== Private Static Methods
  //===================================
  /**
   * Finds the parent component and docs entry for a given story entry.
   * @param story The {@link API_HashEntry} for the current entry.
   * @param stories An array, converted from the original {@link API_IndexHash}.
   * @param existingComponentEntries An array of `component` entries that have
   * already been updated.
   * @param existingDocsEntries An array of `docs` entries that have already
   * been updated.
   * @returns An object containing the component and docs entry for the given
   * story, as well as their index in the existing arrays if they've already
   * been added.
   */
  static #getParentComponent(
    story: API_HashEntry,
    stories: [string, API_HashEntry][],
    existingComponentEntries: UidIndexEntryTuple[],
    existingDocsEntries: UidIndexEntryTuple[],
  ): ParentIndexEntry {
    if (story.type === 'story') {
      // Find the data for the parent and docs entries for a story.
      const parentId = story.parent;
      const parentEntry = stories.find(([key]) => key === parentId) ?? null;
      const docsEntry =
        stories.find(([, data]) => data.type === 'docs' && data.parent === parentId) ?? null;

      // Get the indexes for existing entries
      const componentExists = existingComponentEntries.findIndex(([key]) => key === parentId);
      const docsExists = existingDocsEntries.findIndex(([key]) => key === docsEntry?.[0]);

      return { component: parentEntry, componentExists, docs: docsEntry, docsExists };
    }
    return { component: null, componentExists: -1, docs: null, docsExists: -1 };
  }

  /**
   * Checks whether the `toMatch` string contains the `searchTerm`, accounting for
   * wildcard characters ('*').
   * @param searchTerm The search term string.
   * @param toMatch The string to match against.
   * @returns A boolean indicating whether the `toMatch` string contains the
   * search term.
   */
  static #matchWithWildCards(searchTerm: string, toMatch: string): boolean {
    const terms = Search.getSearchParts(searchTerm);
    return terms.every(term => toMatch.toLowerCase().includes(term));
  }

  /**
   * Array filter function to filter the story index.
   * @param param0 Tuple containing the destructured index entry.
   * @param param0[0] The Story ID key.
   * @param param0[1] The {@link UidStory} to check.
   * @param searchTerm The search term string.
   * @returns Filters the index by the search term.
   */
  static #searchTermFilter([key, value]: [string, UidStory], searchTerm: string): boolean {
    switch (value.type) {
      case 'root':
        // No need to include root labels?
        return false;
      case 'component':
      case 'group':
        // Components and groups don't have their own data, but should be
        // displayed if a child matches.
        // Return it for now, and once we've filtered for matches we re-filter
        // to remove entries with no children remaining in the filters.
        return (
          // value.children.length > 0 ||
          Search.#matchWithWildCards(searchTerm, key) ||
          Search.#matchWithWildCards(searchTerm, value.name) ||
          Search.#uidsInclude(value.uids, searchTerm)
        );
      case 'docs':
      case 'story': {
        // This is what we actually want
        return (
          Search.#matchWithWildCards(searchTerm, key) ||
          Search.#matchWithWildCards(searchTerm, value.name) ||
          Search.#matchWithWildCards(searchTerm, value.title) ||
          Search.#uidsInclude(value.uids, searchTerm)
        );
      }
      default:
        console.warn(`Unrecognised index type: ${value['type']}`);
        return false;
    }
  }

  /**
   * Checks whether the search term matches any of the UIDs.
   * @param uids The array of UID strings to match.
   * @param searchTerm The current search term (in lowercase).
   * @returns A boolean if any of the UIDs in the array match the search term.
   */
  static #uidsInclude(uids: string[], searchTerm: string): boolean {
    for (const uid of uids) {
      if (Search.#matchWithWildCards(searchTerm, uid)) {
        return true;
      }
    }
    return false;
  }

  //===================================
  //== Public Static Methods
  //===================================
  /**
   * Splits a search term into sub-search terms on a wildcard character ('*').
   * @param searchTerm The search term that may contain a wildcard.
   * @returns An array of sub-search terms that can contain any characters between.
   */
  public static getSearchParts(searchTerm: string): string[] {
    return searchTerm.split('*').filter(filterFalsy);
  }

  //===================================
  //== Public Methods
  //===================================
  /**
   * Filters the full Storybook index down to those that match the search term.
   * @param search The search term.
   * @returns An array of filtered {@link UidStory|UidStories} to display.
   */
  public filterItems(search: string): UidStory[] {
    // Only want to return items if there's a search term
    if (!search) {
      return [];
    }

    // Lowercase the term as we don't care about casing.
    const searchTerm = search.toLowerCase();

    const filtered = Object.entries(this.#index)
      .filter(item => Search.#searchTermFilter(item, searchTerm))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, value]) => value);

    return filtered;
  }

  /**
   * Adds additional properties to the stories index to allow for UID searching.
   * @param storiesIndex The stories index returned from `storybookState.index`.
   * @returns A modified index with entries containing additional information
   * for UID generation.
   */
  public generateUidStories(storiesIndex: API_IndexHash | undefined = {}): IndexedStories {
    const finalEntries: UidIndexEntryTuple[] = [];
    const componentEntries: UidIndexEntryTuple[] = [];
    const docsEntries: UidIndexEntryTuple[] = [];
    const entries = Object.entries(storiesIndex);
    const uidEntries = Object.entries(this.#tree.uids);

    for (const [key, entry] of entries) {
      const { id, type } = entry;
      if (type === 'story') {
        const { importPath } = entry;
        const { component, componentExists, docs, docsExists } = Search.#getParentComponent(
          entry,
          entries,
          componentEntries,
          docsEntries,
        );

        const uids = uidEntries
          .filter(([, data]) => data.storyIds.includes(id))
          .map(([, uid]) => uid.uid);

        const existingComponent = componentEntries[componentExists];
        const existingDocs = componentEntries[docsExists];
        const componentUids = [
          ...uids,
          ...uidEntries
            .filter(([, data]) => this.#tree.toRelativePath(data.storyFilePath) === importPath)
            .map(([, uid]) => uid.uid),
        ];
        if (existingComponent) {
          existingComponent[1].uids.push(...componentUids);
        } else if (component) {
          componentEntries.push([component[0], { ...component[1], uids: componentUids }]);
        }

        if (existingDocs) {
          existingDocs[1].uids.push(...componentUids);
        } else if (docs) {
          // All docs usually have the same name ('Docs') - Change it to be more meaningful
          const docsName =
            docs[1].name === 'Docs' && component ? `${component[1].name} (Docs)` : docs[1].name;
          docsEntries.push([docs[0], { ...docs[1], name: docsName, uids: componentUids }]);
        }

        // Some stories will also have the same names, so make them easier to distinguish.
        let name = entry.name;
        if (entry.type === 'story' && component) {
          name = `${component[1].name} -- ${name}`;
        }
        finalEntries.push([key, { ...entry, name, uids }]);
      }
    }

    // Add components and docs
    finalEntries.push(...componentEntries);
    finalEntries.push(...docsEntries);
    // Remove duplicate values
    for (const [, entry] of finalEntries) {
      entry.uids = [...new Set(entry.uids)];
    }

    // Sort so components/docs come first
    finalEntries.sort((a, b) => {
      // Sort into root/group/component/docs/story
      if (a[1].type === 'root' && b[1].type !== 'root') {
        return -1;
      } else if (b[1].type === 'root' && a[1].type !== 'root') {
        return 1;
      }

      if (a[1].type === 'group' && b[1].type !== 'root' && b[1].type !== 'group') {
        return -1;
      } else if (b[1].type === 'group' && a[1].type !== 'root' && a[1].type !== 'group') {
        return 1;
      }

      if (
        a[1].type === 'component' &&
        b[1].type !== 'root' &&
        b[1].type !== 'group' &&
        b[1].type !== 'component'
      ) {
        return -1;
      } else if (
        b[1].type === 'component' &&
        a[1].type !== 'root' &&
        a[1].type !== 'group' &&
        a[1].type !== 'component'
      ) {
        return 1;
      }

      if (a[1].type === 'docs' && b[1].type === 'story') {
        return -1;
      } else if (b[1].type === 'docs' && a[1].type === 'story') {
        return -1;
      }

      return 0;
    });

    this.#index = Object.fromEntries(finalEntries);
    return this.#index;
  }
}

export { Search };
