import { createI18n } from 'vue-i18n'
import en from './locales/en'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en,
  },
})

export default i18n
