import 'expect-puppeteer';

// Polyfil intl-locale to ensure full ICU has been loaded
import '@formatjs/intl-locale/polyfill';

jest.setTimeout(20000);
