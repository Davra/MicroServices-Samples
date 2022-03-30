<template lang="">
 <v-app-bar app clipped-left flat dark color="primary" dense>
      <v-app-bar-title dark>Asset Tracking</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-menu v-if="carBoolean" left bottom style="z-index:11111">
        <template v-slot:activator="{ on, attrs }">
            <v-btn-toggle
            rounded
            dense
            >
                <v-btn text @click="prevDay" color="primary" tile >
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn text color="primary" tile  v-bind="attrs" v-on="on">
                    {{formatedDate}}
                </v-btn>
                <v-btn text @click="nextDay"  color="primary" tile >
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </v-btn-toggle>
        </template>

        <v-date-picker
          v-model="date"
          no-title
          scrollable
          color="primary"
        >
          <v-spacer></v-spacer>
          <v-btn
            text
            color="primary"
            @click="menu = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="$refs.menu.save(date)"
          >
            OK
          </v-btn>
        </v-date-picker>
      </v-menu>
    </v-app-bar>
</template>

<script>
import moment from "moment";
import { mapGetters } from 'vuex';
import { mapMutations } from 'vuex'
import platformRequest from "../plugins/axios"

export default {
  name: "AppBar",
  data: () => ({
    menu: false,
    date: moment().format("YYYY-MM-DD"),
  }),
  watch: {
    async date(newDate){
      if(this.carBoolean){
      this.selectedDate(moment(newDate).startOf('day').valueOf())
      var query1 = {
        "metrics": [
          {
            "name": "davranetworks.event-gps",
            "limit": 100000,
            "tags":{"UUID": this.car.UUID,
                    "project": "demo-assetTracking",
            }
          }
        ],
        "start_absolute": moment(newDate).startOf('day').valueOf(),
        "end_absolute": moment(newDate).endOf('day').valueOf()
      }

  var coordinatesArray = await platformRequest.post('/api/v2/timeseriesdata', query1)
      .then(({ data }) => {
          return data.queries[0].results[0].values.map(([timestamp, value]) => {
            var coordinates = JSON.parse(value)
            return [ timestamp, [coordinates.longitude, coordinates.latitude] ];
          });
        })
      .catch(err => console.log(err))
      this.carRoutes(coordinatesArray)
      }
    },
    carBoolean(){
      if(this.carBoolean === false){
        this.date = moment().subtract(24, 'hours').format("YYYY-MM-DD")
      }
    }
  },
  computed: {
    ...mapGetters({
      carBoolean: 'getCarBoolean',
      car: 'selectedCar',
      currentDate: 'selectedDate' 
    }),
    formatedDate() {
      return moment(this.date).format("DD MMM YY");
    },
  },
  methods: {
    ...mapMutations([
       'carRoutes',
       'selectedDate'
    ]),
    nextDay() {
      this.date = moment(this.date).add(1, "day").format("YYYY-MM-DD");
    },
    prevDay() {
      this.date = moment(this.date).subtract(1, "day").format("YYYY-MM-DD");
    },
  },
};
</script>