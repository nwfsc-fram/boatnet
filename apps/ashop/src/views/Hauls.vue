<template>
  <q-page>
    <boatnet-summary
      currentScreen="Haul"
      :current="currentHaul"
      :selectionId="currentHaul ? currentHaul[haulsSettings.itemNumName] : 0"
      @edit="editHauls"
      @add="handleGoToAddHauls"
      @delete="deleteHauls"
      @goTo="handleGoToCatch"
    >
      <template v-slot:table>
        <boatnet-table
          v-if="haulsSettings.columns"
          :data="haulsData"
          :settings="haulsSettings"
          @select="handleSelectHaul"
        />
      </template>

      <template v-slot:addButtons>
      </template>

      <template v-slot:goToButtons>
        <span style="position: relative; right: 10px">
          <q-btn color="primary" icon="fa fa-th-list" label="Logbook Mode" />
        </span>
      </template>
    </boatnet-summary>

    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold; text-transform: uppercase"
    >app mode : {{ appMode }}</div>
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
  AshopDiscardReason,
  BaseOperation
} from '@boatnet/bn-models';
import { TripState, AppSettings, BoatnetConfig } from '@boatnet/bn-common';

import moment from 'moment';
import { remove, get } from 'lodash';
import { initAshopHaul, initWcgopHaul } from '../data/initHauls';
import { allDocs } from '../helpers/queries';

Vue.component(BoatnetSummary);

@Component
export default class Hauls extends Vue {
  private haulsData: any = [];

  @State('tripsState') private tripState!: TripState;

  @Action('setCurrentHaul', { namespace: 'tripsState' })
  private setCurrentHaul: any;
  @Getter('currentHaul', { namespace: 'tripsState' })
  private currentHaul!: any;

  @Getter('currentTrip', { namespace: 'tripsState' })
  private currentTrip!: WcgopTrip | AshopTrip;

  @Action('save', { namespace: 'tripsState' })
  private save: any;

  @Getter('appMode', { namespace: 'appSettings' })
  private appMode!: string;

  @Getter('appConfig', { namespace: 'appSettings' })
  private appConfig!: BoatnetConfig;

  private haulsSettings: any = {};
  private mode: string = '';

  constructor() {
    super();
  }

  private async getHauls() {
    const currTrip = await pouchService.db.get(
      this.currentTrip._id
    );
    if (currTrip.operationIDs) {
      const queryOptions = {
        keys: currTrip.operationIDs,
        descending: true
      };
      this.haulsData =  await allDocs(queryOptions, pouchService.userDBName);
    }
  }

  private created() {
    this.getHauls();
    this.getHaulsSettings();
  }

  private handleSelectHaul(haul: any) {
    if (haul) {
      this.setCurrentHaul(haul);
    } else {
      this.setCurrentHaul(undefined);
    }
  }

  private handleGoToCatch() {
    if (this.currentHaul) {
      this.$router.push({ path: '/catch/' });
    }
  }

  private async handleGoToAddHauls() {
    const haulNum: number = await this.addHauls();
    this.$router.push({path: '/hauldetails/' + haulNum });
  }

  private async addHauls() {
    let haul: BaseOperation = {};
    const haulNum = this.haulsData.length > 0 ?
      parseInt(this.haulsData[0][this.haulsSettings.itemNumName], 10) + 1 : 1;
    if (this.appMode === 'ashop') {
      haul = initAshopHaul(haulNum);
    } else {
      haul = initWcgopHaul(haulNum);
    }
    await pouchService.db
      .post(haul)
      .then((response: any) => {
        haul._id = response.id;
        haul._rev = response.rev;

        // update trip doc with new haulId
        this.currentTrip.operationIDs
          ? this.currentTrip.operationIDs.push(response.id)
          : this.currentTrip.operationIDs = [response.id];
        this.save(this.currentTrip);
      });

    this.setCurrentHaul(haul);
    return haul[this.haulsSettings.itemNumName];
  }

  private editHauls() {
    this.$router.push({
      path: '/hauldetails/' + this.currentHaul[this.haulsSettings.itemNumName]
    });
  }

  private async deleteHauls() {
    if (this.currentTrip.operationIDs && this.currentHaul._id) {
      const removalIndex = this.currentTrip.operationIDs.slice().reverse().indexOf(this.currentHaul._id);
      this.haulsData.splice(removalIndex, 1);
      remove(this.currentTrip.operationIDs, (n: string) => n === this.currentHaul._id);
      this.save(this.currentTrip);
    }
    await pouchService.db.remove(this.currentHaul);
    this.setCurrentHaul(undefined);
  }

  private formatDate(date: string) {
    return moment(date).format('HH:mm MM/DD/YY');
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
