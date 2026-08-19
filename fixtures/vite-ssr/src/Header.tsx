import { useTranslations } from '@vocab/react';
import translations from './Header.vocab';

export const Header = () => {
  const { t } = useTranslations(translations);
  return <div>{t("I'm a header")}</div>;
};
