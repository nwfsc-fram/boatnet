<template>
  <q-page padding>
    <div class="text-h6">Trip #{{tripNum}} Details</div>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="start">
        <div class="text-h6">Trip Start</div>Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>

      <q-tab-panel name="end">
        <div class="text-h6">Trip End</div>Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
    <q-option-group
      v-model="tab"
      inline
      :options="[
          { label: '', value: 'start' },
          { label: '', value: 'end' },
        ]"
    />
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
  WcgopHaul,
  WcgopHaulTypeName,
  LocationEvent,
  Vessel
} from '@boatnet/bn-models';

import moment from 'moment';

@Component
export default class Trips extends Vue {
  @Prop({ default: 'start' }) public startTab!: string;
  @Prop(Number) private tripNum!: number; // Passed by router
  private wcgopTripData: any;
  private tab: string;
  constructor() {
    super();

    this.tab = this.startTab;
    const examplePort: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      portId: 'OXNARD-Port',
      name: 'Oxnard'
    };

    const examplePort2: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      portId: 'Townsend-Port',
      name: 'Port Townsend'
    };

    const exampleVessel: Vessel = {
      name: 'Sadie K'
    };

    const exampleTrip = {
      _id: '1',
      tripNum: 1,
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      program: 'Catch Shares',
      departurePort: examplePort,
      departureDate: moment().format(),
      returnPort: examplePort2,
      returnDate: moment()
        .add(1, 'days')
        .format(),
      vessel: exampleVessel,
      // ... other data
      legacy: {
        tripId: 123
      }
    };
    this.wcgopTripData = exampleTrip;
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
