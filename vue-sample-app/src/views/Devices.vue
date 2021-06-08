<template>
  <div>
    <div class="text-h4 pb-2">Devices</div>
    <v-data-table
        :headers="deviceHeaders"
        :items="devices.records"
        :items-per-page="devicePagination.itemsPerPage"
        :server-items-length="devices.totalRecords"
        @pagination="paginateDevice"
        @click:row="onClickDevice"
        class="elevation-1"
    >
    </v-data-table>

    <div class="text-h4 pb-2 pt-4">Twins</div>
    <v-data-table
        :headers="twinsHeaders"
        :items="twins"
        hide-default-footer
        @click:row="onClickTwin"
        class="elevation-1"
    ></v-data-table>
  </div>
</template>
<script>
import {mapActions, mapState} from 'vuex'
import {FETCH_DEVICES, FETCH_TWINS} from '@/store/modules/app/types'

export default {
  name: 'Devices',
  mounted() {
    this.fetchDevices({})
    this.fetchTwins({})
  },
  data() {
    return {
      devicePagination: {
          itemsPerPage: 5,
          page: 0,
      },
      twinsPagination: {
        itemsPerPage: 5,
        page: 0,
      },
      deviceHeaders: [
        {text: 'UUID', value: 'UUID'},
        {text: 'Name', value: 'name'},
        {text: 'Serial Number', value: 'serialNumber'},
        {text: 'Device Type', value: 'deviceType'},
      ],
      twinsHeaders: [
        {text: 'UUID', value: 'UUID'},
        {text: 'Name', value: 'name'},
        {text: 'Device Type', value: 'deviceType'},
      ]
    }
  },
  computed: {
    ...mapState({
      devices: (state) => state.app.devices,
      twins: (state) => state.app.twins
    }),
  },
  methods: {
    ...mapActions({
      fetchDevices: FETCH_DEVICES,
      fetchTwins: FETCH_TWINS
    }),
    paginateDevice({itemsPerPage, page}) {
      this.devicePagination.itemsPerPage = itemsPerPage
      this.devicePagination.page = page

      const modifiedPage = page -1

      const modifiedItemsPerPage = itemsPerPage === -1 ? this.devices.totalRecords : itemsPerPage


      this.fetchDevices({start : modifiedPage * itemsPerPage, limit: page * modifiedItemsPerPage})
    },
    onClickDevice({UUID}) {
      this.$router.push(`devices/${UUID}`)
    },
    onClickTwin({UUID}) {
      this.$router.push(`twin/${UUID}`)
    }
  }
}
</script>
<style></style>
