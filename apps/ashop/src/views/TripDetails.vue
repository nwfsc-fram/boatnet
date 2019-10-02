<template>
  <div>Trip Details
    {{ tripDetailsSettings }}

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
import { TripState, AppSettings } from '@boatnet/bn-common';

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

  private tripDetailsSettings: any = {};
  private mode: string = '';

  constructor() {
    super();
  }

  private created() {
    this.setCurrentTrip(sampleTrip);
    this.getTripDetailsSettings();
  }

  private async getTripDetailsSettings() {
    if (this.appMode) {
      try {
        const db = pouchService.db;
        const queryOptions = {
          limit: 1,
          start_key: this.appMode,
          inclusive_end: true,
          descending: false,
          include_docs: true
        };
        const columns = await db.query(
          pouchService.lookupsDBName,
          'LookupDocs/boatnet-config-lookup',
          queryOptions
        );
        console.log(columns.rows[0].doc.tripAttributes);
        this.tripDetailsSettings = columns.rows[0].doc.tripAttributes;
      } catch (err) {
        console.log(err);
      }
    }
  }
}

</script>
