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
          <q-td key="id"></q-td>
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
          // trip.id = row.id;
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