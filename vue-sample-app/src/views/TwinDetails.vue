<template>
  <div class="twin-details">
    <v-breadcrumbs
      :items="breadcrumbItems"
    />
    <v-container>
      <v-row>
        <v-col
          cols="12"
          sm="6"
        >
          <v-card
            class="pa-2"
            outlined
            tile
          >
            <div class="block-title">
              <span>Twin Info</span>
            </div>
            <h3 class="device-title">{{twin.name}}</h3>
            <ul>
              <li>
                <span class="field-name">Description: </span>
                <span class="field-value">{{twin.description}}</span>
              </li>
              <li>
                <span class="field-name">UUID: </span>
                <span class="field-value">{{twin.UUID}}</span>
              </li>
            </ul>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          v-if="twin.labels && Object.keys(twin.labels).length"
        >
          <v-card
            class="pa-2"
            outlined
            tile
          >
            <div class="block-title">
              <span>Twin Labels</span>
            </div>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                <tr>
                  <th class="text-left">
                    Key
                  </th>
                  <th class="text-left">
                    Value
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="(item, key) in twin.labels"
                  :key="item.key"
                >
                  <td>{{ key }}</td>
                  <td>{{ item }}</td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          v-if="twin.customAttributes && Object.keys(twin.customAttributes).length"
        >
          <v-card
            class="pa-2"
            outlined
            tile
          >
            <div class="block-title">
              <span>Twin Custom Attributes</span>
            </div>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                <tr>
                  <th class="text-left">
                    Key
                  </th>
                  <th class="text-left">
                    Value
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="(item, key) in twin.customAttributes"
                  :key="item.key"
                >
                  <td>{{ key }}</td>
                  <td>{{ item }}</td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import {mapActions, mapState} from 'vuex'
import {FETCH_TWIN} from '@/store/modules/app/types'

export default {
  name: 'TwinDetails',
  mounted() {
    this.fetchTwin({UUID: this.$route.params.twinUUID})
  },
  computed: {
    ...mapState({
      twin: (state) => state.app.twin,
    }),
    breadcrumbItems() {
      return [
        {
          text: 'All twins',
          to: {name: 'devices'},
          disabled: false,
          exact: true
        },
        {
          text: (this.twin && this.twin.name) || '',
          disabled: true
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      fetchTwin: FETCH_TWIN,
    }),
  }
}
</script>
<style lang="scss" scoped>
.twin-details {
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
