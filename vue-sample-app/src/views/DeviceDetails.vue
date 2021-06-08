<template>
  <div class="device-details" v-if='device'>
    <v-breadcrumbs
      :items="breadcrumbItems"
    />
    <v-container>
      <v-row>
        <v-col
          cols="12"
          sm="5"
        >
          <v-card
            class="pa-2"
            outlined
            tile
          >
            <div class="block-title">
              <span>Device Info</span>
            </div>
            <h3 class="device-title">{{device.name}}</h3>
            <ul>
              <li>
                <span class="field-name">Description: </span>
                <span class="field-value">{{device.description}}</span>
              </li>
              <li>
                <span class="field-name">UUID: </span>
                <span class="field-value">{{device.UUID}}</span>
              </li>
              <li>
                <span class="field-name">Serial Number: </span>
                <span class="field-value">{{device.serialNumber}}</span>
              </li>
              <li>
                <span class="field-name">Device Type: </span>
                <span class="field-value">{{device.deviceType}}</span>
              </li>
              <li>
                <span class="field-name">Last Seen: </span>
                <span class="field-value">{{ $moment(device.lastSeen).format('YYYY-MM-DD hh:mm:ss') }}</span>
              </li>
              <li>
                <span class="field-name">Owner: </span>
                <span class="field-value">{{ device.owner }}</span>
              </li>
              <li>
                <span class="field-name">Last Modified: </span>
                <span class="field-value">{{ $moment(device.modifiedTime).format('YYYY-MM-DD')}}</span>
              </li>
              <li>
                <span class="field-name">Location: </span>
                <span class="field-value"></span>
              </li>
            </ul>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="7"
        >
          <v-card class="pa-2"
                  outlined
                  tile>
            <div class="block-title">
              <span>Device Location</span>
            </div>
            <GmapMap
              :center="{lat:10, lng:10}"
              :zoom="7"
              map-type-id="terrain"
              style="width: 100%; height: 300px"
            >
              <GmapMarker
                :position="{lat:10, lng:10}"
                :clickable="true"
                :draggable="true"
                @click="center=m.position"
              />
            </GmapMap>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if='latestMetrics'>
        <v-col>
          <v-data-table
            :headers="metricsHeaders"
            :items="latestMetrics"
            class="elevation-1"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import {mapActions, mapState} from 'vuex'
import {FETCH_DEVICE} from '@/store/modules/app/types'

export default {
  name: 'DeviceDetails',
  mounted() {
    this.fetchDevice({UUID: this.$route.params.deviceUUID})
  },
  data() {
    return {
      metricsHeaders: [
        {text: 'Latest Value', value: 'latestValue'},
        {text: 'Name', value: 'name'},
        {text: 'Last Updated', value: 'lastUpdated'},
      ]
    }
  },
  computed: {
    ...mapState({
      device: (state) => state.app.device.device,
      latestMetrics: (state) => state.app.device.latestMetrics,
    }),
    breadcrumbItems() {
      return [
        {
          text: 'All devices',
          to: {name: 'devices'},
          disabled: false,
          exact: true
        },
        {
          text: (this.device && this.device.name) || '',
          disabled: true
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      fetchDevice: FETCH_DEVICE,
    }),
  }
}
</script>
<style lang="scss" scoped>
.device-details {
  .block-title {
    padding: 6px 0 8px;
    border-bottom: thin solid rgba(0, 0, 0, 0.12);
    margin-bottom: 16px;
    font-weight: 500;
  }
  ul {
    list-style-type: none;
    padding-left: 0;
    .field-name {
      font-weight: bolder;
      font-size: 14px;
    }
    .field-value {
      font-size: 14px;
    }
  }
}
</style>
