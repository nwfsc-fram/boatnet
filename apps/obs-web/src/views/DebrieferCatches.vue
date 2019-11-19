<template>
  <div>
    <div class="text-h6">Catch</div>
    <prime-table :value="WcgopCatches" :columns="columns"/>
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
  private WcgopCatches: WcgopCatch[] = [];
  private pagination = { rowsPerPage: 50 };

  private columns = [
    { field: 'legacy.tripId', header: 'Trip Id' },
    { field: 'operationNum', header: 'Haul #' },
    { field: 'catch.catchNum', header: 'Catch #' },
    { field: 'catch.disposition.description', header: 'Catch Disposition' },
    { field: 'catch.weightMethod.description', header: 'Catch WM' },
    { field: 'catch.catchContent.name', header: 'Species' },
    { field: 'catch.weight.value', header: 'Catch Weight (lbs)' }
  ];

  private async getCatches() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
      const options: ListOptions = {
        keys: this.debriefer.operationIds
      };

      const operations = await masterDB.listWithDocs(
        options
      );

      for (const operation of operations.rows) {
        for (const catchRow of operation.catches) {
          const opCatch = Object.assign({}, operation);
          opCatch.key = catchRow._id;
          opCatch.catch = catchRow;
          this.WcgopCatches.push(opCatch);
        }
      }
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.getCatches();
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