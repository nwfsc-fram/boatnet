<template>
  <div>
    <div class="text-h6">Baskets</div>
    <prime-table
      :value="WcgopCatchBaskets"
      :columns="columns"
      type="Baskets"
      uniqueKey="basketWeight"
      :simple="false"
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

  private WcgopTrips: WcgopTrip[] = [];
  private WcgopOperations: WcgopOperation[] = [];
  private WcgopCatchSpecies: WcgopCatch[] = [];
  private WcgopCatchBaskets: Basket[] = [];
  private pagination = { rowsPerPage: 50 };

  private columns = [
    { field: 'tripId', header: 'Trip Id' },
    { field: 'operationNum', header: 'Haul #' },
    { field: 'catchNum', header: 'Catch #' },
    { field: 'disposition', header: 'R/D' },
    { field: 'species', header: 'Species Name' },
    { field: 'basketWeight', header: 'Basket Weight' },
    { field: 'count', header: 'Count' }
  ];

  private async getCatchBaskets() {
    this.WcgopCatchBaskets = [
      {
        tripId: 38605,
        operationNum: 1,
        catchNum: 20,
        disposition: 'D',
        species: 'Pacific Dogfish',
        basketWeight: 48.5,
        count: 8
      },
      {
        tripId: 38605,
        operationNum: 1,
        catchNum: 20,
        disposition: 'D',
        species: 'Pacific Dogfish',
        basketWeight: 50,
        count: 9
      },
      {
        tripId: 38605,
        operationNum: 1,
        catchNum: 20,
        disposition: 'D',
        species: 'Pacific Dogfish',
        basketWeight: 41
      },
      {
        tripId: 38605,
        operationNum: 1,
        catchNum: 20,
        disposition: 'D',
        species: 'Pacific Dogfish',
        basketWeight: 53
      }
    ];
  }

  private created() {
    this.getCatchBaskets();
  }
}
</script>