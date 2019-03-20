<template>
  <boatnet-trips v-bind:tripsSettings="wcgopTripsSettings" v-bind:tripsData="wcgopTripsData"/>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetTrips, { BoatnetTripsSettings } from '@boatnet/bn-common';

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

Vue.component(BoatnetTrips);

@Component
export default class Trips extends Vue {
  private wcgopTripsSettings: BoatnetTripsSettings;
  private wcgopTripsData: any[];

  constructor() {
    super();
    this.wcgopTripsSettings = {
      columns: [
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
      ]
    };

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

    const exampleTrip = {
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
        tripId: 123
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

    this.wcgopTripsData = [exampleTrip, exampleTrip2];
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
