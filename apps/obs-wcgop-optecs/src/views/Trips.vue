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
          <q-icon v-if="searchText !== ''" name="close" @click="searchText = ''" class="cursor-pointer"/>
          <q-icon name="search"/>
        </template>
      </q-input>
    </div>

    <q-table title="Trips" :data="data" :columns="columns" :selected.sync="selected"/>

    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->
    <div class="row">
      <q-btn color="primary" icon="playlist_add" label="Add Trip"/>
      <q-btn icon="edit" label="Edit Trip" disabled="true"/>
      <q-btn icon="done" label="End Trip" disabled="true"/>
      <q-btn icon="delete_forever" label="Delete Trip" disabled="true"/>
      <q-space/>
      <q-btn icon="play_arrow" label="Go to Hauls"/>
    </div>
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
// Vue.prototype.moment = moment;

@Component({
  data() {
    return {
      selected: []
    };
  }
})
export default class Trips extends Vue {
  private searchText = '';
  private columns = [
    {
      name: 'tripId',
      required: true,
      label: 'Trip Id',
      align: 'left',
      field: '_id',
      sortable: true
    },
    {
      name: 'vesselName',
      align: 'center',
      label: 'Vessel Name',
      field: (row: any) => row.vessel.name,
      sortable: true
    },
    {
      name: 'departurePort',
      align: 'center',
      label: 'Departure Port',
      field: (row: any) => row.departurePort.name,
      sortable: true
    },
    {
      name: 'departureDate',
      align: 'center',
      label: 'Departure Date',
      field: (row: any) => moment(row.departureDate).format('MM/DD/YY'),
      sortable: true
    },
    {
      name: 'returnPort',
      align: 'center',
      label: 'Return Port',
      field: (row: any) => row.departurePort.name,
      sortable: true
    },
    {
      name: 'returnDate',
      align: 'center',
      label: 'Return Date',
      field: (row: any) => moment(row.departureDate).format('MM/DD/YY'),
      sortable: true
    },
    {
      name: 'errors',
      align: 'center',
      label: 'Errors',
      field: (row: any) => 2, // TODO Error calc
      sortable: true
    }
  ];
  private data: any = [];

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

    const exampleVessel2: Vessel = {
      name: 'Pickle Pelican'
    };

    this.exampleTrip = {
      _id: '1',
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
        stuff: [1, 3, 4],
        other: 'test'
      }
    };

    const exampleTrip2 = {
      _id: '2',
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      program: 'Catch Shares',
      departurePort: examplePort2,
      departureDate: moment()
        .subtract(1, 'days')
        .format(),
      returnPort: examplePort,
      returnDate: moment().format(),
      vessel: exampleVessel2
      // ... other data
    };

    this.data = [this.exampleTrip, exampleTrip2];
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
