import  './axios'
import Vue from 'vue'
import VueMoment from 'vue-moment'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_MAPS_API_KEY
  }
})

Vue.use(VueMoment)

