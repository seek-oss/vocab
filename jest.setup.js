import 'expect-puppeteer';

// Polyfil intl-locale to ensure full ICU has been loaded
// https://nodejs.org/api/intl.html#intl_options_for_building_node_js
import '@formatjs/intl-locale/polyfill';

jest.setTimeout(20000);
