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
          <q-btn color="primary" icon="play_arrow" label="Go To Biospecimens"/>
        </template>
    </boatnet-summary>

        <q-dialog v-model="addSpeciesDialog" position="right">
            <q-card style="width: 500px">
                <q-card-section>
                  <q-btn flat icon="close" style="padding: 0 0 16px 0" @click="addSpeciesDialog = false"></q-btn>
                  <div class="q-col-gutter-md row q-pa-md">
                    <div class="col" style="min-width: 250px; padding: 0">
                      <q-btn label="Frequent List" @click="frequentList = !frequentList" :color="frequentList ? 'primary': 'grey-5' " ></q-btn>
                    </div>
                    <div class="col" style="padding: 0 16px">
                      <q-btn :label="disposition" @click="disposition === 'Discarded'? disposition = 'Retained' : disposition = 'Discarded'" :color="disposition === 'Retained' ? 'green': 'primary' "></q-btn>
                    </div>
                  </div>
                  <div class="q-col-gutter-md row q-pa-md">
                    <div class="col" style="min-width: 250px; padding: 0">
                      <q-input v-model="filterText" label="Search Species" style="width: 100%">
                        <template v-if="filterText">
                          <q-avatar dense icon="clear" @click="filterText = ''"></q-avatar>
                        </template>
                      </q-input>
                      <!-- <q-select
                      label="Species"
                      :options="options"
                      use-input
                      :option-label="opt => opt.value.commonName"
                      option-value="_id"
                      fill-input
                      hide-selected
                      clearable
                      input-debounce="50"
                      @filter="filterFn"
                      >
                      </q-select> -->
                      <q-scroll-area style="height: 515px">
                        <q-list bordered separator>
                          <q-item
                            v-for="(option, i) of filteredSpecies"
                            :key="i"
                            dense
                            :active="selectedSpecies === option"
                            activeClass="itemSelected"
                            style="cursor:pointer"
                            >
                            <div @click="setSelectedSpecies(option)">
                              {{ option.value.commonName }}
                            </div>
                          </q-item>
                        </q-list>
                      </q-scroll-area>
                    </div>

                  <div class="col">
                    <boatnet-button-toggle
                      title="Weight Method"
                      :value.sync="weightMethod"
                      :options="wmOptions"
                      description="description"
                      />
                    <q-input label="Catch Weight"></q-input>
                    <q-input label="Total # of fish"></q-input>
                    <boatnet-button-toggle
                      title="Discard Reason"
                      :value.sync="weightMethod"
                      :options="wmOptions"
                      description="description"
                      />
                    <div style="margin-top: 50px; text-align: center">
                      <q-btn color="primary" label="update"></q-btn>
                    </div>
                  </div>

                </div>
                </q-card-section>
            </q-card>
          </q-dialog>

    </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetSummary, { BoatnetHaulsSettings } from '@boatnet/bn-common';
import { Action, Getter } from 'vuex-class';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
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
    private addSpeciesDialog = false;
    private frequentList = false;
    private disposition = 'Retained';
    private speciesList = [];
    private options: any[] = [];
    private weightMethod: any = 1;
    private selectedSpecies = null;
    private filterText = '';

    private wmOptions = [
                        {label: "1", value: 'Weight method description' },
                        {label: "3", value: 'Weight method description' },
                        {label: "5", value: 'Weight method description' },
                        {label: "6", value: 'Weight method description' },
                        {label: "7", value: 'Weight method description' },
                        {label: "8", value: 'Weight method description' },
                        {label: "14", value: 'Weight method description' },
                        {label: "15", value: 'Weight method description' },
                        ]

    @Action('setCurrentCatch', { namespace: 'appState' })
    private setCurrentCatch: any;
    @Getter('currentCatch', { namespace: 'appState' })
    private currentCatch!: WcgopCatch;
    @Getter('currentHaul', { namespace: 'appState' })
    private currentHaul!: WcgopOperation;

    constructor() {
        super(
        );
        this.populateSpeciesView();

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

public async populateSpeciesView() {
const db = pouchService.db;
const queryOptions = {
    include_docs: true
};

const species = await db.query(
    pouchService.lookupsDBName,
    'optecs_trawl/all_tally_species',
    queryOptions
);

this.speciesList = species.rows;
console.log(this.speciesList);
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
  this.addSpeciesDialog = true;
}



private async filterFn(val: string, update: any, abort: any) {
      update(async () => {
        const valUpper = val.toUpperCase();
        this.options = this.speciesList
          .filter((s: any) => {
            return (
              s.key.startsWith(valUpper) ||
              s.value.commonName.toUpperCase().indexOf(valUpper) > -1
            );
          })
          .map((s: any) => {
            return {
              label: s.key + ': ' + s.value.commonName,
              ...s
            };
          });
      });
    }

private setSelectedSpecies(species: any) {
  this.selectedSpecies = species;
}


private get filteredSpecies() {
  if (this.filterText.length > 0) {
    return this.speciesList.filter( (species: any) =>
            species.value.commonName.toUpperCase().includes( this.filterText.toUpperCase()) || species.value.scientificName.toUpperCase().includes( this.filterText.toUpperCase()) || species === this.selectedSpecies
            );
    } else {
      return this.speciesList;
        }
}

}
</script>

<style scoped>
  .itemSelected {
    background-color: #027BE3;
    color: white;
  }
</style>

