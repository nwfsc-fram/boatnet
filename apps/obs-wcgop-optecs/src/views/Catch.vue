<template>
    <q-page padding>

      <!-- <q-tree
      :nodes="catches"
      node-key="label"
      :expanded-sync="expanded"
      default-expand-all
      >
      <template v-slot="prop">
        {{ prop }}
      </template>
      </q-tree> -->

      <boatnet-summary
        currentScreen="Species"
        :current="currentCatch"
        :selectionId="currentCatch ? currentCatch.catchNum : 0"
        @add="addSpecies"
        >
        <template v-slot:table>
          <boatnet-table
            :data="getCatches"
            :settings="wcgopCatchSettings"
            @select="handleSelectCatch"
            @goTo="handleGoToWtCnt"
            :pagination="pagination"
            >
            <template v-slot:default="rowVals" @click="setCurrentCatch(rowVals.row)">

              <q-td style="width: 20px;">
                <q-icon v-if="expanded.indexOf(rowVals.row.name) === -1 && rowVals.row.children.length > 0" name="chevron_right" style="font-size: 26px;" @click="expand(rowVals.row)"></q-icon>
                <q-icon v-if="expanded.indexOf(rowVals.row.name) !== -1 && rowVals.row.children.length > 0" name="expand_more" style="font-size: 26px;" @click="collapse(rowVals.row)"></q-icon>
              </q-td>
              <q-td key="disposition" style="width: 120px">{{rowVals.row.dispositon === 'retain' ? 'R' : rowVals.row.disposition === 'discard'? "D" : ''}}</q-td>
              <q-td key="weightMethod" style="width: 120px">{{rowVals.row.weightMethod ? rowVals.row.weightMethod : ''}}</q-td>
              <q-td key="discardReason" style="width: 120px">{{ rowVals.row.discardReason ? rowVals.row.discardReason: '' }}</q-td>
              <q-td key="name">
                <span v-if="rowVals.row.children.length === 0">&nbsp;&nbsp;</span>
                {{ rowVals.row.name }}
                </q-td>
              <q-td key="weight">{{ getWeight(rowVals.row) }}</q-td>
              <q-td key="count">{{ getCount(rowVals.row) }}</q-td>
            </template>
          </boatnet-table>
        </template>
        <template v-slot:goToButtons>
          <q-btn color="primary" icon="play_arrow" label="Go To Tallies"/>
          <q-btn color="primary" icon="play_arrow" label="Go To Biospec"/>
        </template>
    </boatnet-summary>

        <!-- <q-dialog v-model="addSpeciesDialog" position="right">
            <q-card style="width: 600px; padding: 4px">
                <q-card-section>
                  <q-btn flat icon="close" style="padding: 0 0 16px 0" @click="addSpeciesDialog = false"></q-btn>
                  <div class="q-col-gutter-md row q-pa-md">

                    <div class="col q-col-gutter-md" style="padding: 0 16px">
                      <div>
                        <div><b>Disposition</b></div>
                        <q-btn v-model="currentCatch.disposition.description" :label="disposition" @click="disposition === 'Discarded'? disposition = 'Retained' : disposition = 'Discarded'" :color="disposition === 'Retained' ? 'green': 'primary' " @save="saveChanges">
                        </q-btn>
                      </div>

                      <div>
                        <boatnet-button-toggle
                        v-model="currentCatch.weightMethod"
                        title="Weight Method"
                        :value.sync="weightMethod"
                        :options="wmOptions"
                        @save="saveChanges"
                        />
                      </div>

                      <div>
                      <q-btn-dropdown
                      color="primary"
                      v-model="currentCatch.weightMethod"
                      :label="getWMLabel"
                      cover
                      style="width: 100%"
                      @save="saveChanges"
                      >
                      <q-list>
                        <q-item v-for="(option, i) of wmOptions" :key="i" clickable v-close-popup>
                          <q-item-section>
                            <q-item-label>
                              {{ option.label }} - {{ option.value}}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>

                    <boatnet-keyboard-input
                      v-model="currentCatch.weight"
                      label="Catch Weight"
                      keyboardType="numeric"
                      @save="saveChanges"
                      />

                    <boatnet-keyboard-input
                      v-model="currentCatch.count"
                      label="Total # of fish"
                      keyboardType="numeric"
                      @save="saveChanges"
                      />

                    <boatnet-button-toggle
                      v-model="currentCatch.discardReason"
                      title="Discard Reason"
                      :value.sync="discardReason"
                      :options="wmOptions"
                      description="description"
                      @save="saveChanges"
                      />

                    <div>
                      <q-btn-dropdown
                        color="primary"
                        :label="getDRLabel"
                        cover
                        style="width: 100%"
                        >
                        <q-list>
                          <q-item v-for="(option, i) of wmOptions" :key="i" clickable v-close-popup>
                            <q-item-section>
                              <q-item-label>
                                {{ option.label }} - {{ option.value}}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                    </div>
                  </div>
                  <div class="col" style="min-width: 250px; padding: 0">
                      <q-btn label="Frequent List" @click="frequentList = !frequentList" :color="frequentList ? 'primary': 'grey-5' " ></q-btn>
                      <q-input v-model="filterText" label="Search Species" style="width: 100%">
                        <template v-if="filterText">
                          <q-avatar dense icon="clear" @click="filterText = ''"></q-avatar>
                        </template>
                      </q-input>
                      <q-scroll-area style="height: 475px">
                        <q-list bordered separator>
                          <q-item
                            v-for="(option, i) of filteredSpecies"
                            :key="i"
                            :active="selectedSpecies === option"
                            activeClass="itemSelected"
                            style="cursor:pointer"
                            @click="setSelectedSpecies(option)"
                            clickable
                            >
                              {{ option.value.commonName }}
                          </q-item>
                        </q-list>
                      </q-scroll-area>
                    </div>
                </div>

                  <q-card-actions style="float: right">
                      <q-btn color="primary" label="update"></q-btn>
                  </q-card-actions>
                </q-card-section>
            </q-card>
          </q-dialog> -->

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
    private weightMethod: any = {label: "1", value: 'Weight method description' };
    private discardReason: any = {label: "1", value: 'Weight method description' };
    private selectedSpecies = null;
    private filterText = '';

    private catches: any = [
      {catchNum: 1, name: 'Basket Weight Determination', disposition: 'discard', weightMethod: 3, weight: null, count: null, discardReason: null, children: [
        {catchNum: 2, name: 'Salmon', disposition: null, weightMethod: null, weight: 10, count: 5, discardReason: 12, children: []},
        {catchNum: 3, name: 'Pacific Halibut', disposition: null, weightMethod: null, weight: 45, count: 7, discardReason: 13, children: []},
      ]},
      {catchNum: 4, name: 'Visual Spatial 1/4', disposition: 'discard', weightMethod: 15, weight: null, count: null, discardReason: null, children: [
        {catchNum: 5, name: 'Tuna', disposition: null, weightMethod: null, weight: 25, count: 8, discardReason: 6, children: []},
        {catchNum: 6, name: 'Sturgeon', disposition: null, weightMethod: null, weight: 35, count: 12, discardReason: 7, children: []},
      ]},
    ]

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

    private expanded: any = [];

    @Action('setCurrentCatch', { namespace: 'appState' })
    private setCurrentCatch: any;

    @Getter('currentCatch', { namespace: 'appState' })
    private currentCatch!: WcgopCatch;

    @Getter('currentHaul', { namespace: 'appState' })
    private currentHaul!: WcgopOperation;

    @Action('save', { namespace: 'appState' })
    private save: any;

    private pagination = {rowsPerPage: 0};

    constructor() {
        super(
        );
        this.populateSpeciesView();

        this.wcgopCatchSettings = {
        columns: [
            { name: 'action', align: 'left', label: ''},
            { name: 'disposition', required: true, label: 'R/D', align: 'left', field: 'disposition', sortable: true },
            { name: 'weightMethod', align: 'left', label: 'WM', field: (row: any) => row.observerTotalCatch.weightMethod, sortable: true },
            { name: 'discardReason', align: 'left', label: 'Discard Reason', field: 'discardReason' },
            { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
            { name: 'weight', align: 'left', label: 'Weight', field: 'weigth', sortable: true },
            { name: 'count', align: 'left', label: 'Count', field: 'count', sortable: true }
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
    console.log(this.currentCatch);
  }

private handleGoToWtCnt() {
    this.$router.push({ path: '/wtcnt'});
}

private getCatch() {
    this.wcgopCatchData = this.currentHaul.catches ? this.currentHaul.catches : []
}

private addSpecies() {
  if (this.currentCatch) {
    this.addSpeciesDialog = true;
  } else {
    // no catch row selected - create a new one
  let catchNum = 1;
  if (this.currentHaul.catches) {
      const catchNum = this.currentHaul.catches.length + 1;
  }

  const wCatch: WcgopCatch = { catchNum };
  console.log(this.currentHaul)
  if (!this.currentHaul.catches) {
    this.currentHaul.catches = []
  }
  this.currentHaul.catches!.push(wCatch);
  this.currentCatch = wCatch;
  this.addCatch = true;
  this.addSpeciesDialog = true;
  }

}

private get getWMLabel() {
  let selection = "1"
  return "Weight Method: " + selection;
}

private get getDRLabel() {
  let selection = "1"
  return "Discard Reason: " + selection;
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

  private saveChanges() {
    this.save(this.currentHaul);
    console.log(this.currentHaul)
  }

  private expand(row: any) {
    this.expanded.push(row.name)
    console.log(this.expanded);
  }

  private collapse(row: any) {
    const index = this.expanded.indexOf(row.name);

    if (index > -1) {
      this.expanded.splice(index, 1);
      console.log(this.expanded);
    }
  }

  private get getCatches() {
    let returnCatches: any = []
    for (const row of this.catches) {
      console.log(row);
      returnCatches.push(row);
      if (this.expanded.indexOf(row.name) !== -1) {
        for (const child of row.children) {
          console.log(child);
          returnCatches.push(child)
        }
      }
    }
    return returnCatches;
  }

  private getWeight(row: any) {
    if (row.weight) {
      return row.weight;
    } else {
      let weight = 0;
      for (const child of row.children) {
        weight += child.weight;
      }
      return weight;
    }
  }

  private getCount(row: any) {
    if (row.count) {
      return row.count;
    } else {
      let count = 0;
      for (const child of row.children) {
        count += child.count;
      }
      return count;
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

