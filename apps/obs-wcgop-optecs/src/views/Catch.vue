<template>
    <q-page padding>
    <boatnet-summary
      currentScreen="Species"
      :current="currentCatch"
      :selectionId="currentCatch ? currentCatch.catchNum : 0"
      @add="addSpecies"
    >
    <template v-slot:table>
    <boatnet-table
        :data="wcgopCatchData"
        :settings="wcgopCatchSettings"
        @select="handleSelectCatch"
        @goTo="handleGoToWtCnt"
    >
        <template v-slot:default="rowVals">
            <q-td key="disposition">{{rowVals.row.dispositon}}</q-td>
            <q-td key="weightMethod">{{rowVals.row.weightMethod.description ? rowVals.weightMethod.description : ''}}</q-td>
            <q-td key="name">{{ rowVals.row.name }}</q-td>
            <q-td key="weight">{{ rowVals.row.weight }}</q-td>
            <q-td key="count">{{ rowVals.row.count }}</q-td>
            <q-td key="discardReason">{{ rowVals.row.discardReason }}</q-td>
          </template>
    </boatnet-table>
    </template>
          <template v-slot:goToButtons>
        <q-btn color="primary" icon="play_arrow" label="Go To Species"/>
      </template>
    </boatnet-summary>
    </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetSummary, { BoatnetHaulsSettings } from '@boatnet/bn-common';
import { Action, Getter } from 'vuex-class';
import {
  WcgopCatch,
  WcgopCatchTypeName,
  WcgopOperation
} from '@boatnet/bn-models';

import moment from 'moment';

Vue.component(BoatnetSummary);

@Component
export default class Catch extends Vue {
    private wcgopCatchSettings: any;
    private wcgopCatchData: any[] = [];
    private addCatch = false;

  @Action('setCurrentCatch', { namespace: 'appState' })
  private setCurrentCatch: any;
  @Getter('currentCatch', { namespace: 'appState' })
  private currentCatch!: WcgopCatch;
  @Getter('currentHaul', { namespace: 'appState' })
  private currentHaul!: WcgopOperation;

    constructor() {
        super();
        this.wcgopCatchSettings = {
        columns: [
            {
            name: 'disposition',
            required: true,
            label: 'R/D',
            align: 'left',
            field: 'disposition',
            sortable: true
            },
            {
            name: 'weightMethod',
            align: 'center',
            label: 'WM',
            field: (row: any) => row.observerTotalCatch.weightMethod,
            sortable: true
            },
            {
            name: 'name',
            align: 'center',
            label: 'Name',
            field: 'name',
            sortable: true
            },
            {
            name: 'weight',
            align: 'center',
            label: 'Weight',
            field: 'weigth',
            sortable: true
            },
            {
            name: 'count',
            align: 'center',
            label: 'Count',
            field: 'count',
            sortable: true
            },
            {
            name: 'discardReason',
            align: 'center',
            label: 'Discard Reason', // TODO: this needs logic to get first and last
            field: 'discardReason'
            }
        ]
    };
    }

private handleSelectCatch(wCatch: any) {
    if (wCatch) {
      this.setCurrentCatch(wCatch.doc);
    } else {
      this.setCurrentCatch(undefined);
    }
  }

private handleGoToWtCnt() {
    this.$router.push({ path: '/wtcnt'});
}

private getCatch() {
    this.wcgopCatchData = this.currentHaul.catches ? this.currentHaul.catches : []
}

  private addSpecies() {
    let catchNum = 1;
    if (this.currentHaul.catches) {
        const catchNum = this.currentHaul.catches.length + 1;
    }

    const wCatch: WcgopCatch = { catchNum };
    this.setCurrentCatch(wCatch);
    this.addCatch = true;
  }

}
</script>
