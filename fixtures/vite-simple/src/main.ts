/* eslint-disable no-console */
import translations from './.vocab';

translations.load('en').then(() => {
  console.log(translations.getLoadedMessages('fr', 'fr')?.hello.format());
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  Hello World
`;
