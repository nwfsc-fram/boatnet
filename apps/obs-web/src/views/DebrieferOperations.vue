<template>
  <div>
    <div class="text-h6">Hauls</div>
    <prime-table :value="WcgopOperations" :columns="columns" />
  </div>
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
  GeneralState,
  DebrieferState
} from '../_store/types/types';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopCatch,
  WcgopSpecimen,
  Basket
} from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date } from 'quasar';
import { convertToObject } from 'typescript';

@Component
export default class DebrieferOperations extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  private WcgopTrips: WcgopTrip[] = [];
  private WcgopOperations: WcgopOperation[] = [];
  private pagination = { rowsPerPage: 50 };

  private columns = [
    { field: 'legacy.tripId', header: 'Trip Id' },
    { field: 'operationNum', header: 'Haul #' },
    { field: 'catches.length', header: 'Catches' },
    { field: 'location.position', header: 'Position' },
    // {field: 'locations[0].location.coordinates[0]', header: 'Location'},
    { field: 'observerTotalCatch.measurement.value', header: 'OTC' },
    { field: 'gearType.description', header: 'Gear Type' },
    { field: 'gearPerformance.description', header: 'Gear Performance' }
    //   {field: 'location.position', header: 'Target Strategy'},
    //   {field: 'location.position', header: 'isEfpUsed'},
    //   {field: 'location.position', header: 'CAL Weight'}
  ];

  private async getOperations() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
      const options: ListOptions = {
        keys: Object.keys(this.debriefer.WcgopOperationTripDict)
      };

      const operations = await masterDB.listWithDocs(options);

      for (const operation of operations.rows) {
        for (const locationRow of operation.locations) {
          const opLoc = Object.assign({}, operation);
          opLoc.key = operation.key;
          opLoc.trip = this.debriefer.WcgopOperationTripDict[operation._id];
          opLoc.location = locationRow;
          this.WcgopOperations.push(opLoc);
        }
      }
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.getOperations();
  }

  private formatDate(inputDate: any) {
    return date.formatDate(inputDate, 'MM/DD/YYYY');
  }

  private nullValueCheck(input: any, round: boolean) {
    if (input) {
      if (round) {
        return input.value.toFixed(2);
      } else {
        return input.value;
      }
    }

    return '';
  }

  private nullDescriptionCheck(input: any) {
    if (input != null) {
      return input.description;
    }

    return '';
  }
}
</script>