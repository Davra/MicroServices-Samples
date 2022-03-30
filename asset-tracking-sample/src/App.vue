<template>
  <v-app>
    <AppBar />
    
    <AppLeftDrawer/> 
    <v-main> 
      <RoutesMap v-if="carBoolean"/>
     <AppMap v-else-if="!carBoolean"/>
    </v-main>


      
  </v-app>
</template>

<script>
import AppBar from "./components/AppBar";
import AppLeftDrawer from "./components/AppLeftDrawer";
import AppMap from "./components/AppMap";
import RoutesMap from './components/RoutesMap.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: "App",
  components: {
    AppBar,
    AppLeftDrawer,
    AppMap,
    RoutesMap,
  },
  data: () => ({}),
  created(){
    this.initStore()
  },
  computed: {
    ...mapGetters({
      carBoolean: 'getCarBoolean',
      journeyBoolean: 'getJourneyBoolean'
    })
  },
  methods: {
    ...mapActions(['initStore'])
  },
};
</script>
