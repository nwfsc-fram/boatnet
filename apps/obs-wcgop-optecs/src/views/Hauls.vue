<template>
  <q-page padding>
    <boatnet-hauls v-bind:program-info="WCGOPSettings"/>
  </q-page>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetHauls, { BoatnetHaulsSettings } from '@boatnet/bn-hauls';
import { WcgopHaul } from '@boatnet/bn-models';

// Vue.component(BoatnetHauls);

@Component({
  components: {
    'boatnet-hauls': BoatnetHauls
  }
})
export default class Hauls extends Vue {
  private WCGOPSettings: BoatnetHaulsSettings;

  private exampleHaul: WcgopHaul | null = null;


  // const fakeLocation: LocationEvent = {
  //     location: {
  //       // GeoJSON https://tools.ietf.org/html/rfc7946
  //       type: 'Point',
  //       coordinates: [124.6, 10.1]
  //     },
  //     date: getNowDate()
  //   };
  //   const fakeLocation2: LocationEvent = {
  //     location: {
  //       type: 'Point',
  //       coordinates: [122.6, 10.9]
  //     },
  //     date: getNowDate()
  //   };

  //   this.exampleHaul = {
  //     _id: 'fake-haul-123',
  //     type: WcgopHaulTypeName,
  //     createdBy: 'test',
  //     createdDate: getNowDate(),
  //     haulNum: 1,
  //     locations: [fakeLocation, fakeLocation2]
  //     // ... other data
  //   };


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
