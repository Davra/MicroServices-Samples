<template>
    <v-card  dense outlined flat class="mx-auto active-border my-1" >
        <v-card-title class="pb-0"> {{car.name}}  <v-spacer></v-spacer> <v-btn outlined dense small text color="primary" @click="$emit('viewDetail')" >View Car</v-btn> </v-card-title>
        <v-card-actions>
        <v-list-item class="grow">
            <v-list-item-avatar color="grey darken-3">
            <v-img
                class="elevation-6"
                alt=""
                src="https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light"
            ></v-img>
            </v-list-item-avatar>

            <v-list-item-content style="flex-grow:2">
            <v-list-item-title >{{currentDriver}}</v-list-item-title>
            </v-list-item-content>

            <v-row
            align="center"
            justify="end"
            >
            <v-icon class="mr-1">
                mdi-timer
            </v-icon>
            <span class="subheading mr-2">Last Updated: >1 minute ago</span>
            </v-row>
        </v-list-item>
        </v-card-actions>
    </v-card>
</template>

<script>
import { mapGetters } from "vuex";
export default {
    name: "CarCard",
    props: ["car"],
    data: () => ({
    latestData: null,
    lastUpdated: null,
  }),

  computed:{
      ...mapGetters(["drivers"]),
      currentDriver(){
          const driver = this.drivers.find(twin => twin.UUID === this.car.labels.Driver)
          return driver.name
      }
  }

}
</script>


<style scoped>
    .active-border{
     border: var(--v-primary-base) 1px solid !important;
    }
</style>