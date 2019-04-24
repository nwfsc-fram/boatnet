<template>
  <q-page class="flex flex-center">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clear"/>
      </template>
    </q-banner>

    <img alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">

    <div>
      <!-- <q-select
      outlined
      class="col-2"
      v-model="myvessel"
      label="Vessel Name/ Registration"
      use-input
      hide-selected
      input-debounce="0"
      :options="options"
      @filter="filterFn">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">No results</q-item-section>
        </q-item>
      </template>
      </q-select>-->
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action } from 'vuex-class';
import { AlertState, VesselState } from '../_store/types/types';
import { AuthState } from '@boatnet/bn-auth';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';
import { EmEfpPermit } from '@boatnet/bn-models';
import moment from 'moment';

@Component
export default class Home extends Vue {
  @State('alert') private alert!: AlertState;
  @State('vessel') private vessel!: VesselState;
  @State('auth') private auth!: AuthState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  private options: string[] = [];
  private myvessel: string = '';

  constructor() {
    super();
  }

  // private async filterFn(val: string, update: any, abort: any) {
  //   if (val.length < 2) {
  //     abort();
  //     return;
  //   }
  //   update(async () => {
  //     try {
  //       const masterDB: Client<any> = couchService.masterDB;

  //       const queryOptions: ListOptions = {
  //         limit: 5,
  //         start_key: val.toLowerCase(),
  //         inclusive_end: true,
  //         descending: false
  //       };

  //       const vessels = await masterDB.view<any>(
  //         'optecs_trawl',
  //         'all_vessel_names',
  //         queryOptions
  //       );

  //       this.options = vessels.rows.map((vessel) => vessel.value);
  //     } catch (err) {
  //       this.error(err);
  //     }
  //   });
  // }

  private async couch() {
    const masterDB: Client<any> = couchService.masterDB;
    // const queryOptions: ListOptions = {
    //       limit: 100,
    //       start_key: 'a',
    //       inclusive_end: true,
    //       descending: false
    //     };

    try {
      // const vessels = await masterDB.view<any>(
      //   'optecs_trawl',
      //   'all_vessel_names',
      //   queryOptions
      // );

      // this.options = vessels.rows.map((vessel) => vessel.value);

      const vessels = await masterDB.view<any>('optecs_trawl', 'all_vessel_names');

      console.log(vessels);
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.couch();
  }
}
</script>

<style>
.hero-logo {
  width: 40%;
}

@media screen and (orientation: portrait) {
  .hero-logo {
    width: 80%;
  }
}
</style>
