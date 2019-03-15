<template>
  <q-page padding>
    <div>TODO: Trips</div>
  </q-page>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Point } from 'geojson';
import {
  WcgopTrip,
  WcgopTripTypeName,
  Port,
  PortTypeName,
  getNowDate,
  WcgopHaul,
  WcgopHaulTypeName,
  LocationEvent
} from '@boatnet/bn-models';

@Component
export default class Trips extends Vue {
  private exampleTrip: WcgopTrip;

  get currentProgram(): string | undefined {
    return this.exampleTrip ? this.exampleTrip.program : '-';
  }

  get currentTrip(): string {
    return this.exampleTrip ? JSON.stringify(this.exampleTrip) : '-';
  }

  constructor() {
    super();

    const examplePort: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: getNowDate(),
      portId: 'Some-Port',
      name: 'Test Port'
    };

    this.exampleTrip = {
      _id: 'fake-id-123',
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: getNowDate(),
      program: 'Catch Shares',
      departurePort: examplePort,
      departureDate: getNowDate(),
      returnPort: examplePort,
      returnDate: getNowDate(),
      // ... other data
      legacy: {
        stuff: [1, 3, 4],
        other: 'test'
      }
    };
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
