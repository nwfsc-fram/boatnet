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
        :speciesCode="currentSelectedSpecies.shortCode"
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
          <q-btn flat label="Reset Data" color="primary" @click="handleResetAllData" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <boatnet-add-species-dialog
      ref="addNamedSpeciesModal"
      @addNewSpecies="handleAddNamedSpecies"
      :speciesList="speciesList"
      position="left"
      @cancel="handleCancelAddNamedSpecies"
    />
    <div>Mode: {{tallyMode}}</div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

import {
  TallyLayoutRecordTypeName,
  TallyDataRecordTypeName,
  TallyButtonLayoutData,
  TallyOperationMode,
  TallyCountData
} from '../_store/types';

import BoatnetAddSpeciesDialog from '@boatnet/bn-common';

import TallyBtn from '../components/tally/TallyBtn.vue';
import TallyControls from '../components/tally/TallyControls.vue';
import TallyLayoutControls from '../components/tally/TallyLayoutControls.vue';
import TallyAllTalliesControls from '../components/tally/TallyAllTalliesControls.vue';
import TallyAddExistingControls from '../components/tally/TallyAddExistingControls.vue';
import TallyAddNewButton from '../components/tally/TallyAddNewButton.vue';

import { WcgopAppState } from '../_store/types';
import { TallyState } from '../_store/types';
import { Species } from '@boatnet/bn-models';

Vue.component('tally-btn', TallyBtn);
Vue.component('tally-controls', TallyControls);
Vue.component('tally-layout-controls', TallyLayoutControls);
Vue.component('tally-alltallies-controls', TallyAllTalliesControls);
Vue.component('tally-addexisting-controls', TallyAddExistingControls);
Vue.component('tally-addnew-controls', TallyAddNewButton);
Vue.component(BoatnetAddSpeciesDialog);

@Component({
  pouch: {
    tallyTemplates() {
      return {
        database: pouchService.userDBName,
        selector: { type: TallyLayoutRecordTypeName },
        sort: [{ createdDate: 'desc' }]
      };
    },
    tallyData() {
      return {
        database: pouchService.userDBName,
        selector: { type: TallyDataRecordTypeName },
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
  @Action('setCurrentButtonIdx', { namespace: 'tallyState' })
  private setCurrentButtonIdx: any;
  @Action('setCurrentReason', { namespace: 'tallyState' })
  private setCurrentReason: any;
  @Action('incTempSpeciesCounter', { namespace: 'tallyState' })
  private incTempSpeciesCounter: any;
  @Action('resetTempSpeciesCounter', { namespace: 'tallyState' })
  private resetTempSpeciesCounter: any;
  @Action('assignNewButton', { namespace: 'tallyState' })
  private assignNewButton: any;
  @Action('swapButtons', { namespace: 'tallyState' })
  private swapButtons: any;
  @Action('deleteButton', { namespace: 'tallyState' })
  private deleteButton: any;
  @Action('reassignSpecies', { namespace: 'tallyState' })
  private reassignSpecies: any;
  @Action('setLastIncDecIndex', { namespace: 'tallyState' })
  private setLastIncDecIndex: any;
  @Action('clearLastIncDec', { namespace: 'tallyState' })
  private clearLastIncDec: any;

  @Getter('vertButtonCount', { namespace: 'tallyState' })
  private vertButtonCount!: number;
  @Getter('horizButtonCount', { namespace: 'tallyState' })
  private horizButtonCount!: number;
  @Getter('tallyMode', { namespace: 'tallyState' })
  private tallyMode!: TallyOperationMode;
  @Getter('currentReason', { namespace: 'tallyState' })
  private currentReason!: string;
  @Getter('tempCounter', { namespace: 'tallyState' })
  private tempCounter!: string;
  @Getter('currentTempName', { namespace: 'tallyState' })
  private currentTempName!: string;
  @Getter('incDecValue', { namespace: 'tallyState' })
  private incDecValue!: number;

  private btnLabel = '';

  private currentControlComponent = 'tally-controls';

  private confirmReset = false;

  private currentSelectedSpecies: any = { shortCode: '' }; // TODO actual species type, move to vuex?

  private currentSelectedButton: any = {}; // TODO button type?

  private speciesList = [];

  private isAddSpeciesDialogOpen = false;

  // Reactive
  private tallyTemplates!: any;
  private tallyData!: any;

  constructor() {
    super();

    this.setTallyOpMode(TallyOperationMode.Tally);
    this.populateSpecies(); // TODO use live view
  }

  /**
   * TODO: If this is called before the initial sync, or a record is added later, the page needs to reload.
   * Review alternative methods or checks to reload (or reactive pouch-vue style, if performance allows)
   */
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
    switch (this.tallyMode) {
      case TallyOperationMode.DeleteButtonSelect:
        this.setTallyOpMode(TallyOperationMode.Tally);
        this.deleteButton(data.button);
        return;
      case TallyOperationMode.MoveButtonSelect:
        this.currentSelectedButton = data.button;
        this.setCurrentButtonIdx(data.button.index);
        this.setTallyOpMode(TallyOperationMode.MoveSelectLocation);
        return;
      case TallyOperationMode.MoveSelectLocation:
        this.swapButtons({
          oldButton: this.currentSelectedButton,
          newIndex: data.button.index
        });
        this.setTallyOpMode(TallyOperationMode.Tally);
        return;
      case TallyOperationMode.AddExistingSpeciesSelectSpecies:
        this.currentSelectedButton = data.button;
        this.setCurrentButtonIdx(data.button.index);
        this.currentSelectedSpecies = {
          shortCode: data.button.labels.shortCode // TODO Full LOOKUP
        };
        this.handleControlEvent('select-exist-species');
        return;
      case TallyOperationMode.NameTempSpeciesSelect:
        if (data.button.labels.shortCode.startsWith('(TEMP')) {
          this.currentSelectedSpecies = {
            shortCode: data.button.labels.shortCode
          };
          this.handleControlEvent('rename-temp-species');
        }
        return;
      case TallyOperationMode.ModifyDispButtonSelect:
        this.currentSelectedButton = data.button;
        this.currentSelectedSpecies = {
          shortCode: data.button.labels.shortCode
        }; // TODO full species?
        this.setCurrentButtonIdx(data.button.index);
        this.setTallyOpMode(TallyOperationMode.ModifyDispSelectDisp);
        this.handleControlEvent('tally-addnew-controls');
        return;
      case TallyOperationMode.AllTalliesSelectSpecies:
        this.currentSelectedButton = data.button;
        this.currentSelectedSpecies = {
          shortCode: data.button.labels.shortCode
        }; // TODO full species?
        this.handleControlEvent('all-tallies');
        return;
    }

    data = {
      ...data,
      skipLayoutUpdate: true
    };
    this.setLastIncDecIndex(data.button.index);
    this.updateButtonData(data);
  }

  /**
   * handleBlankClicked: depending on state, assign or move a button
   */
  public handleBlankClicked(button: TallyButtonLayoutData) {
    if (this.tallyMode === TallyOperationMode.AddNamedSpeciesSelectLocation) {
      this.assignNewButton({
        species: this.currentSelectedSpecies,
        reason: this.currentReason,
        index: button.index
      });
      this.setTallyOpMode(TallyOperationMode.AddNamedSpeciesSelectType);
    } else if (this.tallyMode === TallyOperationMode.MoveSelectLocation) {
      this.swapButtons({
        oldButton: this.currentSelectedButton,
        newIndex: button.index
      });
      this.setTallyOpMode(TallyOperationMode.Tally);
    } else if (
      this.tallyMode === TallyOperationMode.AddExistingSpeciesSelectLocation
    ) {
      this.assignNewButton({
        species: { shortCode: this.currentSelectedButton.labels.shortCode }, // TODO Species full rec?
        reason: this.currentReason,
        index: button.index
      });
      this.setCurrentReason('');
      this.setTallyOpMode(TallyOperationMode.AddExistingSpeciesSelectReason);
    } else if (this.tallyMode === TallyOperationMode.AddTempSpeciesLocation) {
      this.assignNewButton({
        species: { shortCode: this.currentTempName },
        reason: this.currentReason,
        index: button.index
      });
      this.setCurrentReason('');
      this.setTallyOpMode(TallyOperationMode.AddTempSpeciesReason);
    }
  }

  public handleSelectedReason(reason: string) {
    this.setCurrentReason(reason);
    if (this.tallyMode === TallyOperationMode.AddNamedSpeciesSelectType) {
      this.setTallyOpMode(TallyOperationMode.AddNamedSpeciesSelectLocation);
    } else if (
      this.tallyMode === TallyOperationMode.AddExistingSpeciesSelectReason
    ) {
      this.setTallyOpMode(TallyOperationMode.AddExistingSpeciesSelectLocation);
    } else if (this.tallyMode === TallyOperationMode.AddTempSpeciesReason) {
      this.setTallyOpMode(TallyOperationMode.AddTempSpeciesLocation);
    } else if (this.tallyMode === TallyOperationMode.ModifyDispSelectDisp) {
      this.assignNewButton({
        species: { shortCode: this.currentSelectedButton.labels.shortCode }, // TODO full species?
        reason,
        index: this.currentSelectedButton.index
      });
      // Return to tally mode
      this.handleCancel();
    }
  }

  public closeAddSpeciesPopup() {
    (this.$refs.addNamedSpeciesModal as any).close();
    // TODO cleaner way to do this? (calling member of component)
  }

  public openAddSpeciesPopup() {
    (this.$refs.addNamedSpeciesModal as any).open();
    // TODO cleaner way to do this? (calling member of component)
  }

  public handleAddNamedSpecies(species: any) {
    // console.log('MODE', this.tallyMode);
    // console.log('SPECIES', species);
    switch (this.tallyMode) {
      case TallyOperationMode.AddNamedSpeciesSelectSpecies:
        // Side effect of close: switches back to tally mode
        this.closeAddSpeciesPopup();
        this.currentSelectedSpecies = species;
        this.setTallyOpMode(TallyOperationMode.AddNamedSpeciesSelectType);
        this.handleControlEvent('tally-addnew-controls');
        break;
      case TallyOperationMode.NameTempSpeciesSelectSpecies:
        this.reassignSpecies({
          oldSpeciesCode: this.currentSelectedSpecies.shortCode,
          newSpeciesCode: species.shortCode
        });
        // Side effect of close: switches back to tally mode
        this.closeAddSpeciesPopup();
        break;
    }
  }

  public handleCancelAddNamedSpecies() {
    // TODO same as handleCancel?
    this.setTallyOpMode(TallyOperationMode.Tally);
    this.handleControlEvent('tally-mode');
  }

  public handleResetAllData() {
    this.reset();
    this.handleCancel();
  }

  public handleCancel() {
    // Generic Cancel - return to tally mode
    // TODO refactor into setTallyMode
    this.currentSelectedSpecies = {};
    this.setCurrentReason('');
    this.setCurrentButtonIdx(-1);
    this.currentSelectedButton = {};
    this.setTallyOpMode(TallyOperationMode.Tally);
    this.handleControlEvent('tally-mode');
  }

  public handleControlEvent(controlName: string) {
    switch (controlName) {
      case 'modify-layout':
        this.currentControlComponent = 'tally-layout-controls';
        this.clearLastIncDec();
        break;
      case 'modify-layout-done':
      case 'all-tallies-done':
      case 'tally-mode':
        this.setTallyOpMode(TallyOperationMode.Tally);
        this.currentControlComponent = 'tally-controls';
        break;
      case 'all-tallies-for':
        this.clearLastIncDec();
        if (this.tallyState.operationMode === TallyOperationMode.AllTalliesSelectSpecies) {
          this.handleCancel();
        } else {
          this.setTallyOpMode(TallyOperationMode.AllTalliesSelectSpecies);
        }
        break;
      case 'all-tallies':
        this.setTallyOpMode(TallyOperationMode.AllTallies);
        this.currentControlComponent = 'tally-alltallies-controls';
        break;
      case 'weights-for':
        this.clearLastIncDec();
        if (this.tallyState.operationMode === TallyOperationMode.WeightsForSelectSpecies) {
          this.handleCancel();
        } else {
          this.setTallyOpMode(TallyOperationMode.WeightsForSelectSpecies);
        }
        break;
      case 'tally-addnew-controls':
        this.currentControlComponent = 'tally-addnew-controls';
        break;
      case 'delete-button':
        this.setTallyOpMode(TallyOperationMode.DeleteButtonSelect);
        break;
      case 'move-button':
        this.setTallyOpMode(TallyOperationMode.MoveButtonSelect);
        break;
      case 'modify-disp':
        this.setTallyOpMode(TallyOperationMode.ModifyDispButtonSelect);
        break;
      case 'add-exist':
        this.setCurrentReason('');
        this.setTallyOpMode(TallyOperationMode.AddExistingSpeciesSelectSpecies);
        break;
      case 'add-temp-button':
        this.incTempSpeciesCounter();
        this.currentSelectedSpecies = {
          shortCode: this.currentTempName
        };
        this.setTallyOpMode(TallyOperationMode.AddTempSpeciesReason);
        this.currentControlComponent = 'tally-addexisting-controls';
        break;
      case 'select-exist-species':
        this.setTallyOpMode(TallyOperationMode.AddExistingSpeciesSelectReason);
        this.currentControlComponent = 'tally-addexisting-controls';
        break;
      case 'name-temp-button':
        this.setTallyOpMode(TallyOperationMode.NameTempSpeciesSelect);
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
        this.openAddSpeciesPopup();
        break;
      case 'rename-temp-species':
        this.setTallyOpMode(TallyOperationMode.NameTempSpeciesSelectSpecies);
        this.openAddSpeciesPopup();
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
        labels: { shortCode: '??', reason: '??' }
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
      !targetButton ||
      !targetButton.labels ||
      !targetButton.labels.shortCode ||
      !this.tallyState.tallyDataRec
    ) {
      return { count: -1 };
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
    } else {
      return { count: -1 };
    }
  }

  // --- Private Methods ---
  private mounted() {
    this.connectDB();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped></style>
