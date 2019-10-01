<template>
  <q-page>
    <boatnet-summary
      currentScreen="Haul"
      :current="currentHaul"
      :selectionId="currentHaul ? currentHaul.operationNum : 0"
      @edit="editHauls"
      @add="addHauls"
      @delete="deleteHauls"
      @goTo="handleGoToCatch"
    >
      <template v-slot:table>
        <boatnet-table v-if="haulsSettings.columns" :data="haulsData[appMode]" :settings="haulsSettings" @select="handleSelectHaul">
          <template v-slot:default="rowVals">
            <q-td v-for="column of haulsSettings.columns" :align="column.align" :key="column.name">
              {{ getValue(rowVals.row.doc, column) }}
            </q-td>
          </template>
        </boatnet-table>
      </template>

      <template v-slot:goToButtons>
        <span style="position: relative; right: 10px">
          <q-btn color="primary" icon="fa fa-th-list" label="Logbook Mode" />
        </span>
      </template>

    </boatnet-summary>

    <div class="bg-primary text-white" style="padding: .5em; text-align: center; font-weight: bold; text-transform: uppercase">app mode : {{ appMode }}</div>
  </q-page>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetSummary, { BoatnetHaulsSettings } from '@boatnet/bn-common';
import { Point } from 'geojson';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { pouchService } from '@boatnet/bn-pouch';
import { Action, Getter, State } from 'vuex-class';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  WcgopCatch,
  WcgopCatchTypeName,
  SpeciesTypeName,
  AshopTrip,
  AshopCatch,
  AshopHaul,
  AshopDiscardReason
} from '@boatnet/bn-models';
import { TripState, AppSettings, BoatnetConfig } from '@boatnet/bn-common';

import moment from 'moment';
import { sampleData, sampleTrip } from '../data/data';

Vue.component(BoatnetSummary);

@Component
export default class Hauls extends Vue {

  private haulsData: any = {};

  @State('tripsState') private tripState!: TripState;

  @Action('setCurrentHaul', { namespace: 'tripsState' })
  private setCurrentHaul: any;
  @Getter('currentHaul', { namespace: 'tripsState' })
  private currentHaul!: any;

  @Getter('currentTrip', { namespace: 'tripsState' })
  private currentTrip!: WcgopTrip | AshopTrip;

  @Action('setCurrentTrip', { namespace: 'tripsState' })
  private setCurrentTrip: any;

  @Action('save', { namespace: 'tripsState' })
  private save: any;

  @Getter('appMode', { namespace: 'appSettings' })
  private appMode!: AppSettings;

  @Getter('appConfig', { namespace: 'appSettings' })
  private appConfig!: BoatnetConfig;

  private haulsSettings: any = {};
  private mode: string = '';

  constructor() {
    super();
  }

  private async getHauls() {
    this.haulsData = sampleData;  // get sampleData

    // if (this.currentTrip && this.currentTrip.operationIDs) {
    //   const queryOptions = {
    //     keys: this.currentTrip.operationIDs,
    //     descending: true
    //   };
    //   try {
    //     const result = await pouchService.db.allDocs(
    //       pouchService.userDBName,
    //       queryOptions
    //     );
    //     this.haulsData = result.rows;
    //   } catch (err) {
    //     console.log('error fetching hauls');
    //   }
    // }

  }

  private created() {
    this.setCurrentTrip(sampleTrip);
    this.getHauls();
    this.getHaulsSettings();
  }

  private handleSelectHaul(haul: any) {
    if (haul) {
      this.setCurrentHaul(haul.doc);
    } else {
      this.setCurrentHaul(undefined);
    }
  }

  private handleGoToCatch() {
    if (this.currentHaul) {
      this.$router.push({ path: '/catch/' });
    }
  }

  private addHauls() {
    this.mode = JSON.parse(JSON.stringify(this.appMode));
    let num = 1;

    if (this.haulsData[this.mode][0]) { // remove modes - early dev only
      num = this.haulsData[this.mode][0].doc[this.haulsSettings.itemNumName] + 1; // remove modes - early dev only
    }

    const haul: any = { operationNum: num };
    haul[this.haulsSettings.itemNumName] = num;

    this.setCurrentHaul(haul);
    this.$router.push({ path: '/hauldetails/' + haul[this.haulsSettings.itemNumName] });
  }

  private editHauls() {
    this.mode = JSON.parse(JSON.stringify(this.appMode));
    this.$router.push({
      path: '/hauldetails/' + this.currentHaul[this.haulsSettings.itemNumName]
    });
  }

  private deleteHauls() {
    pouchService.db.remove(pouchService.userDBName, this.currentHaul);
    if (this.currentTrip.operationIDs && this.currentHaul._id) {
      const removalIndex = this.currentTrip.operationIDs.indexOf(
        this.currentHaul._id
      );
      this.currentTrip.operationIDs.splice(removalIndex, 1);
    }
    this.getHauls();
    this.save(this.currentTrip);
    this.setCurrentHaul(undefined);
  }

  private formatDate(date: string) {
    return moment(date).format('HH:mm MM/DD/YY');
  }

  private getValue(row: any, attribute: any) {
    const fields = attribute.field.split('.');
    let value = row;
    for (const field of fields) {
      value = value[field];
    }
    return value;
  }

  private async getHaulsSettings() {
    if (this.appMode) {
      this.haulsSettings = this.appConfig.hauls;
    }
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
