/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi-svg'
import { en } from 'vuetify/locale'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: localStorage.getItem('locale') || 'en',
    fallback: 'en',
    messages: { en }
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#2E2E2E',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#e9b108',
          border: "#e4e4e4"
        },
      },
      dark: {
        colors: {
          primary: '#68529E',
          secondary: '#424242',
          accent: '#F9AF16',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#e9b108',
          border: "#e4e4e4"
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases
    },
    sets: {
      mdi,
    },
  }
})
