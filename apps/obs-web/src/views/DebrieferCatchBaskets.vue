<template>
  <div>
    <div class="text-h6">Catch Baskets</div>
    <prime-table :value="WcgopCatchBaskets" :columns="columns" type="CatchBaskets"/>    
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
  private WcgopCatchBaskets: Basket[] = [];
  private pagination = { rowsPerPage: 50 };

  private columns = [
    { field: 'legacy.tripId', header: 'Trip Id' },
    { field: 'operationNum', header: 'Haul #' },
    { field: 'catch.catchNum', header: 'Catch #' },
    { field: 'catch.disposition.description', header: 'Catch Disposition' },
    { field: 'catch.weightMethod.description', header: 'Catch WM' },
    { field: 'catch.weight.value', header: 'Catch Weight (lbs)' }
  ];

   private async getCatchBaskets() {
    const masterDB: Client<any> = couchService.masterDB;
    const operationIds: any[] = getSelected(this.debriefer.program, 'Operations');

    try {
      const options: ListOptions = {
        keys: operationIds
      };

      const operations = await masterDB.listWithDocs(
        options
      );

      for (const operation of operations.rows) {
        for (const catchRow of operation.catches) {
          if (catchRow.baskets != null) {
            for (const catchBasketRow of catchRow.baskets) {
              const opCatch = Object.assign({}, operation);
              opCatch.key = operation.key;
             // opCatch.trip = this.debriefer.WcgopOperationTripDict[operation._id];
              opCatch.catch = catchRow;
              opCatch.catch.basket = catchBasketRow;
              this.WcgopCatchBaskets.push(opCatch);
            }
          }
        }
      }

      console.log(this.WcgopCatchBaskets);
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.getCatchBaskets();
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