<template>
  <q-page padding>
    <p>Current program: {{ currentProgram }}</p>
    <p>Example Trip: {{ currentTrip }}</p>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  WCGOPTrip,
  WCGOPTripTypeName,
  Port,
  PortTypeName,
  getNowDate
} from '@boatnet/bn-models';

@Component
export default class PageHome extends Vue {
  private example: WCGOPTrip;

  get currentProgram(): string | undefined {
    return this.example ? this.example.program : '-';
  }

  get currentTrip(): string {
    return this.example ? JSON.stringify(this.example) : '-';
  }

  constructor() {
    super();

    const examplePort: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: getNowDate(),
      name: 'Test Port'
    };

    this.example = {
      _id: 'fake-id-123',
      type: WCGOPTripTypeName,
      program: 'Catch Shares',
      createdBy: 'test',
      createdDate: getNowDate(),
      departurePort: examplePort,
      departureDate: getNowDate(),
      returnPort: examplePort,
      returnDate: getNowDate(),
      legacy: {
        stuff: [1, 3, 4],
        other: 'test'
      }
    };
  }
}
</script>