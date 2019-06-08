

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
import {
  WcgopTrip
} from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date } from 'quasar';
import { convertToObject } from 'typescript';

@Component
export default class DebrieferTrip extends Vue {

  private visibleTripColumns = [
    'key',
    'tripStatus',
    'vessel',
    'program',
    'departurePort',
    'departureDate',
    'returnPort',
    'returnDate'
  ];
  
  private tripColumns = [
    {
      name: 'key',
      label: 'Trip ID',
      field: 'key',
      align: 'left',
      sortable: true
    },
    {
      name: 'tripStatus',
      label: 'Trip Status',
      field: 'tripStatus',
      align: 'left',
      sortable: true
    },
    {
      name: 'vessel',
      label: 'Vessel',
      field: 'vessel',
      align: 'left',
      sortable: true
    },
    {
      name: 'program',
      label: 'Program',
      field: 'program',
      align: 'left',
      sortable: true
    },
    {
      name: 'departurePort',
      label: 'Departure Port',
      field: 'departurePort',
      align: 'left',
      sortable: true
    },
    {
      name: 'departureDate',
      label: 'Departure Date',
      field: 'departureDate',
      align: 'left',
      sortable: true
    },
    {
      name: 'returnPort',
      label: 'Return Port',
      field: 'returnPort',
      align: 'left',
      sortable: true
    },
    {
      name: 'returnDate',
      label: 'Return Date',
      field: 'returnDate',
      align: 'left',
      sortable: true
    },
    {
      name: 'captain',
      label: 'Skipper',
      field: 'captain',
      align: 'left',
      sortable: true
    },
    {
      name: 'isPartialTrip',
      label: 'Partial Trip',
      field: 'isPartialTrip',
      align: 'left',
      sortable: true
    },
    {
      name: 'fishingDays',
      label: 'Fishing Days',
      field: 'fishingDays',
      align: 'left',
      sortable: true
    },
    {
      name: 'fishery',
      label: 'Fishery',
      field: 'fishery',
      align: 'left',
      sortable: true
    },
    {
      name: 'crewSize',
      label: 'Crew Size',
      field: 'crewSize',
      align: 'left',
      sortable: true
    },
    {
      name: 'firstReceiver',
      label: 'First Receiver',
      field: 'firstReceiver',
      align: 'left',
      sortable: true
    },
    {
      name: 'isFishProcessed',
      label: 'Fish Processed',
      field: 'isFishProcessed',
      align: 'left',
      sortable: true
    },
    {
      name: 'logbookNum',
      label: 'Logbook #',
      field: 'logbookNum',
      align: 'left',
      sortable: true
    },
    {
      name: 'logbookType',
      label: 'Logbook Type',
      field: 'logbookType',
      align: 'left',
      sortable: true
    },
    {
      name: 'observerLogbookNum',
      label: 'Observer Logbook',
      field: 'observerLogbookNum',
      align: 'left',
      sortable: true
    },
    {
      name: 'debriefer',
      label: 'Debriefer',
      field: 'debriefer',
      align: 'left',
      sortable: true
    },
    { name: 'brd', label: 'BRD', field: 'brd', align: 'left', sortable: true },
    {
      name: 'hlfc',
      label: 'HLFC',
      field: 'hlfc',
      align: 'left',
      sortable: true
    },
    {
      name: 'fishTickets',
      label: 'Fish Tickets',
      field: 'fishTickets',
      align: 'left',
      sortable: true
    },
    {
      name: 'certificates',
      label: 'Certificates',
      field: 'certificates',
      align: 'left',
      sortable: true
    },
    {
      name: 'waiver',
      label: 'Waiver',
      field: 'waiver',
      align: 'left',
      sortable: true
    },
    {
      name: 'intendedGearType',
      label: 'Intended Gear Type',
      field: 'intendedGearType',
      align: 'left',
      sortable: true
    }
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

        for (const operationId of trip.operationIDs) {
          this.WcgopOperationTripDict[operationId] = trip;
        }
      }
    } catch (err) {
      this.error(err);
    }
  }

}
</script>