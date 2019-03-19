<template>
  <div>
    <h1>{{programName}} Boatnet Hauls</h1>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BoatnetHaulsSettings } from '../models/BoatnetHaulsSettings';

@Component
export default class BoatnetHauls extends Vue {
  get programName() {
    // Computed Property
    return this.programInfo ? this.programInfo.name : '';
  }
  @Prop() public programInfo: BoatnetHaulsSettings | undefined;

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
