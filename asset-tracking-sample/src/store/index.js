import platformRequest from "../plugins/axios"
import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'

import {createLogger} from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    devices: [],
    carViewSelected: false,
    carRoutes: [],
    selectedCar: {},
    selectedDate: moment().startOf('day').valueOf(),
    drivers: [],
    projectUUID: ""
  },
  getters: {
    getCarBoolean: state => state.carViewSelected,
    carRoutes: state => state.carRoutes,
    selectedCar: state => state.selectedCar,
    selectedDate: state => state.selectedDate,
    drivers: state => state.drivers,
    projectUUID: state => state.projectUUID
  },
  mutations: {
    devices(state, devices){
      state.devices = devices
    },
    carViewSelected(state, carViewSelected){
      state.carViewSelected = carViewSelected
    },
    carRoutes(state, carRoutes){
      state.carRoutes = carRoutes
    },
    selectedCar(state, selectedCar){
      state.selectedCar = selectedCar
    },
    selectedDate(state, selectedDate){
      state.selectedDate = selectedDate
    },
    drivers(state, drivers){
      state.drivers = drivers
    },
    projectUUID(state, projectUUID){
      state.projectUUID = projectUUID
    }

  },
  actions: {
    async initStore(context) {
      const projectUUID = await platformRequest.get('/api/v1/twins?name=asset-tracking').then(({ data }) => data[0].UUID).catch(err => console.log(err))
      context.commit('projectUUID', projectUUID)
      var devices = await platformRequest.get(`/api/v1/devices?labels.Project=${projectUUID}`).then( ({data}) => data).catch(err => console.log(err))
      const Drivers = await platformRequest.get('/api/v1/twins?digitalTwinTypeName=Driver').then(({ data }) => data).catch(err => console.log(err))
      context.commit('drivers', Drivers)
      for(let index in devices.records){
        var query1 = {
          metrics: [
            {
              name: "davranetworks.event-gps",
              limit: 100000,
              tags: { UUID: devices.records[index].UUID, Project: projectUUID },
            },
          ],
          start_absolute: moment().startOf("day").valueOf(),
          end_absolute: moment().valueOf(),
        };
  
        var coordinatesArray = await platformRequest
          .post("/api/v2/timeseriesdata", query1)
          .then(({ data }) => {
            return data.queries[0].results[0].values.map(([timestamp, value]) => {
              var coordinates = JSON.parse(value);
              return [timestamp, [coordinates.longitude, coordinates.latitude]];
            });
          })
          .catch((err) => console.log(err));
          devices.records[index].pastDay = coordinatesArray
      }
      if(devices.records){
        context.commit('devices', devices.records)
      }
      var carViewSelected = false;
      context.commit('carViewSelected', carViewSelected)
    }
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})