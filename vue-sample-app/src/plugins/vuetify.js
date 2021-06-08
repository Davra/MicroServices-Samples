import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        background: '#cccccc',
        primary: '#4043AD',
        secondary: '#b0bec5',
        accent: '#8c9eff',
        error: '#b71c1c',
        white: '#ffffff'
      }
    }
  }
});
