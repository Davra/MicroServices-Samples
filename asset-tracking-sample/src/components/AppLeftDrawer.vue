<template>
  <v-navigation-drawer app clipped flat outlined width="500">
    <template v-if="viewMode == 'list'">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6"> In motion </v-list-item-title>
          <v-list-item-subtitle v-for="device in devices" :key="device.UUID">
            <CarCard
              v-if="device.gpsLastSeen >= fiveMinutesAgo"
              :car="device"
              @viewDetail="viewDetailPage(device)"
            />
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6"> Stationary </v-list-item-title>
          <v-list-item-subtitle v-for="device in devices" :key="device.UUID">
            <StationaryCarCard
              v-if="device.gpsLastSeen < fiveMinutesAgo"
              :car="device"
              @viewDetail="viewDetailPage(device)"
            />
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
    <template v-if="viewMode == 'details'">
      <v-list-item dense class="px-1">
        <v-list-item-subtitle>
          <v-btn text small @click="viewListPage()" color="primary">
            Back</v-btn
          >
        </v-list-item-subtitle>
      </v-list-item>
      <v-card class="mx-auto" v-if="selectedDevice">
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title class="text-h5">
              {{ selectedDevice.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-card-text>
          <v-row align="center">
            <v-col class="text-h3" cols="7">
              {{ numberWithCommas(parseInt(latestKM)) }}
              <br />
              Km
            </v-col>
            <v-col cols="5">
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-speedometer</v-icon>
                </v-list-item-icon>
                <v-list-item-subtitle
                  >{{ latestSpeed }} km/h</v-list-item-subtitle
                >
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-gas-station</v-icon>
                </v-list-item-icon>
                <v-list-item-subtitle>{{ latestGas }}%</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>

        <v-list-item>
          <div id="graphSpeed" style="height: 300px; width: 100%"></div>
        </v-list-item>
        <v-list-item>
          <div ref="graphGas"></div>
        </v-list-item>
        <v-divider></v-divider>
      </v-card>
    </template>
  </v-navigation-drawer>
</template>

<script>
import CarCard from "./CarCard";
import StationaryCarCard from "./StationaryCarCard.vue";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);

import { mapState, mapMutations, mapGetters } from "vuex";
import platformRequest from "../plugins/axios";
const moment = require("moment");

export default {
  name: "AppLeftDrawer",
  components: { CarCard, StationaryCarCard },
  data: () => ({
    viewMode: "list",
    graphSpeed: null,
    selectedDevice: null,
    selectedCarLatestData: null,
  }),
  beforeDestroy() {
    if (this.graphSpeed) {
      this.graphSpeed.dispose();
    }
  },
  mounted() {
    var self = this;
    am4core.ready(function () {
      self.updateGraph();
    }); // end am4core.ready()
  },
  computed: {
    ...mapState(["devices"]),
    ...mapGetters({
      currentDate: "selectedDate",
      projectUUID: "projectUUID",
    }),

    fiveMinutesAgo() {
      return moment().subtract(5, "minute").valueOf();
    },
    latestGas() {
      return this.selectedCarLatestData[0].latestMetrics.find(
        (metric) => metric.name === "assetTracking.gas"
      ).latestValue;
    },
    latestSpeed() {
      return this.selectedCarLatestData[0].latestMetrics.find(
        (metric) => metric.name === "assetTracking.speed"
      ).latestValue;
    },
    latestKM() {
      return this.selectedCarLatestData[0].latestMetrics.find(
        (metric) => metric.name === "assetTracking.totalkm"
      ).latestValue;
    },
  },
  watch: {
    async currentDate(newDate) {
      var speedData = await this.getSpeedData(newDate);

      this.$nextTick(function () {
        this.updateGraph(speedData);
      });
    },
  },
  methods: {
    ...mapMutations([
      "carViewSelected",
      "carRoutes",
      "selectedCar",
      "selectedDate",
    ]),
    async viewDetailPage(device) {
      this.selectedCarLatestData = await platformRequest
        .get(`/api/v1/iotdata/devices/counters/latest?q=${device.name}`)
        .then(({ data }) => data)
        .catch((err) => console.log(err));
      this.viewMode = "details";
      this.selectedDevice = device;
      this.selectedCar(device);
      var query = {
        metrics: [
          {
            name: "assetTracking.speed",
            limit: 10000,
            tags: { UUID: device.UUID },
            aggregators: [
              {
                name: "avg",
                align_sampling: true,
                sampling: {
                  value: "30",
                  unit: "minutes",
                },
              },
            ],
          },
        ],
        start_absolute: moment().startOf("day").valueOf(),
        end_absolute: moment().valueOf(),
      };

      var speedData = await platformRequest
        .post("/api/v2/timeseriesdata", query)
        .then(({ data }) => {
          return data.queries[0].results[0].values.map(([timestamp, value]) => {
            return { date: timestamp, speed: value };
          });
        })
        .catch((err) => console.log(err));

      var query1 = {
        metrics: [
          {
            name: "davranetworks.event-gps",
            limit: 100000,
            tags: { UUID: device.UUID, Project: this.projectUUID },
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
      this.carRoutes(coordinatesArray);

      this.$nextTick(function () {
        this.updateGraph(speedData);
      });
      this.carViewSelected(true);
    },

    viewListPage() {
      this.carViewSelected(false);
      this.selectedDate(moment().startOf("day").valueOf());
      this.viewMode = "list";
      this.selectedDevice = null;
    },

    async returnToDetailsPage() {
      this.viewMode = "details";
      this.carViewSelected(true);
      var speedData = await this.getSpeedData(this.currentDate);
      this.$nextTick(function () {
        this.updateGraph(speedData);
      });
    },
    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    async getSpeedData(date) {
      var query = {
        metrics: [
          {
            name: "assetTracking.speed",
            limit: 10000,
            tags: { UUID: this.selectedDevice.UUID },
            aggregators: [
              {
                name: "avg",
                align_sampling: true,
                sampling: {
                  value: "30",
                  unit: "minutes",
                },
              },
            ],
          },
        ],
        start_absolute: moment(date).startOf("day").valueOf(),
        end_absolute: moment(date).endOf("day").valueOf(),
      };

      var speedData = await platformRequest
        .post("/api/v2/timeseriesdata", query)
        .then(({ data }) => {
          return data.queries[0].results[0].values.map(([timestamp, value]) => {
            return { date: timestamp, speed: value };
          });
        })
        .catch((err) => console.log(err));

      return speedData;
    },
    updateGraph(speedData) {
      if (this.graphSpeed) {
        this.graphSpeed.dispose();
      }
      // Create chart instance
      var chart = am4core.create("graphSpeed", am4charts.XYChart);
      chart.numberFormatter.numberFormat = "#.";

      // Add data
      if (speedData !== undefined) {
        chart.data = speedData.slice(-50);
      }

      // Create axes
      var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.minGridDistance = 50;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.minGridDistance = 20;
      valueAxis.calculateTotals = true;

      // Create series
      var series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = "speed";
      series.dataFields.dateX = "date";
      series.tensionX = 0.8;
      series.strokeWidth = 3;
      series.stroke = am4core.color(this.$vuetify.theme.themes.dark.primary);
      series.tooltipText = "Speed: [bold]{valueY}km/h";

      var bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.fill = am4core.color("#fff");
      bullet.circle.strokeWidth = 3;

      // Add cursor
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.fullWidthLineX = true;
      chart.cursor.xAxis = dateAxis;
      chart.cursor.lineX.strokeWidth = 0;
      chart.cursor.lineX.fill = am4core.color("#000");
      chart.cursor.lineX.fillOpacity = 0.1;

      // Add a guide
      if (speedData !== undefined) {
        var speeds = [];
        for (let i = 0; i < speedData.length; i++) {
          speeds.push(speedData[i].speed);
        }
        var totalSpeed = speeds.reduce((a, b) => a + b, 0);

        let range = valueAxis.axisRanges.create();
        range.value = totalSpeed / speeds.length;
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeWidth = 1;
        range.grid.strokeOpacity = 1;
        range.grid.strokeDasharray = "3,3";
        range.label.inside = true;
        range.label.text = "Average";
        range.label.fill = range.grid.stroke;
        range.label.verticalCenter = "bottom";
      }

      this.graphSpeed = chart;
    },
  },
};
</script>