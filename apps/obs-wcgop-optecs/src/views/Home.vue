<template>
  <q-page padding>
    <p>Current gear type: {{ currentGearType }}</p>
    <p>Example Haul: {{ currentHaul }}</p>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { WCGOPHaul, Port, getNowDate } from '@boatnet/bn-models';

@Component
export default class PageHome extends Vue {
  private example: WCGOPHaul;

  get currentGearType(): string {
    return this.example ? this.example.gearType : '-';
  }

  get currentHaul(): string {
    return this.example ? JSON.stringify(this.example) : '-';
  }

  constructor() {
    super();

    const examplePort: Port = {
      _id: 'asdf',
      type: 'port',
      created_by: 'test',
      created_date: getNowDate(),
      name: 'Some Test Port'
    };

    this.example = {
      _id: 'fake-id-123',
      type: 'wcgop-haul',
      created_by: 'test',
      created_date: '2019',
      gearType: 'Trawl',
      startPort: {
        port: examplePort,
        date: 'test'
      },
      endPort: {
        port: examplePort,
        date: 'test'
      },
      legacyData: {
        stuff: [1, 3, 4],
        other: 'test'
      }
    };
  }
}
</script>