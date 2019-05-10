<template>
  <q-page padding>
    <div class="q-gutter-md">
      <div v-for="r in vertButtonCount" class="row" :key="`md-r-${r}`">
        <div v-for="c in horizButtonCount" class="col self-center" :key="`md-c-${c}`">
          <!-- TODO: this should be in a TallyState -->
          <tally-btn
            :layout="getButton(r,c)"
            :data="getData(r,c)"
            @dataChanged="handleDataChanged"
            @blankClicked="handleBlankClicked"
          />
        </div>
      </div>
    </div>
    <div class="q-pa-md">
      <component
        v-bind:is="currentControlComponent"
        @controlevent="handleControlEvent"
        @cancel="handleCancel"
        @selectedReason="handleSelectedReason"
        :species="currentSelectedSpecies"
      ></component>
    </div>
    <q-dialog v-model="confirmReset" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white"/>
          <span class="q-ml-sm">Are you sure you want to reset tally data?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup/>
          <q-btn flat label="Reset Data" color="primary" @click="reset" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <tally-addnamedspecies-dialog
      ref="addNamedSpeciesModal"
      @addNewSpecies="handleAddNamedSpecies"
      :speciesList="speciesList"
      @cancel="handleCancelAddNamedSpecies"
    />
    <!-- <div>Mode: {{tallyMode}}</div> -->
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

import {
  TallyLayoutRecordTypeName,
  TallyButtonLayoutData,
  TallyOperationMode,
  TallyCountData
} from '../_store/types';
import TallyBtn from '../components/tally/TallyBtn.vue';
import TallyControls from '../components/tally/TallyControls.vue';
import TallyLayoutControls from '../components/tally/TallyLayoutControls.vue';
import TallyAllTalliesControls from '../components/tally/TallyAllTalliesControls.vue';
import TallyAddNamedSpeciesDialog from '../components/tally/TallyAddNamedSpeciesDialog.vue';
import TallyAddNewButton from '../components/tally/TallyAddNewButton.vue';

import { WcgopAppState } from '../_store/types';
import { TallyState } from '../_store/types';

Vue.component('tally-btn', TallyBtn);
Vue.component('tally-controls', TallyControls);
Vue.component('tally-layout-controls', TallyLayoutControls);
Vue.component('tally-alltallies-controls', TallyAllTalliesControls);
Vue.component('tally-addnew-controls', TallyAddNewButton);
Vue.component('tally-addnamedspecies-dialog', TallyAddNamedSpeciesDialog);

@Component({
  pouch: {
    tallyTemplates() {
      return {
        database: pouchService.userDBName,
        selector: { type: TallyLayoutRecordTypeName },
        sort: [{ createdDate: 'desc' }]
      };
    }
  }
})
export default class Tally extends Vue {
  @State('appState') private appState!: WcgopAppState;
  @State('pouchState') private pouchState!: PouchDBState;
  @State('tallyState') private tallyState!: TallyState;

  @Action('connectDB', { namespace: 'tallyState' }) private connectDB: any;
  @Action('updateButtonData', { namespace: 'tallyState' })
  private updateButtonData: any;
  @Action('reset', { namespace: 'tallyState' })
  private reset: any;
  @Action('setTallyIncDec', { namespace: 'tallyState' })
  private setTallyIncDec: any;
  @Action('setTallyOpMode', { namespace: 'tallyState' })
  private setTallyOpMode: any;
  @Action('assignNewButton', { namespace: 'tallyState' })
  private assignNewButton: any;

  @Getter('vertButtonCount', { namespace: 'tallyState' })
  private vertButtonCount!: number;
  @Getter('horizButtonCount', { namespace: 'tallyState' })
  private horizButtonCount!: number;
  @Getter('tallyMode', { namespace: 'tallyState' })
  private tallyMode!: TallyOperationMode;

  private btnLabel = '';

  private currentControlComponent = 'tally-controls';

  private tallyTemplates!: any;
  private confirmReset = false;

  private currentSelectedSpecies: any = {}; // TODO actual species type
  private currentSelectedReason: string = '';

  private speciesList = [];
  constructor() {
    super();

    this.setTallyOpMode(TallyOperationMode.Tally);
    this.populateSpecies();
  }

  public async populateSpecies() {
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
  }

  public handleDataChanged(data: any) {
    console.log('Passing', data);
    this.updateButtonData(data);
  }

  /**
   * handleBlankClicked: depending on state, assign or move a button
   */
  public handleBlankClicked(button: TallyButtonLayoutData) {
    if (this.tallyMode === TallyOperationMode.AddNamedSpeciesSelectLocation) {
      this.setTallyOpMode(TallyOperationMode.AddNamedSpeciesSelectType);
      this.assignNewButton({
        species: this.currentSelectedSpecies,
        reason: this.currentSelectedReason,
        index: button.index
      });
    }
  }

  public handleSelectedReason(reason: string) {
    this.currentSelectedReason = reason;
  }

  public handleAddNamedSpecies(species: any) {
    this.currentSelectedSpecies = species;
    (this.$refs.addNamedSpeciesModal as TallyAddNamedSpeciesDialog).close();
    this.setTallyOpMode(TallyOperationMode.AddNamedSpeciesSelectType);
    this.handleControlEvent('tally-addnew-controls');
  }

  public handleCancelAddNamedSpecies() {
    // TODO same as handleCancel?
    this.setTallyOpMode(TallyOperationMode.Tally);
    this.handleControlEvent('tally-mode');
  }

  public handleCancel() {
    // Generic Cancel - return to tally mode
    // TODO refactor into setTallyMode
    this.currentSelectedSpecies = {};
    this.currentSelectedReason = '';
    this.setTallyOpMode(TallyOperationMode.Tally);
    this.handleControlEvent('tally-mode');
  }

  public handleControlEvent(controlName: string) {
    switch (controlName) {
      case 'modify-layout':
        this.currentControlComponent = 'tally-layout-controls';
        break;
      case 'modify-layout-done':
      case 'all-tallies-done':
      case 'tally-mode':
        this.currentControlComponent = 'tally-controls';
        break;
      case 'all-tallies-for':
        this.currentControlComponent = 'tally-alltallies-controls';
        break;
      case 'tally-addnew-controls':
        this.currentControlComponent = 'tally-addnew-controls';
        break;
      case 'reset-data':
        this.confirmReset = true;
        break;
      case 'tally-inc':
        this.setTallyIncDec(1);
        break;
      case 'tally-dec':
        this.setTallyIncDec(-1);
        break;
      case 'add-named-species':
        this.setTallyOpMode(TallyOperationMode.AddNamedSpeciesSelectSpecies);
        (this.$refs.addNamedSpeciesModal as TallyAddNamedSpeciesDialog).open();
        break;
      default:
        console.log('Unhandled tally control event:', controlName);
        this.currentControlComponent = 'tally-controls';
        break;
    }
  }

  private getBtnIndex(row: number, column: number) {
    // Fixes weird 1-based v-for loops
    return column + (row - 1) * this.horizButtonCount - 1;
  }
  private getButton(row: number, column: number): TallyButtonLayoutData {
    const idx = this.getBtnIndex(row, column);
    if (
      !this.tallyState.tallyLayout
      //  TODO || !this.tallyState.tallyDataRec
    ) {
      return {
        index: idx,
        labels: { shortCode: '??', reason: '??', countTmp: 0 }
      };
      // temp fake data - indication that something is broken
    }

    return this.tallyState.tallyLayout.layoutData[idx];
  }

  private getData(row: number, column: number): TallyCountData {
    const idx = this.getBtnIndex(row, column);
    // return this.tallyState.tallyLayout.layoutData[idx];

    const targetButton = this.tallyState.tallyLayout.layoutData[idx];
    if (
      !targetButton.labels ||
      !targetButton.labels.shortCode ||
      !this.tallyState.tallyDataRec
    ) {
      return {};
    }

    const targetData = this.tallyState.tallyDataRec.data!.filter(
      (rec: TallyCountData) => {
        return (
          rec.shortCode === targetButton.labels!.shortCode &&
          rec.reason === targetButton.labels!.reason
        );
      }
    );
    if (targetData) {
      return targetData[0];
      // console.log('TODO getData from', targetData);
    }
    if (targetButton.labels && targetButton.labels.reason !== 'INVIS') {
      return {
        shortCode: targetButton.labels.shortCode,
        reason: targetButton.labels.reason,
        count: targetButton.labels.countTmp
      };
    } else {
      return {};
    }
  }

  // private getDataVals(shortCode: string, reason: string): TallyCountData {
  //   // if (this.)
  //   return {

  //   }
  // }

  // --- Private Methods ---

  private mounted() {
    this.connectDB();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped></style>
