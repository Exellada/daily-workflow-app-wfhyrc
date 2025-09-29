
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { ru } from './ru';

const i18n = new I18n({
  ru,
});

i18n.defaultLocale = 'ru';
i18n.locale = 'ru';
i18n.enableFallback = true;

export default i18n;
