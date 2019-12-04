<template>
  <div>
    <div style="text-align: right">
      <q-btn color="white" text-color="black" label="Feedback" />
      <q-icon
        name="open_in_new"
        size="md"
        v-on:click="openNewDebriefingTab"
      />
    </div>
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="trips" label="Trips" />
          <q-tab name="operations" label="Hauls" />
          <q-tab name="catch" label="Catch" />
          <q-tab name="catchSpecies" label="Catch Species" />
          <q-tab name="catchBaskets" label="Catch Baskets" />
          <q-tab name="specimens" label="Specimens" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="trips">
            <app-debriefer-trips></app-debriefer-trips>
          </q-tab-panel>

          <q-tab-panel name="operations">
            <app-debriefer-operations></app-debriefer-operations>
          </q-tab-panel>

          <q-tab-panel name="catch">
            <app-debriefer-catches></app-debriefer-catches>
          </q-tab-panel>

          <q-tab-panel name="catchSpecies">
            <app-debriefer-catch-species></app-debriefer-catch-species>
          </q-tab-panel>

          <q-tab-panel name="catchBaskets">
            <app-debriefer-catch-baskets></app-debriefer-catch-baskets>
          </q-tab-panel>

          <q-tab-panel name="specimens">
            <app-debriefer-catch-specimens></app-debriefer-catch-specimens>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
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
export default class Debriefer extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  private WcgopTrips: WcgopTrip[] = [];
  private WcgopOperations: WcgopOperation[] = [];
  private WcgopCatches: WcgopCatch[] = [];
  private WcgopCatchSpecies: WcgopCatch[] = [];
  private WcgopCatchBaskets: Basket[] = [];
  private WcgopCatchSpecimens: WcgopSpecimen[] = [];
  private pagination = { rowsPerPage: 50 };
  private tab = 'trips';

  private openNewDebriefingTab() {
    const route = '/observer-web/debriefer/data';
    window.open(route, '_blank');
  }
}
</script>