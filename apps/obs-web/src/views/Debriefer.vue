<template>

        <q-table
            :data="WcgopTrips"
            :columns="columns"
            dense
            row-key="id"
            :pagination.sync="pagination"
            :visible-columns="visibleColumns"
            >

 <div v-if="$q.screen.gt.xs" class="col">
          <q-toggle v-model="visibleColumns" val="key" label="Trip ID" />
          <q-toggle v-model="visibleColumns" val="tripStatus" label="Trip Status" />
          <q-toggle v-model="visibleColumns" val="vessel" label="Vessel" />

        </div>


        <template v-slot:body="props">
          <q-tr :props='props'>
          <q-td key="key" :props="props">{{ props.row.key }}</q-td>
          <q-td key="tripStatus" :props="props">{{ props.row.tripStatus.description }}</q-td>
          <q-td key="vessel" :props="props">{{ props.row.vessel.vesselName }}</q-td>
          <q-td key="program" :props="props">{{ props.row.program.name }}</q-td>
          <q-td key="departurePort" :props="props">{{ props.row.departurePort.name }}</q-td>
          <q-td key="departureDate" :props="props">{{ formatDate(props.row.departureDate) }}</q-td>
          <q-td key="returnPort" :props="props">{{ props.row.returnPort.name }}</q-td>
          <q-td key="returnDate" :props="props">{{ formatDate(props.row.returnDate) }}</q-td>
          <q-td key="captain" :props="props">{{ props.row.captain }}</q-td>
          <q-td key="isPartialTrip" :props="props">{{ props.row.isPartialTrip }}</q-td>
          <q-td key="fishingDays" :props="props">{{ props.row.fishingDays }}</q-td>
          <q-td key="fishery" :props="props">{{ getFisheryLookup(props.row.fishery) }}</q-td>
          <q-td key="crewSize" :props="props">{{ props.row.crewSize }}</q-td>
          <q-td key="firstReceiver" :props="props">{{ props.row.firstReceiver }}</q-td>
          <q-td key="isFishProcessed" :props="props">{{ props.row.isFishProcessed }}</q-td>
          <q-td key="logbookNum" :props="props">{{ props.row.logbookNum }}</q-td>
          <q-td key="logbookType" :props="props">{{ props.row.logbookType }}</q-td>
          <q-td key="observerLogbookNum" :props="props">{{ props.row.observerLogbookNum }}</q-td>
          <q-td key="debriefer" :props="props">{{ props.row.debriefer }}</q-td>
          <q-td key="brd" :props="props">{{ props.row.brd }}</q-td>
          <q-td key="hlfc" :props="props">{{ props.row.hlfc }}</q-td>
          <q-td key="fishTickets" :props="props">{{ props.row.fishTickets }}</q-td>
          <q-td key="certificates" :props="props">{{ props.row.certificates }}</q-td>
          <q-td key="waiver" :props="props">{{ props.row.waiver }}</q-td>
          <q-td key="intendedGearType" :props="props">{{ props.row.intendedGearType }}</q-td>
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
import { date } from 'quasar';


@Component
export default class Debriefer extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;

private WcgopTrips: WcgopTrip[] = [];
private pagination = {rowsPerPage: 50};
private fisheries = [ { id: 1, description: 'Catch Shares'}, { id: 2, description: 'Shoreside Hake' }, { id: 3, description: 'some fishery lookup 3' }, { id: 5, description: 'Some fishery lookup value' }  ];
private visibleColumns = ['key','tripStatus','vessel'];
private columns = [
    {name: 'key', label: 'Trip ID', field: 'key', required: true, align: 'left', sortable: true },
    {name: 'tripStatus', label: 'Trip Status', field: 'tripStatus', required: true, align: 'left', sortable: true },
    {name: 'vessel', label: 'Vessel', field: 'vessel', required: true, align: 'left', sortable: true },
    {name: 'program', label: 'Program', field: 'program', required: true, align: 'left', sortable: true },
    {name: 'departurePort', label: 'Departure Port', field: 'departurePort', required: true, align: 'left', sortable: true },
    {name: 'departureDate', label: 'Departure Date', field: 'departureDate', required: true, align: 'left', sortable: true },
    {name: 'returnPort', label: 'Return Port', field: 'returnPort', required: true, align: 'left', sortable: true },
    {name: 'returnDate', label: 'Return Date', field: 'returnDate', required: true, align: 'left', sortable: true },
    {name: 'captain', label: 'Skipper', field: 'captain', required: true, align: 'left', sortable: true },
    {name: 'isPartialTrip', label: 'Partial Trip', field: 'isPartialTrip', required: true, align: 'left', sortable: true },
    {name: 'fishingDays', label: 'Fishing Days', field: 'fishingDays', required: true, align: 'left', sortable: true },
    {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true },
    {name: 'crewSize', label: 'Crew Size', field: 'crewSize', required: true, align: 'left', sortable: true },
    {name: 'firstReceiver', label: 'First Receiver', field: 'firstReceiver', required: true, align: 'left', sortable: true },
    {name: 'isFishProcessed', label: 'Fish Processed', field: 'isFishProcessed', required: true, align: 'left', sortable: true },
    {name: 'logbookNum', label: 'Logbook #', field: 'logbookNum', required: true, align: 'left', sortable: true },
    {name: 'logbookType', label: 'Logbook Type', field: 'logbookType', required: true, align: 'left', sortable: true },
    {name: 'observerLogbookNum', label: 'Observer Logbook', field: 'observerLogbookNum', required: true, align: 'left', sortable: true },
    {name: 'debriefer', label: 'Debriefer', field: 'debriefer', required: true, align: 'left', sortable: true },
    {name: 'brd', label: 'BRD', field: 'brd', required: true, align: 'left', sortable: true },
    {name: 'hlfc', label: 'HLFC', field: 'hlfc', required: true, align: 'left', sortable: true },
    {name: 'fishTickets', label: 'Fish Tickets', field: 'fishTickets', required: true, align: 'left', sortable: true },
    {name: 'certificates', label: 'Certificates', field: 'certificates', required: true, align: 'left', sortable: true },
    {name: 'waiver', label: 'Waiver', field: 'waiver', required: true, align: 'left', sortable: true },
    {name: 'intendedGearType', label: 'Intended Gear Type', field: 'intendedGearType', required: true, align: 'left', sortable: true }
];
private async getTrips() {
  const masterDB: Client<any> = couchService.masterDB;
  try {
      const options: ListOptions = {
        limit: 20
      };

      const trips = await masterDB.viewWithDocs<any>(
          'MainDocs',
          'all-trips',
          options
          );

      for (const row of trips.rows) {
          const trip = row.doc;
          trip.key = row.key;
          this.WcgopTrips.push(trip);
      }

  } catch (err) {
      this.error(err);
  }
}

private created() {
    this.getTrips();
}

private getFisheryLookup(key: any) {
    let returnValue = '';

    for (const lookup of this.fisheries) {
      if (lookup.id === key) {
        returnValue = lookup.description;
        }
    }

    return returnValue;
}

private formatDate(inputDate: any) {
    return date.formatDate(inputDate, 'MM/DD/YYYY');
}



}
</script>