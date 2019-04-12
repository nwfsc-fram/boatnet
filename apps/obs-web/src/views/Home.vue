<template>
  <q-page class="flex flex-center">
    <img alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">

    <div>
    <q-btn @click="testCouch"> get stuff</q-btn>
    
    <q-select
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
    </q-select>
    </div>

  </q-page>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action } from 'vuex-class';
import { AlertState, VesselState } from '../_store/types/types';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';

@Component
export default class Home extends Vue {

  @State('alert') private alert!: AlertState;
  @State('vessel') private vessel!: VesselState;
  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  private options: string[] = [];
  private myvessel: string = '';

  constructor() {
    super();

  }

    private async filterFn(val: string, update: any, abort: any) {
    if (val.length < 2) {
      abort();
      return;
    }
    update(async () => {
      try {
        const roDB: Client<any> = couchService.readonlyDB;
        const queryOptions: ListOptions = {
          limit: 5,
          start_key: val.toLowerCase(),
          inclusive_end: true,
          descending: false
        };
        const vessels = await roDB.view<any>(
          'optecs_trawl',
          'all_vessel_names',
          queryOptions
        );
        this.options = vessels.rows.map((vessel) => vessel.value);
      } catch (err) {
        this.error(err);
      }
    });
  }
  private abortFilterFn() {
    // console.log('delayed filter aborted');
  }

  private async testCouch() {
    try {
      // Lack of documentation, refer to options in code:
      // https://github.com/nozzlegear/davenport/blob/master/index.ts

      const userDB: Client<any> = couchService.userDB;
      const roDB: Client<any> = couchService.readonlyDB;

      // Example:
      // const singleDoc = await userDB.get<MyDocType>('489337588b5ff50b96779b7151001b7c');
      const userStuff = await userDB.listWithDocs();
      console.log(userStuff);

      const options: ListOptions = {
        limit: 10,
        start_key: 'f',
        end_key: 'x'
      };

      const vessels = await roDB.view<any>(
        'optecs_trawl',
        'all_vessel_names',
        options
      );
      for (const v of vessels.rows) {
        console.log(v.value);
      }

    } catch (err) {
      this.error(err);
    }
  }

}
</script>

<style>

.hero-logo {
  width: 40%
}

@media screen and (orientation: portrait) {
  .hero-logo {
    width: 80%
  }
}

</style>
