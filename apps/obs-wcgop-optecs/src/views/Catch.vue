<template>
  <div>
    <q-page padding>
      <!-- <q-toggle v-model="useActiveHaul" label="Use Active Haul"></q-toggle> -->

      <!-- <q-tree
      :nodes="catches"
      node-key="label"
      :expanded-sync="expanded"
      default-expand-all
      >
      <template v-slot="prop">
        {{ prop }}
      </template>
      </q-tree>-->
      <div style="float: left;">
        <span v-if="expanded.length < currentHaul.catches[0].children.length">
          <q-btn color="primary" @click="expandAll">Expand All</q-btn>&nbsp;
        </span>
        <q-btn color="grey" @click="collapseAll" v-if="expanded.length > 0">Collapse All</q-btn>
      </div>
      <br />
      <br />
      <boatnet-summary
        currentScreen="Species"
        :current="currentCatch"
        :hasData="hasData"
        :selectionId="currentCatch ? currentCatch.catchNum : 0"
        @goTo="handleGoToWtCnt"
        @add="addSpecies"
        @edit="editSpecies"
        @remove="deleteSpecies"
        @move="modifySpecies"
      >
        <template v-slot:table>
          <boatnet-table
            :data="getCatches"
            :settings="wcgopCatchSettings"
            @select="handleSelectCatch"
            :showBottom="showBottom"
            row-key="catchNum"
            :selection.sync="selectedCatch"
          >
            <template v-slot:default="rowVals">
              <q-td style="width: 20px;">
                <q-icon
                  v-if="expanded.indexOf(rowVals.row.catchNum) === -1 && rowVals.row.children.length > 0"
                  name="chevron_right"
                  style="font-size: 26px;"
                  @click="expand(rowVals.row)"
                ></q-icon>
                <q-icon
                  v-if="expanded.indexOf(rowVals.row.catchNum) !== -1 && rowVals.row.children.length > 0"
                  name="expand_more"
                  style="font-size: 26px;"
                  @click="collapse(rowVals.row)"
                ></q-icon>
              </q-td>
              <q-td key="disposition" style="width: 60px">{{ getDisposition(rowVals.row) }}</q-td>
              <q-td
                key="weightMethod"
                style="width: 60px"
              >{{rowVals.row.weightMethod ? rowVals.row.weightMethod.lookupVal : ''}}</q-td>
              <q-td
                key="discardReason"
                style="width: 60px"
              >{{ rowVals.row.discardReason ? rowVals.row.discardReason: '' }}</q-td>
              <q-td key="name">
                <span v-if="rowVals.row.children.length === 0">&nbsp;&nbsp;</span>
                {{ rowVals.row.catchContent.type === 'grouping' ? rowVals.row.weightMethod.description : rowVals.row.catchContent.alias }}
              </q-td>
              <q-td key="weight">{{ getWeight(rowVals.row) }}</q-td>
              <q-td key="count">{{ getCount(rowVals.row) }}</q-td>
            </template>
          </boatnet-table>
        </template>
        <template v-slot:goToButtons>
          <q-btn color="primary" icon="play_arrow" label="Go To Tallies" />
          <q-btn color="primary" icon="play_arrow" label="Go To Biospec" />
        </template>
      </boatnet-summary>
    </q-page>

    <q-drawer
      side="right"
      v-model="drawerRight"
      bordered
      :width="500"
      :breakpoint="500"
      content-class="bg-grey-3"
    >
      <q-scroll-area class="fit">
        <div style="width: 500px; padding: 10px" v-if="newSpecies">
          <q-btn flat icon="close" style="padding: 0 0 16px 0" @click="drawerRight = false"></q-btn>
          <div class="text-h6" style="float: right; padding-right: 10px">ADD SPECIES</div>
          <br />

          <div class="row">
            <div class="col q-pa-md">
              <b>Disposition</b>
              <br />
              <q-btn
                v-model="catchModel.disposition"
                :label="catchModel.disposition.description"
                @click="catchModel.disposition.description === 'Discarded' ?
                                  catchModel.disposition.description = 'Retained' :
                                  catchModel.disposition.description = 'Discarded'"
                :color="catchModel.disposition.description === 'Retained' ? 'grey-8': 'primary' "
              ></q-btn>

              <br />
              <br />
              <b>Weight Method</b>
              <div style="border: 1px solid #B5B5B5; border-radius: 4px">
                <q-btn-toggle
                  v-model="catchModel.weightMethod"
                  :options="getWeightMethods.slice(0,4)"
                  :value.sync="weightMethod"
                  spread
                  unelevated
                />
                <q-btn-toggle
                  v-model="catchModel.weightMethod"
                  :options="getWeightMethods.slice(4,8)"
                  :value.sync="weightMethod"
                  :spread="getWeightMethods.slice(4,8).length > 1"
                  unelevated
                />
              </div>

              <p>{{ weightMethodLookup[catchModel.weightMethod] ? weightMethodLookup[catchModel.weightMethod].value : ''}}</p>

              <div
                v-if="catchModel.weightMethod && ['6','7','14'].includes(catchModel.weightMethod)"
              >
                <div v-if="selectedSpecies.length <= 1">
                  <b>Catch Weight</b>
                  <span>(lbs)</span>
                  <boatnet-keyboard-input
                    v-model="catchModel.weight"
                    keyboardType="numeric"
                    :readonly="selectedSpecies.length > 1"
                  />
                  <b>Total # of fish</b>
                  <boatnet-keyboard-input
                    v-model="catchModel.count"
                    keyboardType="numeric"
                    :readonly="selectedSpecies.length > 1"
                  />
                </div>

                <div v-else>(Catch Weight and Total # of fish can only be added one at a time.)</div>
              </div>
              <boatnet-custom-keyboard
                @output="outputKey($event)"
                @bksp="filterText = filterText.slice(0, -1)"
                @clear="filterText = ''"
              ></boatnet-custom-keyboard>
            </div>

            <div class="col q-pa-md" style="padding-top: 37px">
              <q-btn
                label="Frequent List"
                @click="frequentList = !frequentList"
                :color="frequentList ? 'primary': 'grey-5'"
              ></q-btn>

              <br />
              <br />
              <br />
              <!-- <boatnet-keyboard-input
                  v-model="filterText"
                  keyboardType="normal"
                  :value.sync="filterText"
                  label="Search Species"
                >
              </boatnet-keyboard-input>-->
              <q-input v-model="filterText" :value.sync="filterText" label="Search Species">
                <template v-slot:append>
                  <q-icon name="close" @click="filterText = ''" class="cursor-pointer" />
                </template>
              </q-input>

              <q-scroll-area style="height: 435px">
                <q-list bordered separator>
                  <q-item
                    v-for="(option, i) of filteredSpecies"
                    :key="i"
                    :active="selectedSpecies.indexOf(option) !== -1"
                    activeClass="itemSelected"
                    style="cursor:pointer; font-weight: bold"
                    @click="setSelectedSpecies(option)"
                    clickable
                  >{{ option.value.commonName }}</q-item>
                </q-list>
              </q-scroll-area>
            </div>
          </div>

          <div class="q-pa-md" style="float: right;">
            <q-btn
              color="primary"
              label="add"
              @click="updateCatch"
              :disabled="!catchModel.weightMethod || !catchModel.disposition || selectedSpecies.length < 1"
            ></q-btn>
            <br />
            <br />
          </div>

          <br />
        </div>

        <div style="width: 500px; padding: 10px" v-if="currentCatch && speciesEditing">
          <q-btn flat icon="close" style="padding: 0 0 16px 0" @click="drawerRight = false"></q-btn>
          <div class="text-h6" style="float: right; padding-right: 10px">EDIT SPECIES</div>
          <br />

          <div class="q-pa-md" style="width: 100%">
            <div class="text-h6">{{ currentCatch.catchContent.alias }}</div>
            <br />
            <div
              v-if="speciesModel.disposition && speciesModel.disposition.description === 'Discarded'"
            >
              <b>Discard Reason</b>
              <br />
              <q-btn-toggle
                v-model="speciesModel.discardReason"
                :options="discardReasonOptions"
                :value.sync="speciesModel.discardReason"
                spread
              />
              <p>{{ speciesModel.discardReason ? discardReasonLookup[speciesModel.discardReason].value : '-'}}</p>
            </div>
            <br />
            <div
              v-if="speciesModel.weightMethod && ['6','7','14'].includes(speciesModel.weightMethod.lookupVal)"
            >
              <b>Catch Weight</b>
              <span>({{speciesModel.weight.units}})</span>
              <boatnet-keyboard-input
                v-model="speciesModel.weight.value"
                keyboardType="numeric"
                :value.sync="speciesModel.weight.value"
              />
              <br />
              <b>Total # of fish</b>
              <boatnet-keyboard-input
                v-model="speciesModel.count"
                keyboardType="numeric"
                :value.sync="speciesModel.count"
              />
            </div>

            <div
              style="float: right;"
              v-if="(speciesModel.disposition && speciesModel.disposition.description === 'Discarded') || (speciesModel.weightMethod && ['6','7','14'].includes(speciesModel.weightMethod.lookupVal))"
            >
              <br />
              <br />
              <q-btn color="primary" label="update" @click="updateSpecies"></q-btn>
              <br />
              <br />
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="moveDialog">
      <q-card style="width: 50%">
        <div v-if="currentCatch">
          <div v-if="speciesModel.disposition">
            <q-card>
              <q-card-section class="row items-center">
                <q-avatar icon="fas fa-exchange-alt" color="primary" text-color="white" />
                <div
                  class="text-h6 q-pa-md"
                >{{ currentCatch.catchContent.alias }} - Discard Reason: {{ currentCatch.discardReason ? currentCatch.discardReason : 'N/A' }}</div>
                <div class="q-pa-md">
                  <b>Disposition</b>
                  <br />
                  <q-btn
                    v-model="speciesModel.disposition"
                    :label="speciesModel.disposition.description"
                    @click="speciesModel.disposition.description === 'Discarded' ?
                                  speciesModel.disposition.description = 'Retained' :
                                  speciesModel.disposition.description = 'Discarded'"
                    :color="speciesModel.disposition.description === 'Retained' ? 'grey-8': 'primary' "
                  ></q-btn>
                </div>

                <div>
                  <b>Weight Method</b>
                  <div style="border: 1px solid #B5B5B5; border-radius: 4px">
                    <q-btn-toggle
                      v-model="speciesModel.weightMethod"
                      :options="getWeightMethods"
                      :value.sync="weightMethod"
                      spread
                      unelevated
                    />
                  </div>
                </div>
                <p
                  style="padding-left: 140px"
                >{{ weightMethodLookup[speciesModel.weightMethod] ? weightMethodLookup[speciesModel.weightMethod].value : ''}}</p>
              </q-card-section>
              <q-card-section>
                <q-card-actions align="right">
                  <q-btn flat label="Cancel" color="primary" @click="resetModify" />
                  <q-btn flat label="Move" color="primary" @click="moveSpecies" />
                </q-card-actions>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- <tree-table :value="nodes">
        <column field="name" header="Name" :expander="true"></column>
        <column field="size" header="Size"></column>
        <column field="type" header="Type"></column>
      </tree-table>

      <prime-input
      type="text" label="test prime text input" v-model="testText">

    </prime-input>-->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetSummary, { BoatnetHaulsSettings } from '@boatnet/bn-common';
import { Action, Getter } from 'vuex-class';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import {
  WcgopCatch,
  WcgopCatchTypeName,
  WcgopOperation,
  WcgopTrip,
  TaxonomyAlias
} from '@boatnet/bn-models';

import moment from 'moment';
import { freemem } from 'os';
import { disconnect } from 'cluster';
import { get } from 'http';

import TreeTable from 'primevue/treetable';
Vue.component('TreeTable', TreeTable);

// import Column from 'primevue/column';
// Vue.component('Column', Column);

// import InputText from 'primevue/inputtext';
// Vue.component('PrimeInput', InputText);

Vue.component(BoatnetSummary);

@Component
export default class Catch extends Vue {
  @Prop() public char!: string;

  private wcgopCatchSettings: any;
  private wcgopTrawlDiscardedWeightMethods: any[] = [
    '1',
    '3',
    '5',
    '6',
    '8',
    '9',
    '14',
    '15',
    '19'
  ];
  private wcgopTrawlRetainedWeightMethods: any[] = [
    '1',
    '3',
    '6',
    '7',
    '9',
    '14',
    '15',
    '19'
  ];
  private wcgopFixedGearWeightMethods: any[] = ['6', '9', '13', '14', '19'];
  private wcgopCatchData: any[] = [];
  private frequentList = false;
  private disposition = 'Retained';
  private speciesList: any[] = [];
  private options: any[] = [];
  private selectedSpecies: any[] = [];
  private filterText = '';
  // private useActiveHaul = false;
  private discardReason: any = [];
  private count: number = 0;
  private weight: number = 0;
  private weightMethod: any = [];
  private showBottom = true;
  private selectedCatch: any = [];
  private newSpecies = false;
  private speciesEditing = false;

  private drawerRight = false;

  private moveDialog = false;
  private moveModify = false;
  private deleteModify = false;

  private catchModel: any = {
    disposition: { description: 'Discarded' }
  };

  private speciesModel: WcgopCatch = {
    weight: { units: 'lbs', value: 0 },
    count: 0
  };

  private activeWM = [1, 3, 5, 6, 7, 8, 14, 15];

  private weightMethodOptions: any[] = [];

  private weightMethodLookup: any;
  private frequentSpecies: any[] = [];

  // private weightMethodLookup: any = {
  //   1: 'Actual Weight',
  //   3: 'Basket Weight Determination',
  //   5: 'OTC minus Retained',
  //   6: 'Other',
  //   7: 'Vessel Estimate',
  //   8: 'Extrapolation',
  //   14: 'Visual Estimate',
  //   15: 'Visual Spatial'
  // };

  private drOptions = [];

  private discardReasonOptions: any[] = [];

  private discardReasonLookup: any;

  private expanded: any = [];

  // private testText: string = '';

  // private nodes = {
  //   root: [
  //     {
  //       key: '0',
  //       data: {
  //         name: 'Applications',
  //         size: '100kb',
  //         type: 'Folder'
  //       },
  //       children: [
  //         {
  //           key: '0-0',
  //           data: {
  //             name: 'Vue',
  //             size: '25kb',
  //             type: 'Folder'
  //           },
  //           children: [
  //             {
  //               key: '0-0-0',
  //               data: {
  //                 name: 'Vue.app',
  //                 size: '10kb',
  //                 type: 'Application'
  //               }
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // };

  @Action('setCurrentCatch', { namespace: 'appState' })
  private setCurrentCatch: any;

  @Getter('currentCatch', { namespace: 'appState' })
  private currentCatch!: WcgopCatch;

  @Getter('currentHaul', { namespace: 'appState' })
  private currentHaul!: WcgopOperation;

  @Getter('currentTrip', { namespace: 'appState' })
  private currentTrip!: WcgopTrip;

  @Action('save', { namespace: 'appState' })
  private save: any;

  constructor() {
    super();
    this.populateSpeciesView();

    this.wcgopCatchSettings = {
      rowKey: 'catchNum',
      columns: [
        { name: 'action', align: 'left', label: '' },
        {
          name: 'disposition',
          required: true,
          label: 'R/D',
          align: 'left',
          field: 'disposition'
        },
        {
          name: 'weightMethod',
          align: 'left',
          label: 'WM',
          field: (row: any) => row.observerTotalCatch.weightMethod
        },
        {
          name: 'discardReason',
          align: 'left',
          label: 'Discard Reason',
          field: 'discardReason'
        },
        { name: 'name', align: 'left', label: 'Name', field: 'name' },
        { name: 'weight', align: 'left', label: 'Weight', field: 'weigth' },
        { name: 'count', align: 'left', label: 'Count', field: 'count' }
      ]
    };
  }

  public async populateSpeciesView() {
    const db = pouchService.db;
    const queryOptions = {
      include_docs: true
    };

    const taxAlias = await db.query(
      pouchService.lookupsDBName,
      'optecs_trawl/all_taxonomy_alias',
      queryOptions
    );

    for (const row of taxAlias.rows) {
      if (row.value.commonName && row.value.scientificName) {
        this.speciesList.push(row);
      }
    }
  }

  private handleSelectCatch(wCatch: any, preserveSelection: boolean = false) {
    if (!preserveSelection) {
      this.unselectRow();
    }
    let wm;
    let disp;
    if (
      wCatch &&
      wCatch.catchContent &&
      wCatch.catchContent.type === 'taxonomy-alias'
    ) {
      // for (const grouping of this.currentHaul.catches![0].children!) {
      //   for (const species of grouping.children!) {
      //     const txnmyContent = species.catchContent as TaxonomyAlias;
      //     if (txnmyContent.alias === wCatch.catchContent.alias) {
      //       wm = grouping.weightMethod;
      //       disp = grouping.disposition;
      //     }
      //   }
      // }
      this.drawerRight = false;
      for (const grouping of this.currentHaul.catches![0].children!) {
        for (const species of grouping.children!) {
          if (species.catchNum === wCatch.catchNum) {
            wm = grouping.weightMethod;
            disp = grouping.disposition;
          }
        }
      }

      this.setCurrentCatch(wCatch);
      if (wm) {
        Vue.set(this.speciesModel, 'weightMethod', wm);
      }
      if (disp) {
        Vue.set(this.speciesModel, 'disposition', disp);
      }

      this.speciesModel.weight = this.currentCatch.weight
        ? JSON.parse(JSON.stringify(this.currentCatch.weight))
        : { units: 'lbs', value: 0 };
      this.speciesModel.count = this.currentCatch.count
        ? JSON.parse(JSON.stringify(this.currentCatch.count))
        : 0;

      Vue.set(this.speciesModel, 'discardReason', '');
      this.speciesModel.discardReason = this.currentCatch.discardReason
        ? JSON.parse(JSON.stringify(this.currentCatch.discardReason))
        : '';
      this.speciesEditing = true;
      this.newSpecies = false;
      // if (wm) {
      //   Vue.set(this.currentCatch, 'weightMethod', wm);
      // }
      // if (dist) {
      //   Vue.set(this.currentCatch, 'disposition', dist);
      // }
    } else {
      if (
        wCatch &&
        wCatch.catchContent &&
        wCatch.catchContent.type === 'grouping'
      ) {
        // this.catchModel.weightMethod = parseInt(JSON.parse(JSON.stringify(wCatch.weightMethod.lookupVal)));
        // Vue.set(this.catchModel,
        //         'weightMethod',
        //         parseInt(JSON.parse(JSON.stringify(wCatch.weightMethod.lookupVal)), 10)
        //         );
        this.catchModel = {
          disposition: { description: wCatch.disposition.description }
        };
        Vue.set(
          this.catchModel,
          'dispostion',
          JSON.parse(JSON.stringify(wCatch.disposition))
        );
        // this.catchModel.disposition = JSON.parse(JSON.stringify(wCatch.disposition));
        // this.weightMethod = parseInt(JSON.parse(JSON.stringify(wCatch.weightMethod.lookupVal)), 10);
        Vue.set(
          this.catchModel,
          'weightMethod',
          JSON.parse(JSON.stringify(wCatch.weightMethod.lookupVal))
        );
      }
      this.setCurrentCatch(undefined);
      this.speciesEditing = false;
      this.newSpecies = true;
    }
  }

  private handleGoToWtCnt() {
    this.$router.push({ path: '/wtcnt' });
  }

  private getCatch() {
    this.wcgopCatchData = this.currentHaul.catches
      ? this.currentHaul.catches
      : [];
  }

  private addSpecies() {
    this.setCurrentCatch(undefined);
    this.newSpecies = true;
    this.drawerRight = true;
  }

  private editSpecies() {
    if (this.currentCatch) {
      Vue.set(
        this.speciesModel,
        'weight',
        JSON.parse(JSON.stringify(this.currentCatch.weight))
      );
      Vue.set(
        this.speciesModel,
        'count',
        JSON.parse(JSON.stringify(this.currentCatch.count))
      );
      Vue.set(
        this.speciesModel,
        'discardReason',
        JSON.parse(JSON.stringify(this.currentCatch.discardReason))
      );
      // this.speciesModel.weight = JSON.parse(JSON.stringify(this.currentCatch.weight));
      // this.speciesModel.count = JSON.parse(JSON.stringify(this.currentCatch.count));
      // this.speciesModel.discardReason = JSON.parse(JSON.stringify(this.currentCatch.discardReason));

      this.speciesEditing = true;
      this.drawerRight = true;
    }
  }

  private get getWMLabel() {
    const selection = '1';
    return 'Weight Method: ' + selection;
  }

  private get getDRLabel() {
    const selection = '1';
    return 'Discard Reason: ' + selection;
  }

  private get hasData() {
    if (
      this.currentCatch &&
      ((this.currentCatch.children && this.currentCatch.children.length > 0) ||
        (this.currentCatch.baskets && this.currentCatch.baskets.length > 0))
    ) {
      return true;
    } else {
      return false;
    }
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
    if (this.selectedSpecies.indexOf(species) === -1) {
      this.selectedSpecies.push(species);
    } else {
      this.selectedSpecies.splice(this.selectedSpecies.indexOf(species), 1);
    }
  }

  private modifySpecies() {
    let activeGrouping: any;
    for (const grouping of this.currentHaul.catches![0].children!) {
      for (const species of grouping.children!) {
        if (species === this.currentCatch) {
          activeGrouping = grouping;
        }
      }
    }
    Vue.set(
      this.speciesModel,
      'disposition',
      JSON.parse(JSON.stringify(activeGrouping.disposition))
    );
    Vue.set(
      this.speciesModel,
      'weightMethod',
      JSON.parse(JSON.stringify(activeGrouping.weightMethod.lookupVal))
    );

    this.moveDialog = true;
  }

  private moveSpecies() {
    const speciesToMove = JSON.parse(JSON.stringify(this.currentCatch));

    this.catchModel = speciesToMove;
    this.catchModel.disposition = JSON.parse(
      JSON.stringify(this.speciesModel.disposition)
    );
    this.catchModel.weightMethod = JSON.parse(
      JSON.stringify(this.speciesModel.weightMethod)
    );

    setTimeout(() => {
      this.moveModify = true;
    }, 100);
    this.updateCatch();

    for (const grouping of this.currentHaul.catches![0].children!) {
      for (const species of grouping.children!) {
        if (species.catchNum === speciesToMove.catchNum) {
          this.setCurrentCatch(species).then(this.deleteSpecies());
        }
      }
    }

    // setTimeout( () => {
    //   console.log(this.currentCatch);
    //   this.deleteSpecies();
    // }, 100);

    this.resetModify();
  }

  private deleteSpecies() {
    for (const grouping of this.currentHaul.catches![0].children!) {
      for (const species of grouping.children!) {
        if (species === this.currentCatch) {
          console.log(species);
          console.log(this.currentCatch);
          grouping.children!.splice(grouping.children!.indexOf(species), 1);
        }
      }
    }
    for (const grouping of this.currentHaul.catches![0].children!) {
      if (grouping.children!.length === 0) {
        this.currentHaul.catches![0].children!.splice(
          this.currentHaul.catches![0].children!.indexOf(grouping),
          1
        );
      }
    }

    this.saveChanges();
    this.resetModify();
    this.speciesEditing = false;
  }

  private get filteredSpecies() {
    function compare(a: any, b: any) {
      const commonNameA = a.value.commonName.toUpperCase();
      const commonNameB = b.value.commonName.toUpperCase();

      let comparison = 0;
      if (commonNameA > commonNameB) {
        comparison = 1;
      } else if (commonNameA < commonNameB) {
        comparison = -1;
      }
      return comparison;
    }

    let returnSpecies: any[] = this.speciesList.filter((species: any) => {
      return this.selectedSpecies.indexOf(species) === -1;
    });

    if (this.frequentList) {
      returnSpecies = this.speciesList.filter((species: any) => {
        return (
          this.frequentSpecies.includes(
            species.value.commonName.toUpperCase()
          ) && this.selectedSpecies.indexOf(species) === -1
        );
      });
    }

    if (this.filterText.length > 0) {
      returnSpecies = returnSpecies.filter(
        (species: any) =>
          (species.value.commonName
            .toUpperCase()
            .includes(this.filterText.toUpperCase()) ||
            species.value.scientificName
              .toUpperCase()
              .includes(this.filterText.toUpperCase())) &&
          this.selectedSpecies.indexOf(species) === -1
      );
    }

    return this.selectedSpecies.concat(returnSpecies.sort(compare));
  }

  private updateCatch() {
    let newGrouping = false;
    this.setCurrentCatch(undefined);

    const addWeightMethod: any = this.catchModel.weightMethod;
    const addDisposition: any = this.catchModel.disposition;

    if (this.currentHaul.catches![0].children) {
      for (const grouping of this.currentHaul.catches![0].children) {
        if (
          grouping.weightMethod!.lookupVal === this.catchModel.weightMethod &&
          grouping.disposition!.description === addDisposition.description
        ) {
          this.setCurrentCatch(grouping);
        }
      }
    }

    setTimeout(() => {
      if (!this.currentCatch) {
        const grouping = {
          catchNum: this.getNewCatchNum(),
          catchContent: {
            type: 'grouping',
            name: JSON.parse(
              JSON.stringify(
                this.weightMethodLookup[this.catchModel.weightMethod].value
              )
            )
          },
          disposition: JSON.parse(JSON.stringify(addDisposition)),
          weightMethod: {
            lookupVal: JSON.parse(JSON.stringify(this.catchModel.weightMethod)),
            description: JSON.parse(
              JSON.stringify(
                this.weightMethodLookup[this.catchModel.weightMethod].value
              )
            ),
            value: JSON.parse(JSON.stringify(this.catchModel.weightMethod))
          },
          weight: { units: 'lbs', value: 0 },
          count: 0,
          children: []
        };
        newGrouping = true;
        this.currentHaul.catches![0].children!.unshift(grouping);
        // this.saveChanges();
      }

      for (const grouping of this.currentHaul.catches![0].children!) {
        if (
          grouping.weightMethod!.lookupVal === addWeightMethod &&
          grouping.disposition!.description === addDisposition.description
        ) {
          this.setCurrentCatch(grouping);
        }
      }

      if (this.moveModify) {
        const newSpeciesCatch: WcgopCatch = {
          catchNum: this.getNewCatchNum(),
          catchContent: JSON.parse(
            JSON.stringify(this.catchModel.catchContent)
          ),
          disposition: undefined,
          weightMethod: undefined,
          discardReason: '',
          weight: { units: 'lbs', value: 0 },
          count: 0,
          children: []
        };
        if (this.catchModel.discardReason) {
          newSpeciesCatch.discardReason = JSON.parse(
            JSON.stringify(this.catchModel.discardReason)
          );
        }
        if (this.catchModel.weight) {
          newSpeciesCatch.weight = JSON.parse(
            JSON.stringify(this.catchModel.weight)
          );
        }
        if (this.catchModel.count) {
          newSpeciesCatch.count = JSON.parse(
            JSON.stringify(this.catchModel.count)
          );
        }
        this.currentCatch.children!.unshift(newSpeciesCatch);
        this.saveChanges();
      } else {
        for (const species of this.selectedSpecies) {
          const newSpeciesCatch: WcgopCatch = {
            catchNum: this.getNewCatchNum(),
            catchContent: JSON.parse(JSON.stringify(species.doc)),
            disposition: undefined,
            weightMethod: undefined,
            discardReason: '',
            weight: { units: 'lbs', value: 0 },
            count: 0,
            children: []
          };

          if (this.selectedSpecies.length === 1 && this.catchModel.weight) {
            newSpeciesCatch.weight = {
              value: JSON.parse(JSON.stringify(this.catchModel.weight)),
              units: 'lbs'
            };
          }
          if (this.selectedSpecies.length === 1 && this.catchModel.count) {
            newSpeciesCatch.count = JSON.parse(
              JSON.stringify(this.catchModel.count)
            );
          }
          this.currentCatch.children!.unshift(newSpeciesCatch);
        }
        this.saveChanges();
      }

      this.selectedSpecies = []; // reset selected species.
      // reset catchModel, but retain last disposition and weightMethod
      // this.catchModel = {}
      // Vue.set(this.catchModel, 'disposition', addDisposition);
      // Vue.set(this.catchModel, 'weightMethod', addWeightMethod);
      this.expanded = [];
      this.expand(this.currentCatch);
      this.selectedCatch = this.currentCatch;
      this.handleSelectCatch(this.currentCatch, !newGrouping);

      if (newGrouping) {
        setTimeout(() => {
          this.selectRow();
        }, 100);
      }
    }, 100);

    this.getFrequentSpecies();
  }

  private selectRow() {
    const tableBody = document
      .getElementsByTagName('table')[0]
      .getElementsByTagName('tbody')[0];
    for (const row of tableBody.getElementsByTagName('tr')) {
      row.classList.remove('selected');
    }
    tableBody.getElementsByTagName('tr')[0].classList.add('selected');
  }

  private unselectRow() {
    const tableBody = document
      .getElementsByTagName('table')[0]
      .getElementsByTagName('tbody')[0];
    for (const row of tableBody.getElementsByTagName('tr')) {
      row.classList.remove('selected');
    }
  }

  private updateSpecies() {
    const weight = this.speciesModel.weight as number;
    if (weight) {
      this.currentCatch.weight = JSON.parse(JSON.stringify(weight));
    }
    if (this.speciesModel.count) {
      this.currentCatch.count = JSON.parse(
        JSON.stringify(this.speciesModel.count)
      );
    }
    if (this.speciesModel.discardReason) {
      Vue.set(
        this.currentCatch,
        'discardReason',
        JSON.parse(JSON.stringify(this.speciesModel.discardReason))
      );
      // this.currentCatch.discardReason = JSON.parse(JSON.stringify(this.speciesModel.discardReason));
    }
    this.saveChanges();

    Vue.set(this.speciesModel, 'weight', { units: 'lbs', value: 0 });
    Vue.set(this.speciesModel, 'count', 0);
    Vue.set(
      this.speciesModel,
      'discardReason',
      JSON.parse(JSON.stringify(this.currentCatch.discardReason))
    );
  }

  private getNewCatchNum() {
    let catchNum: number = 0;
    for (const wCatch of this.currentHaul.catches!) {
      // this is the unsorted catch
      if (wCatch.catchNum && wCatch.catchNum > catchNum) {
        catchNum = wCatch.catchNum;
      }
      if (wCatch.children) {
        // this is the grouping
        for (const wChild of wCatch.children) {
          const childNum = wChild.catchNum as number;
          if (childNum && childNum > catchNum) {
            catchNum = childNum;
          }
          if (wChild.children) {
            // this is the taxonomy alias
            for (const wGrandChild of wChild.children) {
              const grandChildNum = wGrandChild.catchNum as number;
              if (grandChildNum && grandChildNum > catchNum) {
                catchNum = grandChildNum;
              }
            }
          }
        }
      }
    }
    catchNum += 1;
    return catchNum;
  }

  private saveChanges() {
    this.save(this.currentHaul);
  }

  private expand(row: any) {
    this.expanded.push(row.catchNum);
  }

  private collapse(row: any) {
    const index = this.expanded.indexOf(row.catchNum);
    if (index > -1) {
      this.expanded.splice(index, 1);
    }
  }

  private expandAll() {
    this.expanded = [];
    if (this.currentHaul.catches![0].children) {
      for (const grouping of this.currentHaul.catches![0].children) {
        this.expanded.push(grouping.catchNum);
      }
    }
  }

  private collapseAll() {
    this.expanded = [];
  }

  private get getCatches() {
    const returnCatches: any = [];
    // if (this.useActiveHaul) {
    for (const unsortedCatch of this.currentHaul.catches!) {
      // for (const row of this.catches) {
      if (unsortedCatch.children!.length > 0) {
        for (const grouping of unsortedCatch.children!) {
          returnCatches.push(grouping);
          if (this.expanded.indexOf(grouping.catchNum) !== -1) {
            for (const child of grouping.children!) {
              returnCatches.push(child);
            }
          }
        }
      }
    }
    // } else {
    //   for (const unsortedCatch of this.catches ) {
    //   // for (const row of this.catches) {

    //     if (unsortedCatch.children!.length > 0) {
    //       for (const grouping of unsortedCatch.children!) {
    //         returnCatches.push(grouping);
    //         if (this.expanded.indexOf(grouping.catchNum) !== -1) {
    //           for (const child of grouping.children!) {

    //             returnCatches.push(child);
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    return returnCatches;
  }

  private getWeight(row: any) {
    if (row.weight.value) {
      return parseInt(row.weight.value, 10);
    } else {
      let weight = 0;
      for (const child of row.children) {
        if (child.weight.value) {
          weight += parseInt(child.weight.value, 10);
        }
      }
      return weight;
    }
  }

  private getCount(row: any) {
    if (row.count) {
      return parseInt(row.count, 10);
    } else {
      let count = 0;
      for (const child of row.children) {
        if (child.count) {
          count += parseInt(child.count, 10);
        }
      }
      return count;
    }
  }

  private getDisposition(row: any) {
    if (row.disposition) {
      return row.disposition.description === 'Retained'
        ? 'R'
        : row.disposition.description === 'Discarded'
        ? 'D'
        : '';
    } else {
      return '';
    }
  }

  private editHaul() {
    this.$router.push({
      path: '/hauldetails/' + this.currentHaul.operationNum
    });
  }

  private resetModify() {
    this.moveDialog = false;
    this.moveModify = false;
    this.deleteModify = false;
    this.speciesModel = {};
    this.setCurrentCatch(undefined);
  }

  private outputKey(event: any) {
    this.filterText += event;
    console.log(event);
  }

  private async getLookupVals(tableName: string) {
    let lookupVals;
    try {
      const descriptions = await pouchService.db.query(
        pouchService.lookupsDBName,
        tableName
      );
      lookupVals = descriptions.rows.map((row: any) => row);
      lookupVals.sort(this.sorter);
      return lookupVals.reduce(this.reducer, {});
    } catch (err) {
      console.log(err.message);
    }
  }

  private getOptions(lookups: any): any[] {
    const optionsHolder = [];
    for (const lookup of Object.keys(lookups)) {
      optionsHolder.push({ label: lookup, value: lookup });
    }
    return optionsHolder;
  }

  private sorter(a: any, b: any) {
    return a.key - b.key;
  }

  private reducer(accum: any, curr: any) {
    const lookup = 'key';
    accum[curr[lookup]] = curr;
    return accum;
  }

  private async getFrequentSpecies() {
    // get user doc from userDB if exits
    console.log('getting frequent species');

    const frequentSpecies: any = {};

    try {
      const allDocs = await pouchService.db.allDocs(pouchService.userDBName);

      for (const row of allDocs.rows) {
        if (row.doc.type === 'wcgop-operation' && row.doc.catches) {
          for (const grouping of row.doc.catches[0].children) {
            for (const species of grouping.children) {
              if (frequentSpecies[species.catchContent.alias.toUpperCase()]) {
                frequentSpecies[species.catchContent.alias.toUpperCase()] += 1;
              } else {
                frequentSpecies[species.catchContent.alias.toUpperCase()] = 1;
              }
            }
          }
        }
      }
      const sorted = Object.keys(frequentSpecies).sort((a, b) => {
        return frequentSpecies[a] - frequentSpecies[b];
      });

      this.frequentSpecies = sorted.reverse().slice(0, 20);
    } catch (err) {
      console.log(err);
    }
  }

  private get getWeightMethods() {
    if (this.catchModel && this.currentTrip.gearType === 'trawl') {
      if (this.catchModel.disposition.description === 'Retained') {
        return this.weightMethodOptions.filter((weightMethod) =>
          this.wcgopTrawlRetainedWeightMethods.includes(weightMethod.value)
        );
      } else {
        return this.weightMethodOptions.filter((weightMethod) =>
          this.wcgopTrawlDiscardedWeightMethods.includes(weightMethod.value)
        );
      }
    } else if (this.catchModel && this.currentTrip.gearType === 'fixed') {
      return this.weightMethodOptions.filter((weightMethod) =>
        this.wcgopFixedGearWeightMethods.includes(weightMethod.value)
      );
    } else {
      return this.weightMethodOptions;
    }
  }

  private async created() {
    if (!this.currentHaul.catches || this.currentHaul.catches.length === 0) {
      this.currentHaul.catches = [
        {
          catchNum: 0,
          catchContent: {
            type: 'unsorted-catch',
            label: 'what should this be labeled?'
          },
          disposition: undefined,
          weightMethod: undefined,
          weight: { units: 'lbs', value: 0 },
          count: 0,
          discardReason: undefined,
          children: []
        }
      ];
    }

    this.setCurrentCatch(this.currentHaul.catches[0]);
    this.selectedCatch = undefined;

    this.weightMethodLookup = await this.getLookupVals(
      'optecs_trawl/all_weight_method_description'
    );
    this.weightMethodOptions = this.getOptions(this.weightMethodLookup);

    this.discardReasonLookup = await this.getLookupVals(
      'optecs_trawl/all_discard_reason_description'
    );
    this.discardReasonOptions = this.getOptions(this.discardReasonLookup);

    this.getFrequentSpecies();
    this.handleSelectCatch(undefined);
  }
}
</script>

<style scoped>
.itemSelected {
  background-color: #027be3;
  color: white;
}
</style>

