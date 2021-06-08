<template>
  <v-navigation-drawer
        clipped
        app
  >
    <v-list
      nav
      dense
    >
      <v-list-item-group>
        <v-list-item :to="{name: link.path}" v-for="link of links" :key="link.target">
          <v-list-item-title>{{ link.name }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      links: [
        {
          path: 'devices',
          target: 'devices',
          name: 'Devices'
        },
        {
          path: 'charts',
          target: 'charts',
          name: 'Charts'
        }
      ]
    }
  },
  props: {
    msg: String
  }
}
</script>

<style scoped>
.sidebar {
  background-color: #5c91e3;
  min-height: 95vh;
  display: flex;
  flex-direction: column;
}
.link {
  color: white;
}
</style>
