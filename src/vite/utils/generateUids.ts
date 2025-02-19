import type { GeneratedUid, SimpleObject } from '@/types';

/**
 * Default function to use for generating UIDs from metadata. In most cases a user will
 * likely want to pass in their own.
 * @param metadata The component's metadata.
 * @returns An array of objects containing UIDs and the prop values they relate to.
 */
const defaultUidGenerator = <Metadata extends SimpleObject>(
  metadata: Metadata | null,
  componentId: string,
): GeneratedUid[] => {
  const uids: GeneratedUid[] = [];
  if (!metadata) return uids;

  let uid = '';

  for (const [key, value] of Object.entries(metadata)) {
    uid += `${key}-${JSON.stringify(value)}`;
  }
  uids.push({ componentId, props: {}, uid });

  return uids;
};

export { defaultUidGenerator };
