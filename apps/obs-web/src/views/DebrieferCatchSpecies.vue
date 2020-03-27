<template>
  <div>
    <div class="text-h6">Catch Species</div>
    <prime-table :value="WcgopCatchSpecies" :columns="columns" type="CatchSpecies"/>
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
import { getSelected } from '../helpers/localStorage';

@Component
export default class DebrieferOperations extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  private WcgopTrips: WcgopTrip[] = [];
  private WcgopOperations: WcgopOperation[] = [];
  private WcgopCatchSpecies: WcgopCatch[] = [];
  private pagination = { rowsPerPage: 50 };

  private columns = [
    { field: 'legacy.tripId', header: 'Trip Id', key: 'tripId' },
    { field: 'operationNum', header: 'Haul #', key: 'haulNum' },
    { field: 'catch.catchNum', header: 'Catch #', key: 'catchNum' },
    { field: 'catch.disposition.description', header: 'Catch Disposition', key: 'catchDisc' },
    { field: 'catch.weightMethod.description', header: 'Catch WM', key: 'catchWM' },
    { field: 'catch.weight.value', header: 'Catch Weight (lbs)', key: 'catchLbs' }
  ];

  private async getCatchSpecies() {
    const masterDB: Client<any> = couchService.masterDB;
    const operationIds: any[] = getSelected(this.debriefer.program, 'Operations');

    try {
      const options: ListOptions = {
        keys: operationIds
      };

      const operations = await masterDB.listWithDocs(options);

      for (const operation of operations.rows) {
        for (const catchRow of operation.catches) {
          if (catchRow.children != null) {
            for (const catchSpeciesRow of catchRow.children) {
              const opCatch = Object.assign({}, operation);
              opCatch.key = operation.key;
             /* opCatch.trip = this.debriefer.WcgopOperationTripDict[
                operation._id
              ];*/
              opCatch.catch = catchRow;
              opCatch.catch.species = catchSpeciesRow;
              this.WcgopCatchSpecies.push(opCatch);
            }
          }
        }
      }
    } catch (err) {
      this.error(err);
    }
  }
  private created() {
    this.getCatchSpecies();
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