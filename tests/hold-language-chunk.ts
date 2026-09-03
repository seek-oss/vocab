import type { HTTPRequest, Page } from 'puppeteer';

/**
 * Hold every request for a language translations chunk until `release` is
 * called. `requested` settles when the app first asks for that chunk, which
 * is how we know a language switch has reached `load()`.
 */
export const holdLanguageChunk = async (page: Page, language: string) => {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });

  let markRequested = () => {};
  const requested = new Promise<void>((resolve) => {
    markRequested = resolve;
  });

  await page.setRequestInterception(true);

  page.on('request', (request: HTTPRequest) => {
    const continueRequest = () => {
      if (!request.isInterceptResolutionHandled()) {
        return request.continue();
      }
    };

    if (request.url().includes(`${language}-translations`)) {
      markRequested();
      released.then(continueRequest).catch(() => undefined);
      return;
    }

    continueRequest()?.catch(() => undefined);
  });

  return {
    requested,
    release: () => {
      release();
    },
  };
};
