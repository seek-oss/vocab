import React from 'react';
import { useTranslations } from '@vocab/react';

import translations from './App.vocab';

export function App() {
  const { t } = useTranslations(translations);
  const message = `${t('hello')} ${t('world')}`;

  return <div id="message">{message}</div>;
}
