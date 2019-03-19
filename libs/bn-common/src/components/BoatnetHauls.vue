<template>
  <q-page padding>
    <div class="row justify-end">
      <q-input
        outlined
        bottom-slots
        v-model="searchText"
        label="Search"
        maxlength="12"
        style="width: 200px;"
      >
        <template v-slot:append>
          <q-icon
            v-if="searchText !== ''"
            name="close"
            @click="searchText = ''"
            class="cursor-pointer"
          />
          <q-icon name="search"/>
        </template>
      </q-input>
    </div>
    <q-table :data="data" :columns="columns" :selected.sync="selected"/>

    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->
    <div class="row">
      <q-btn color="primary" icon="playlist_add" label="Add Haul"/>
      <q-btn icon="edit" label="Edit Haul" disabled="true"/>
      <q-btn icon="done" label="End Haul" disabled="true"/>
      <q-btn icon="delete_forever" label="Delete Haul" disabled="true"/>
      <q-space/>
      <q-btn icon="play_arrow" label="Go to Logbook Mode"/>
      <q-btn icon="play_arrow" label="Go to Catch"/>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BoatnetHaulsSettings } from '../models/BoatnetHaulsSettings';

import moment from 'moment';

import { Point } from 'geojson';
import {
  WcgopHaul,
  WcgopHaulTypeName,
  LocationEvent,
  Vessel
} from '@boatnet/bn-models';

@Component
export default class BoatnetHauls extends Vue {
  @Prop() public programInfo: BoatnetHaulsSettings | undefined;
  private searchText = '';
  private columns = [
    {
      name: 'haulNum',
      required: true,
      label: 'Haul #',
      align: 'left',
      field: 'haulNum',
      sortable: true
    },
    {
      name: 'weightMethod',
      align: 'center',
      label: 'WM',
      field: (row: any) => row.observerTotalCatch.weightMethod,
      sortable: true
    },
    {
      name: 'gearPerf',
      align: 'center',
      label: 'Gear Perf',
      field: 'gearPerformance',
      sortable: true
    },
    {
      name: 'targetStrategy',
      align: 'center',
      label: 'Strat',
      field: 'targetStrategy',
      sortable: true
    },
    {
      name: 'gearType',
      align: 'center',
      label: 'Gear Type',
      field: 'gearType',
      sortable: true
    },
    {
      name: 'setDate',
      align: 'center',
      label: 'Set Time', // TODO: this needs logic to get first and last
      field: (row: any) =>
        moment(row.locations[0].date).format('hh:mm MM/DD/YY'),
      sortable: true
    },
    {
      name: 'upDate',
      align: 'center',
      label: 'Up Time', // TODO: this needs logic to get first and last
      field: (row: any) =>
        moment(row.locations[1].date).format('hh:mm MM/DD/YY'),
      sortable: true
    },
    {
      name: 'otcWeight',
      align: 'center',
      label: 'OTC Wt',
      field: (row: any) => row.observerTotalCatch.value,
      sortable: true
    },

    {
      name: 'errors',
      align: 'center',
      label: 'Errors',
      field: (row: any) => 0, // TODO Error calc
      sortable: true
    }
  ];
  private data: any = [];

  private exampleHaul: WcgopHaul;
  private exampleHaul2: WcgopHaul;

  get programName() {
    // Computed Property
    return this.programInfo ? this.programInfo.name : '';
  }

  constructor() {
    super();

    const locationExample: LocationEvent = {
      location: {
        // GeoJSON https://tools.ietf.org/html/rfc7946
        type: 'Point',
        coordinates: [124.6, 10.1]
      },
      date: moment()
        .subtract(1, 'days')
        .format()
    };

    const locationExample2: LocationEvent = {
      location: {
        // GeoJSON https://tools.ietf.org/html/rfc7946
        type: 'Point',
        coordinates: [124.6, 10.1]
      },
      date: moment().format()
    };

    this.exampleHaul = {
      _id: '1',
      type: WcgopHaulTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      haulNum: 1,
      observerTotalCatch: {
        value: 170,
        units: 'kg',
        weightMethod: '21'
      },
      locations: [locationExample, locationExample2],
      gearPerformance: '5',
      targetStrategy: 'ALBC',
      gearType: 'Trawl'
    };

    this.exampleHaul2 = {
      ...this.exampleHaul,
      haulNum: 2,
      targetStrategy: 'BANK'
    };
    this.data = [this.exampleHaul, this.exampleHaul2];
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
.q-btn {
  height: 75px;
}
</style>
