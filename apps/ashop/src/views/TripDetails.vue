<template>
  <div>

  <div style="display: flex; flex-wrap: wrap; justify-content: center;">
      <div v-for="config of appConfig.tripAttributes" :key="appConfig.tripAttributes.indexOf(config)">
        <boatnet-datetime-prime
          v-if="config.type === 'dateTime'"
          :date.sync="trip[config.modelName]"
          :config="config"
          :model="trip"
          class="q-ma-sm">
        </boatnet-datetime-prime>
      </div>
    </div>

    <div class="bg-primary text-white" style="padding: .5em; text-align: center; font-weight: bold">
      Trip Details: {{ trip }}
    </div>

    <boatnet-keyboard-input
                :value.sync="name"
                label="Skipper's Name"
                keyboardType="compact"
                dense
                :list="list"
              />

  </div>
</template>

<style>
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
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

import { sampleData, sampleTrip } from '../data/data';

import moment from 'moment';

@Component
export default class Trips extends Vue {

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

  private name: string = '';

  private tripDetailsSettings: any = {};
  private mode: string = '';

  private trip = {};

  private list: string[] = ['baby shark', 'mama shark', 'daddy shark', 'nemo', 'dori', 'whale'];

  constructor() {
    super();
  }

  private created() {
    this.setCurrentTrip(sampleTrip);
  }

}

</script>
