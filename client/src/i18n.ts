import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

// Initialize i18n with the backend and language detector
i18n
    .use(backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: true,
        
        interpolation: {
            escapeValue: false
        },

        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
    })

export default i18n