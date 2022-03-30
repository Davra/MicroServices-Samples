<template>
  <div class="map-wrapper">
    <l-map ref="myMap" :center="center" :zoom="zoom">
      <l-tile-layer
        :url="url"
        :attribution="attribution"
        :subdomains="subdomains"
      />
      <l-marker :lat-lng="carPosition" :icon="selectedIcon">
        <l-popup v-if="false"> </l-popup>
        <l-tooltip :options="{ interactive: true }"> {{currentDriver}}</l-tooltip>
      </l-marker>
      <l-polyline
        :lat-lngs="coordsArray"
        :weight="4"
        :color="$vuetify.theme.themes.dark.secondary"
      >
      </l-polyline>
    </l-map>
    <v-slider
      v-model="slider"
      class="align-center time-slider"
      :max="1440"
      :min="0"
      hide-details
    >
      <template v-slot:append>
        <v-text-field
          outlined
          :value="computedSlider"
          class="mt-0 pt-0"
          hide-details
          single-line
          readonly
          type="string"
          style="width: 100px"
        ></v-text-field>
      </template>
    </v-slider>
  </div>
</template>

<script>
// If you need to reference 'L', such as in 'L.icon', then be sure to
// explicitly import 'leaflet' into your component
import L from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LPolyline,
} from "vue2-leaflet";
import { latLng } from "leaflet";
import moment from "moment";
import { mapGetters } from "vuex";
export default {
  name: "RoutesMap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LPolyline,
  },
  data: () => ({
    url: "https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=AjIEsjv93PVefBOZhaV83CYUYyQHwCFYT3uEWoPjtWsq13qHugvx6zNzQ9bbXyiY",
    attribution: `&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>`,
    subdomains: ["server", "services"],
    center: latLng(53.3498, -6.2039),
    previousCoordinates: null,
    sliderTime: moment().startOf("day").valueOf(),
    zoom: 13,
    map: null,
    slider: 0,
    carIndex: 0,
    selectedIcon: L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z" /></svg>`,
      className: "live",
    }),
  }),
  mounted() {
    this.map = this.$refs.myMap.mapObject;
  },
  methods: {
    getLatLong(lat, long) {
      return latLng(lat, long);
    },
  },
  watch: {
    computedSlider() {
      this.sliderTime = moment(this.selectedDate)
        .startOf("day")
        .add(this.slider, "minutes")
        .valueOf();
    },
    selectedDate() {
      this.slider = 0;
    },
  },
  computed: {
    ...mapGetters({
      carRoutes: "carRoutes",
      selectedDate: "selectedDate",
      car: "selectedCar",
      drivers: "drivers"
    }),
    currentDriver(){
          const driver = this.drivers.find(twin => twin.UUID === this.car.labels.Driver)
          return driver.name
      },
    coordsArray() {
      return this.carRoutes.map((coord) => {
        return latLng(coord[1][1], coord[1][0]);
      });
    },
    computedSlider() {
      return moment(this.selectedDate)
        .startOf("day")
        .add(this.slider, "minutes")
        .format("hh:mm A");
    },
    carPosition() {
      let coord;
      var events = this.carRoutes.filter(
        (event) => event[0] <= this.sliderTime
      );
      if (events.length >= 1) {
        coord = events[events.length - 1][1];
        return latLng(coord[1], coord[0]);
      } else {
        if (this.carRoutes.length >= 1) {
          coord = this.carRoutes[0][1];
          return latLng(coord[1], coord[0]);
        }
        return latLng(this.car.latitude, this.car.longitude);
      }
    },
  },
};
// 1444  12
// 100
</script>

<style>
.map-wrapper {
  height: calc(100vh - 48px);
  width: 100%;
}
.live svg {
  fill: var(--v-primary-base);
  transform: translateX(-30%) translateY(-30%);
}
.time-slider {
  position: absolute;
  bottom: 20px;
  margin: auto;
  left: 0;
  right: 0;
  width: 90%;
  z-index: 11111;
  padding: 20px;
}
</style>
