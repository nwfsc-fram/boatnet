<template>
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
      </q-tree> -->
      <div style="float: left;">
        <span v-if="expanded.length < currentHaul.catches[0].children.length">
          <q-btn color="primary" @click="expandAll">Expand All</q-btn>
          &nbsp;
        </span>
        <q-btn color="grey" @click="collapseAll" v-if="expanded.length > 0">Collapse All</q-btn>
      </div>
      <boatnet-summary
        currentScreen="Species"
        :current="currentCatch"
        :selectionId="currentCatch ? currentCatch.catchNum : 0"
        @goTo="handleGoToWtCnt"
        @add="addSpecies"
        @edit="editSpecies"
        @delete="deleteSpecies"
        >
        <template v-slot:table>
          <boatnet-table
            :data="getCatches"
            :settings="wcgopCatchSettings"
            @select="handleSelectCatch"
            :showBottom="showBottom"
            >
            <template v-slot:default="rowVals">
              <q-td style="width: 20px;">
                <q-icon v-if="expanded.indexOf(rowVals.row.catchNum) === -1 && rowVals.row.children.length > 0" name="chevron_right" style="font-size: 26px;" @click="expand(rowVals.row)"></q-icon>
                <q-icon v-if="expanded.indexOf(rowVals.row.catchNum) !== -1 && rowVals.row.children.length > 0" name="expand_more" style="font-size: 26px;" @click="collapse(rowVals.row)"></q-icon>
              </q-td>
              <q-td key="disposition" style="width: 120px">{{ getDisposition(rowVals.row) }}</q-td>
              <q-td key="weightMethod" style="width: 120px">{{rowVals.row.weightMethod ? rowVals.row.weightMethod.lookupVal : ''}}</q-td>
              <q-td key="discardReason" style="width: 120px">{{ rowVals.row.discardReason ? rowVals.row.discardReason: '' }}</q-td>
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
          <q-btn color="primary" icon="play_arrow" label="Go To Tallies"/>
          <q-btn color="primary" icon="play_arrow" label="Go To Biospec"/>
        </template>
    </boatnet-summary>

        <q-dialog v-model="editSpeciesDialog" position="right" v-if="currentCatch" >
          <q-card style="width: 600px; padding: 4px">
            <q-card-section>
              <q-btn flat icon="close" style="padding: 0 0 16px 0" @click="editSpeciesDialog = false"></q-btn>
                <div class="q-col-gutter-md q-pa-md">
                  <div style="padding: 0 16px">
                      <div class="text-h6">{{ currentCatch.catchContent.alias }}</div>
                      <br>
                      <b>Catch Weight </b><span>({{speciesModel.weight.units}})</span>
                      <boatnet-keyboard-input 
                        v-model="speciesModel.weight.value"
                        keyboardType="numeric"
                        :value.sync="speciesModel.weight.value"
                        />
                      <br>
                      <b>Total # of fish</b>
                      <boatnet-keyboard-input
                        v-model="speciesModel.count"
                        keyboardType="numeric"
                        :value.sync="speciesModel.count"
                        />
                      <br>
                      <b>Discard Reason</b><br>
                      <q-btn-toggle
                        v-model="speciesModel.discardReason"
                        :options="wmOptions"
                        :value.sync="speciesModel.discardReason"
                        />
                      <p>{{ speciesModel.discardReason ? weightMethodLookup[speciesModel.discardReason] : '-'}}</p>
                    </div>
                    </div>
                    <q-card-actions style="float: right;">
                      <q-btn color="primary" label="update" @click="updateSpecies"></q-btn>
                      <br><br>
                  </q-card-actions>
            </q-card-section>
          </q-card>
        </q-dialog>

        <q-dialog v-model="addSpeciesDialog" position="right">
            <q-card style="width: 600px; padding: 4px" v-if="currentHaul.gearType">
                <q-card-section>
                  <q-btn flat icon="close" style="padding: 0 0 16px 0" @click="addSpeciesDialog = false"></q-btn>
                  <div class="q-col-gutter-md row q-pa-md">
                    <div class="col" style="padding: 0 16px">

                        <b>Disposition</b>
                        <br>
                        <q-btn
                        v-model="catchModel.disposition"
                        :label="catchModel.disposition.description"
                        @click="catchModel.disposition.description === 'Discarded' ?
                                    catchModel.disposition.description = 'Retained' :
                                    catchModel.disposition.description = 'Discarded'"
                        :color="catchModel.disposition.description === 'Retained' ? 'green': 'primary' " >
                        </q-btn>
                      <br><br>
                      <b>Weight Method</b>
                      <q-btn-toggle
                        v-model="catchModel.weightMethod"
                        :options="wmOptions"
                        :value.sync="weightMethod"
                        dense
                        spread
                      />
                      <p>{{ catchModel.weightMethod ? weightMethodLookup[catchModel.weightMethod] : ''}}</p>

                      <div v-if="catchModel.weightMethod && [6,7,14].includes(catchModel.weightMethod)">
                        <div v-if="selectedSpecies.length <= 1">
                          <b>Catch Weight </b><span>(lbs)</span>
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
                        <div v-else>
                          (Catch Weight and Total # of fish can only be added one at a time.)
                        </div>
                      </div>
                  </div>
                  <div class="col" style="min-width: 250px; padding: 0">
                    <q-btn
                      label="Frequent List"
                      @click="frequentList = !frequentList"
                      :color="frequentList ? 'primary': 'grey-5'"
                    >
                    </q-btn>

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
                          :active="selectedSpecies.indexOf(option) !== -1"
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

                  <q-card-actions style="float: right;">
                      <q-btn
                      color="primary"
                      label="update"
                      @click="updateCatch"
                      :disabled="!catchModel.weightMethod || !catchModel.disposition || selectedSpecies.length < 1"
                      ></q-btn>
                      <br><br>
                  </q-card-actions>
                </q-card-section>
            </q-card>
          <q-card style="width: 600px; padding: 4px" v-else>
            <div class="text-h6">You must select a gear type for the haul before you can add catch species -- <span @click="editHaul" style="cursor:pointer">link to haul details</span></div>
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
  WcgopOperation,
  TaxonomyAlias
} from '@boatnet/bn-models';

import moment from 'moment';

Vue.component(BoatnetSummary);

@Component
export default class Catch extends Vue {
    private wcgopCatchSettings: any;
    private wcgopCatchData: any[] = [];
    private addSpeciesDialog = false;
    private editSpeciesDialog = false;
    private frequentList = false;
    private disposition = 'Retained';
    private speciesList: any[] = [];
    private options: any[] = [];
    private selectedSpecies: any[] = [];
    private filterText = '';
    // private useActiveHaul = false;
    private discardReason = [];
    private count: number = 0;
    private weight: number = 0;
    private weightMethod = [];
    private showBottom = true;

    private catchModel: WcgopCatch = {
                                        disposition: {description: 'Discarded'}
                                      };

    private speciesModel: WcgopCatch = {
                                        weight: {units: 'lbs', value: 0},
                                        count: 0,
                                        discardReason: undefined
                                      };

    private catches: WcgopCatch[] = [
      {
        catchNum: 0,
        catchContent: {
          type: 'unsorted-catch',
          label: 'what should this be labeled?'
        },
        disposition: undefined, weightMethod: undefined, weight: undefined, count: undefined, discardReason: undefined,
        children: [
          {
            catchNum: 1,
            catchContent: {
              type: 'grouping',
              name: 'what should this be?'
            },
            disposition:  {
              description: 'Discarded'
            },
            weightMethod: {
              description: 'Basket Weight Determination',
              lookupVal: 3
            },
            weight: undefined, count: undefined, discardReason: undefined,
            children: [
              {
                catchNum: 2,
                catchContent: {
                  type: 'taxonomy-alias',
                  alias: 'Canary Rockfish',
                  aliasType: 'Lookup',
                  isWcgop: true,
                  taxonomy: 'where does this come from?!'
                },
                disposition: undefined,
                weightMethod: undefined,
                weight: {
                  value: 10,
                  units: 'lbs'
                  },
                count: 5,
                discardReason: 12,
                children: []
              },
              {
                catchNum: 3,
                catchContent: {
                  type: 'taxonomy-alias',
                  alias: 'Pacific Halibut',
                  aliasType: 'Lookup',
                  isWcgop: true,
                  taxonomy: '???'
                },
                disposition: undefined,
                weightMethod: undefined,
                weight: {
                  value: 45,
                  units: 'lbs'
                },
                count: 7,
                discardReason: 13,
                children: []
              },
            ]
          },
          {
            catchNum: 4,
            catchContent: {
              type: 'grouping',
              name: 'what should this be?'
            },
            disposition: {
              description: 'Discarded'
              },
            weightMethod: {
              description: 'Visual Spatial 1/4',
              lookupVal: 15
            },
            weight: undefined,
            count: undefined,
            discardReason: undefined,
            children: [
              {
                catchNum: 5,
                catchContent: {
                  type: 'taxonomy-alias',
                  alias: 'Green Sturgeon',
                  aliasType: 'Lookup',
                  isWcgop: true,
                  taxonomy: '???'
                },
                disposition: undefined, weightMethod: undefined,
                weight: {
                  value: 25,
                  units: 'lbs'
                },
                count: 8,
                discardReason: 6,
                children: []
              },
              {
                catchNum: 6,
                catchContent: {
                  type: 'taxonomy-alias',
                  alias: 'Bluefin Tuna',
                  aliasType: 'Lookup',
                  isWcgop: true,
                  taxonomy: '???'
                },
                disposition: undefined, weightMethod: undefined,
                weight: {
                  value: 35,
                  units: 'lbs'
                },
                count: 12,
                discardReason: 7,
                children: []
              },
          ]
        },
        ]
      }
    ];

    private wmOptions = [
                        {label: '1', value: 1 },
                        {label: '3', value: 3 },
                        {label: '5', value: 5 },
                        {label: '6', value: 6 },
                        {label: '7', value: 7 },
                        {label: '8', value: 8 },
                        {label: '14', value: 14 },
                        {label: '15', value: 15 },
                        ];

    private weightMethodLookup: any = {
      1: 'Actual Weight',
      3: 'Basket Weight Determination',
      5: 'OTC minus Retained',
      6: 'Other',
      7: 'Vessel Estimate',
      8: 'Extrapolation',
      14: 'Visual Estimate',
      15: 'Visual Spatial'
    };

    private expanded: any = [];



    @Action('setCurrentCatch', { namespace: 'appState' })
    private setCurrentCatch: any;

    @Getter('currentCatch', { namespace: 'appState' })
    private currentCatch!: WcgopCatch;

    @Getter('currentHaul', { namespace: 'appState' })
    private currentHaul!: WcgopOperation;

    @Action('save', { namespace: 'appState' })
    private save: any;

    constructor() {
        super(
        );
        this.populateSpeciesView();

        this.wcgopCatchSettings = {
        columns: [
            { name: 'action', align: 'left', label: ''},
            { name: 'disposition', required: true, label: 'R/D', align: 'left',
            field: 'disposition', sortable: true },
            { name: 'weightMethod', align: 'left', label: 'WM',
            field: (row: any) => row.observerTotalCatch.weightMethod, sortable: true },
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

private handleSelectCatch(wCatch: any) {
    let wm;
    let dist;
    if (wCatch && wCatch.catchContent && wCatch.catchContent.type === 'taxonomy-alias') {
      for (const grouping of this.catches[0].children!) {
        for (const species of grouping.children!) {
          const txnmyContent = species.catchContent as TaxonomyAlias;
          if (txnmyContent.alias === wCatch.catchContent.alias) {
            wm = grouping.weightMethod;
            dist = grouping.disposition;
          }
        }
      }

      this.setCurrentCatch(wCatch);
      // if (wm) {
      //   Vue.set(this.currentCatch, 'weightMethod', wm);
      // }
      // if (dist) {
      //   Vue.set(this.currentCatch, 'disposition', dist);
      // }

    } else {
      this.setCurrentCatch(undefined);
    }
  }

private handleGoToWtCnt() {
    this.$router.push({ path: '/wtcnt'});
}

private getCatch() {
    this.wcgopCatchData = this.currentHaul.catches ? this.currentHaul.catches : [];
}

private addSpecies() {
  this.addSpeciesDialog = true;
}

private editSpecies() {
  if (this.currentCatch) {
    this.speciesModel.weight = JSON.parse(JSON.stringify(this.currentCatch.weight));
    this.speciesModel.count = JSON.parse(JSON.stringify(this.currentCatch.count));
    this.speciesModel.discardReason = JSON.parse(JSON.stringify(this.currentCatch.discardReason));
    this.editSpeciesDialog = true;
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
    this.selectedSpecies.splice(this.selectedSpecies.indexOf(species) , 1);
  }
}

private deleteSpecies() {
  console.log(this.currentCatch);
}


private get filteredSpecies() {
  if (this.filterText.length > 0) {
    const filterResults: any[] =  this.speciesList.filter( (species: any) =>
            (
              species.value.commonName.toUpperCase().includes( this.filterText.toUpperCase()) ||
              species.value.scientificName.toUpperCase().includes( this.filterText.toUpperCase())
            )
            && this.selectedSpecies.indexOf(species) === -1
            );

    return this.selectedSpecies.concat(filterResults);
    } else {
      return this.speciesList;
        }
}

private updateCatch() {
  this.setCurrentCatch(undefined);
  // function to check whether the weight method + disposition group exists
  const addWeightMethod: any = this.catchModel.weightMethod;
  const addDisposition: any = this.catchModel.disposition;

  if (this.currentHaul.catches![0].children) {
    for (const grouping of this.currentHaul.catches![0].children) {
      if (grouping.weightMethod!.lookupVal === addWeightMethod
          &&
          grouping.disposition!.description === addDisposition.description) {
        this.setCurrentCatch(grouping);
      }
    }
  }

  if (!this.currentCatch) {
    const grouping = {
            catchNum: this.getNewCatchNum(),
            catchContent: {
              type: 'grouping',
              name: 'what should this be?'
            },
            disposition:  JSON.parse(JSON.stringify(addDisposition)),
            weightMethod: {
              description: this.weightMethodLookup[addWeightMethod],
              lookupVal: JSON.parse(JSON.stringify(addWeightMethod))
            },
            weight: {units: 'lbs', value: 0}, count: 0, discardReason: undefined,
            children: []
    };

    this.currentHaul.catches![0].children!.push(grouping);
    this.saveChanges();
  }

  for (const grouping of this.currentHaul.catches![0].children!) {
    if (grouping.weightMethod!.lookupVal === addWeightMethod
        &&
        grouping.disposition!.description === addDisposition.description) {
      this.setCurrentCatch(grouping);
    }
  }
  console.log(this.selectedSpecies);
  for (const species of this.selectedSpecies) {
    const newSpeciesCatch: WcgopCatch = {
                catchNum: this.getNewCatchNum(),
                catchContent: JSON.parse(JSON.stringify(species.doc)),
                disposition: undefined, weightMethod: undefined,
                discardReason: '',
                weight: {units: 'lbs', value: 0},
                count: 0,
                children: []
                };

    if (this.selectedSpecies.length === 1 && this.catchModel.weight) {
      newSpeciesCatch.weight = {value: JSON.parse(JSON.stringify(this.catchModel.weight)), units: 'lbs'};
    }
    if (this.selectedSpecies.length === 1 && this.catchModel.count) {
      newSpeciesCatch.count = this.catchModel.count;
    }
    this.currentCatch.children!.push(newSpeciesCatch);
    this.saveChanges();
  }

  this.selectedSpecies = [];  // reset selected species.
  this.catchModel = {disposition: addDisposition};  // reset catchModel, but retain last disposition.
}

private updateSpecies() {
  const weight = this.speciesModel.weight as number;
  this.currentCatch.weight = JSON.parse(JSON.stringify(weight));
  this.currentCatch.count = JSON.parse(JSON.stringify(this.speciesModel.count));
  this.currentCatch.discardReason = JSON.parse(JSON.stringify(this.speciesModel.discardReason));
  this.saveChanges();
  this.speciesModel = {
                        weight: {units: 'lbs', value: 0},
                        count: 0,
                        discardReason: undefined
                      };
  this.editSpeciesDialog = false;
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
      for (const unsortedCatch of this.currentHaul.catches! ) {
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
    if (row.weight) {
      return row.weight.value;
    } else {
      let weight = 0;
      for (const child of row.children) {
        if (child.weight) {
          weight += child.weight.value;
        }
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
        if (child.count) {
          count += child.count;
        }
      }
      return count;
    }
  }

  private getDisposition(row: any) {
    if (row.disposition) {
      return row.disposition.description === 'Retained' ? 'R' : row.disposition.description === 'Discarded' ? 'D' : '';
    } else {
      return '';
    }
  }

  private editHaul() {
    this.$router.push({ path: '/hauldetails/' + this.currentHaul.operationNum });
  }

  private created() {
    if (!this.currentHaul.catches || this.currentHaul.catches.length === 0) {
      this.currentHaul.catches = [
        {
          catchNum: 0,
          catchContent: {
            type: 'unsorted-catch',
            label: 'what should this be labeled?'
          },
          disposition: undefined, weightMethod: undefined,
          weight: {units: 'lbs', value: 0}, count: 0, discardReason: undefined,
          children: []
        }];
    }
    this.setCurrentCatch(this.currentHaul.catches[0]);

  }

}
</script>

<style scoped>
  .itemSelected {
    background-color: #027BE3;
    color: white;
  }
</style>

