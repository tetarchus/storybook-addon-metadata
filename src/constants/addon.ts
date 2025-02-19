import { name, version } from 'package.json';

/** The name of the addon for use other IDs. */
const ADDON_ID = name;
/** The version of the plugin. */
const ADDON_VERSION = version;
/** The name of the plugin. */
const ADDON_TITLE = 'Component Metadata';

/** The unique ID of the tab. */
const TAB_ID = `${ADDON_ID}/tab`;
/** The title to show on the tab. */
const TAB_TITLE = 'Metadata';

export { ADDON_ID, ADDON_TITLE, ADDON_VERSION, TAB_ID, TAB_TITLE };
