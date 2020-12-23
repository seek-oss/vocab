/* eslint-disable no-console */
const translations: Record<string, () => Promise<any>> = {
  A: () => import('./util-A'),
  B: () => import('./util-B'),
};

// @ts-expect-error
window.getChunk = (v: string) => {
  translations[v]().then((a) => {
    // @ts-expect-error
    window[`run${v}`] = a;
  });
};
