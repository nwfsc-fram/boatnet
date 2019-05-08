<template>
  <q-page padding>
    <div class="q-gutter-md">
      <div v-for="r in vertButtonCount" class="row" :key="`md-r-${r}`">
        <div v-for="c in horizButtonCount" class="col" :key="`md-c-${c}`">
          <!-- TODO: this should be in a TallyState -->
          <tally-btn :data="getButton(r,c)" @dataChanged="handleButtonData"/>
        </div>
      </div>
    </div>
    <div class="q-pa-md">
      <component
        v-bind:is="currentControlComponent"
        @controlevent="handleControlEvent"
        species="CORN"
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
    <tally-addnamedspecies-dialog ref="addNamedSpeciesModal" @addNewSpecies="handleAddNamedSpecies" :speciesList="speciesList"/>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

import { TallyButtonData } from '../_store/types';
import TallyBtn from '../components/tally/TallyBtn.vue';
import TallyControls from '../components/tally/TallyControls.vue';
import TallyLayoutControls from '../components/tally/TallyLayoutControls.vue';
import TallyAllTalliesControls from '../components/tally/TallyAllTalliesControls.vue';
import TallyAddNamedSpeciesDialog from '../components/tally/TallyAddNamedSpeciesDialog.vue';

import { WcgopAppState } from '../_store/types';
import { TallyState } from '../_store/types';

Vue.component('tally-btn', TallyBtn);
Vue.component('tally-controls', TallyControls);
Vue.component('tally-layout-controls', TallyLayoutControls);
Vue.component('tally-alltallies-controls', TallyAllTalliesControls);
Vue.component('tally-addnamedspecies-dialog', TallyAddNamedSpeciesDialog);

@Component({
  pouch: {
    tallyTemplates() {
      return {
        database: pouchService.userDBName,
        selector: { type: 'tally-record' },
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
  @Action('updateButton', { namespace: 'tallyState' })
  private updateButton: any;
  @Action('reset', { namespace: 'tallyState' })
  private reset: any;
  @Action('setTallyIncDec', { namespace: 'tallyState' })
  private setTallyIncDec: any;

  @Getter('vertButtonCount', { namespace: 'tallyState' })
  private vertButtonCount!: number;
  @Getter('horizButtonCount', { namespace: 'tallyState' })
  private horizButtonCount!: number;

  private btnLabel = '';
  private btnSize = '18px';

  private currentControlComponent = 'tally-controls';

  private tallyTemplates!: any;
  private confirmReset = false;

  private speciesList = [];
  constructor() {
    super();

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

  public getCode(row: number, column: number) {
    return this.getButton(row, column).code;
  }

  public getReason(row: number, column: number) {
    return this.getButton(row, column).reason;
  }

  public getCount(row: number, column: number) {
    return this.getButton(row, column).count;
  }

  public handleButtonData(button: TallyButtonData) {
    // console.log('GOT BUTTON DATA', button);
    this.updateButton(button);
  }

  public handleAddNamedSpecies(species: any) {
    console.log('TODO Handle add', species);
    (this.$refs.addNamedSpeciesModal as TallyAddNamedSpeciesDialog).close();
  }

  public handleControlEvent(controlName: string) {
    switch (controlName) {
      case 'modify-layout':
        this.currentControlComponent = 'tally-layout-controls';
        break;
      case 'modify-layout-done':
      case 'all-tallies-done':
        this.currentControlComponent = 'tally-controls';
        break;
      case 'all-tallies-for':
        this.currentControlComponent = 'tally-alltallies-controls';
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
        (this.$refs.addNamedSpeciesModal as TallyAddNamedSpeciesDialog).open();
        break;
      default:
        console.log('Unhandled tally control event:', controlName);
        break;
    }
  }

  private getBtnIndex(row: number, column: number) {
    // Fixes weird 1-based v-for loops
    return column + (row - 1) * this.horizButtonCount - 1;
  }
  private getButton(row: number, column: number) {
    if (
      !this.tallyState.tallyRecord ||
      !this.tallyState.tallyRecord.buttonData
    ) {
      return { code: '-', reason: '-', count: 0 }; // temp fake data
    }
    const idx = this.getBtnIndex(row, column);
    return this.tallyState.tallyRecord.buttonData[idx];
  }

  // --- Private Methods ---

  private mounted() {
    this.connectDB();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped></style>
