<template>
  <div>
    <div class="text-h6">Hauls</div>
    <prime-table
      :value="WcgopOperations"
      :columns="columns"
      :selected="selected"
      @onRowSelect="onRowSelect"
      @onRowUnselect="onRowUnSelect"
    />
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

  @Action('addOperationId', { namespace: 'debriefer' })
  private addOperationId: any;
  @Action('removeOperationId', { namespace: 'debriefer' })
  private removeOperationId: any;

  private WcgopTrips: WcgopTrip[] = [];
  private WcgopOperations: WcgopOperation[] = [];
  private pagination = { rowsPerPage: 50 };
  private selected: any = [];

  private columns = [
    { field: 'legacy.tripId', header: 'Trip Id' },
    { field: 'operationNum', header: 'Haul #' },
    { field: 'catches.length', header: 'Catches' },
    // { field: 'location.position', header: 'Position' },
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
    let operationIds: string[] = [];
    try {
      // get trips
      const tripOptions: ListOptions = {
        keys: this.debriefer.tripIds
      };

      const trips = await masterDB.listWithDocs(tripOptions);
      for (const row of trips.rows) {
        operationIds = operationIds.concat(row.operationIDs);
      }

      // get operations
      const options: ListOptions = {
        keys: operationIds
      };

      const operations = await masterDB.listWithDocs(options);
      for (const operation of operations.rows) {
        //  for (const locationRow of operation.locations) {
        const opLoc = Object.assign({}, operation);
        opLoc.key = operation._id;
        //   opLoc.location = locationRow;
        this.WcgopOperations.push(opLoc);
        if (this.debriefer.operationIds.indexOf(operation._id) !== -1) {
          this.selected.push(opLoc);
        }
        //  }
      }
    } catch (err) {
      this.error(err);
    }
  }

  private onRowSelect(event: any) {
    this.addOperationId(event.data._id);
  }

  private onRowUnSelect(event: any) {
    this.removeOperationId(event.data._id);
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