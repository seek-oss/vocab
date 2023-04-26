import 'expect-puppeteer';

import jestConfig from './jest.config';

page.setDefaultTimeout(jestConfig.testTimeout);
