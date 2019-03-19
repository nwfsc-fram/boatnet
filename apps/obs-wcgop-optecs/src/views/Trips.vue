<template>
  <boatnet-trips v-bind:program-info="WCGOPSettings"/>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetTrips, { BoatnetTripsSettings } from '@boatnet/bn-common';

Vue.component(BoatnetTrips);

@Component
export default class Hauls extends Vue {
  private WCGOPSettings: BoatnetTripsSettings;

  constructor() {
    super();
    this.WCGOPSettings = { name: 'WCGOP' };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
