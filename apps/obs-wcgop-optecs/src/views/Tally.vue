<template>
  <q-page padding>
    <div class="q-gutter-md">
      <div v-for="r in tallyState.vertButtonCount" class="row" :key="`md-r-${r}`">
        <div v-for="c in tallyState.horizButtonCount" class="col" :key="`md-c-${c}`">
          <!-- TODO: this should be in a TallyState -->
          <tally-btn :data="getData(r,c)" />
        </div>
      </div>
    </div>
    <div class="q-pa-md">
      <component v-bind:is="currentControlComponent" @controlevent="handleControlEvent" species="CORN"></component>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';

import { TallyButtonData } from '../_store/types';
import TallyBtn from '../components/tally/TallyBtn.vue';
import TallyControls from '../components/tally/TallyControls.vue';
import TallyLayoutControls from '../components/tally/TallyLayoutControls.vue';
import TallyAllTalliesControls from '../components/tally/TallyAllTalliesControls.vue';

import { WcgopAppState } from '@/_store/types';
import { TallyState } from '@/_store/types';

Vue.component('tally-btn', TallyBtn);
Vue.component('tally-controls', TallyControls);
Vue.component('tally-layout-controls', TallyLayoutControls);
Vue.component('tally-alltallies-controls', TallyAllTalliesControls);

@Component
export default class Tally extends Vue {

  @State('appState') private appState!: WcgopAppState;
  @State('tallyState') private tallyState!: TallyState;

  @Action('initDefaultTemplate', { namespace: 'tallyState'}) private initDefaultTemplate: any;
  private btnLabel = '';
  private btnSize = '18px';

  private currentControlComponent = 'tally-controls';
  constructor() {
    super();
  }

  public getCode(row: number, column: number) {
    return this.getData(row, column).code;
  }

  public getReason(row: number, column: number) {
    return this.getData(row, column).reason;
  }

  public getCount(row: number, column: number) {
    return this.getData(row, column).count;
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
      default:
        // console.log('Unhandled tally control event:', controlName);
        break;

    }
  }

  private getBtnIndex(row: number, column: number) {
    // Fixes weird 1-based v-for loops
    return column + (row - 1) * this.tallyState.horizButtonCount - 1;
  }
  private getData(row: number, column: number) {
    if (!this.tallyState.buttonData) {
      return {code: '-', reason: '-', count: 0}; // temp fake data
    }
    const idx = this.getBtnIndex(row, column);
    return this.tallyState.buttonData[idx];
  }

  private mounted() {
    if (!this.tallyState.buttonData.length) {
      this.initDefaultTemplate();
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>

</style>
