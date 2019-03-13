<template>
  <q-page padding>
    <p>Current program: {{ currentProgram }}</p>
    <p>Example Trip: {{ currentTrip }}</p>
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
export default class PageHome extends Vue {
  private exampleHaul: WcgopHaul;
  private exampleTrip: WcgopTrip;


  get currentProgram(): string | undefined {
    return this.exampleTrip ? this.exampleTrip.program : '-';
  }

  get currentTrip(): string {
    return this.exampleTrip ? JSON.stringify(this.exampleTrip) : '-';
  }

  get currentHaul(): string {
    return this.exampleHaul ? JSON.stringify(this.exampleHaul) : '-';
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

    const fakeLocation: LocationEvent = {
      location: {  // GeoJSON https://tools.ietf.org/html/rfc7946
        type: "Point",
        coordinates: [124.6, 10.1]
      },
      date: getNowDate()
    }
    const fakeLocation2: LocationEvent = {
      location: {
        type: "Point",
        coordinates: [122.6, 10.9]
      },
      date: getNowDate()
    }

    this.exampleHaul = {
      _id: 'fake-haul-123',
      type: WcgopHaulTypeName,
      createdBy: 'test',
      createdDate: getNowDate(),
      haulNum: 1,
      locations: [ fakeLocation, fakeLocation2 ]
      // ... other data
    }

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