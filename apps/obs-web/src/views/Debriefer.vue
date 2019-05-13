<template>
        <q-table
            :data="WcgopTrips"
            :columns="columns"
            dense
            row-key="id"
            :pagination.sync="pagination"
            >

        <template v-slot:body="props">
          <q-tr :props='props'>
          <q-td key="key" :props="props">{{ props.row.key }}</q-td>
          <q-td key="tripStatus" :props="props">{{ props.row.tripStatus.description }}</q-td>
          <q-td key="vessel" :props="props">{{ props.row.vessel.vesselName }}</q-td>
          <q-td key="program" :props="props">{{ props.row.program.name }}</q-td>
          <q-td key="departurePort" :props="props">{{ props.row.departurePort.name }}</q-td>
          <q-td key="departureDate" :props="props">{{ props.row.departureDate }}</q-td>
          <q-td key="returnPort" :props="props">{{ props.row.returnPort.name }}</q-td>
          <q-td key="returnDate" :props="props">{{ props.row.returnDate }}</q-td>
          <q-td key="skipper" :props="props">{{ props.row.skipper }}</q-td>
          <q-td key="isPartialTrip" :props="props">{{ props.row.isPartialTrip }}</q-td>
          <q-td key="fishingDays" :props="props">{{ props.row.fishingDays }}</q-td>
          <q-td key="fishery" :props="props">{{ props.row.fishery }}</q-td>
          </q-tr>
        </template>

        </q-table>
</template>


<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  TripState,
  PermitState,
  UserState,
  GeneralState
} from '../_store/types/types';
import { WcgopTrip } from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

@Component
export default class Debriefer extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
private WcgopTrips: WcgopTrip[] = [];
private pagination = {rowsPerPage: 50};
private columns = [
    {name: 'key', label: 'Trip ID', field: 'key', required: true, align: 'left', sortable: true },
    {name: 'tripStatus', label: 'Trip Status', field: 'tripStatus', required: true, align: 'left', sortable: true },
    {name: 'vessel', label: 'Vessel', field: 'vessel', required: true, align: 'left', sortable: true },
    {name: 'program', label: 'Program', field: 'program', required: true, align: 'left', sortable: true },
    {name: 'departurePort', label: 'Departure Port', field: 'departurePort', required: true, align: 'left', sortable: true },
    {name: 'departureDate', label: 'Departure Date', field: 'departureDate', required: true, align: 'left', sortable: true },
    {name: 'returnPort', label: 'Return Port', field: 'returnPort', required: true, align: 'left', sortable: true },
    {name: 'returnDate', label: 'Return Date', field: 'returnDate', required: true, align: 'left', sortable: true },
    {name: 'skipper', label: 'Skipper', field: 'skipper', required: true, align: 'left', sortable: true },
    {name: 'isPartialTrip', label: 'Partial Trip', field: 'isPartialTrip', required: true, align: 'left', sortable: true },
    {name: 'fishingDays', label: 'Fishing Days', field: 'fishingDays', required: true, align: 'left', sortable: true },
    {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true }
];
private async getTrips() {
  const masterDB: Client<any> = couchService.masterDB;
  try {
      const options: ListOptions = {
        limit: 20
      };

      console.log('calling masterDB.view');
      const trips = await masterDB.viewWithDocs<any>(
          'MainDocs',
          'all-trips',
          options
          );
      console.log('post masterDB.view');
      console.log(trips.rows);

      for (const row of trips.rows) {
          const trip = row.doc;
          trip.key = row.key;
          this.WcgopTrips.push(trip);
      }
      console.log(this.WcgopTrips);

  } catch (err) {
      this.error(err);
  }
}

private created() {
    this.getTrips();
}

}
</script>