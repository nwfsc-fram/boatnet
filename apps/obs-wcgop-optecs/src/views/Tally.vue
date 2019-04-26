<template>
  <q-page padding>
    <div class="q-gutter-md">
      <div v-for="r in 4" class="row" :key="`md-r-${r}`">
        <div v-for="c in 8" class="col" :key="`md-c-${c}`">
          <!-- TODO: this should be in a TallyState -->
          <tally-btn :data="getData(r,c)" />
        </div>
      </div>
    </div>
    <div class="q-pa-md">
      <component v-bind:is="currentControlComponent" @controlevent="handleControlEvent"></component>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TallyButtonData } from '../_store/types';
import TallyBtn from '../components/tally/TallyBtn.vue';
import TallyControls from '../components/tally/TallyControls.vue';
import TallyLayoutControls from '../components/tally/TallyLayoutControls.vue';

Vue.component('tally-btn', TallyBtn);
Vue.component('tally-controls', TallyControls);
Vue.component('tally-layout-controls', TallyLayoutControls);

@Component
export default class Tally extends Vue {
  public horizButtonCount = 8;
  public vertButtonCount = 4;
  public btnLabel = '';
  public btnSize = '18px';
  public buttonData: TallyButtonData[] = [];

  private currentControlComponent = 'tally-controls';
  constructor() {
    super();
    for (let r = 0; r < this.vertButtonCount; r++) {
      for (let c = 0; c < this.horizButtonCount; c++) {
        if (c === 6) {
          this.buttonData.push({
            color: 'red',
            code: 'CORN',
            reason: 'PRED',
            count: r
          });
        } else if (c === 7) {
          this.buttonData.push({
            color: 'green-9',
            code: 'SABL',
            reason: 'RET',
            count: 0
          });
        } else if (c === 5) {
          this.buttonData.push({ blank: true });
        } else {
          this.buttonData.push({
            'color': 'green-3',
            'text-color': 'black',
            'code': 'PHLB',
            'reason': 'MKT',
            'count': 0
          });
        }
      }
    }
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
        this.currentControlComponent = 'tally-controls';
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
  private getData(row: number, column: number) {
    const idx = this.getBtnIndex(row, column);
    return this.buttonData[idx];
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>

</style>
