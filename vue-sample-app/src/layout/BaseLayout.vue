<template>
  <v-app>
    <Navbar />
    <Sidebar />
    <v-main>
      <v-container >
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default {
  name: 'BaseLayout',

  components: {
    Sidebar,
    Navbar
  },

  data: () => ({
    //
  }),
};
</script>
