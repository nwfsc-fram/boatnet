<template>
  <q-page padding>
    <div class="q-gutter-md">
      <div v-for="r in 4" class="row" :key="`md-r-${r}`">
        <div v-for="c in 8" class="col" :key="`md-c-${c}`">
          <tally-btn :data="getData(r,c)"/>
        </div>
      </div>
    </div>
    <div class="q-pa-md">
      <q-btn-group spread>
        <tally-control-btn color="light-blue-2" text-color="black">History</tally-control-btn>
        <tally-control-btn disabled>
          Switch
          <br>Page
          <br>&gt;
        </tally-control-btn>
        <q-separator vertical/>
        <tally-control-btn color="grey-4" text-color="black">
          Modify
          <br>Layout
        </tally-control-btn>
        <tally-control-btn color="light-blue-2" text-color="black">
          Tally
          <br>Mode
          <br>+1
        </tally-control-btn>
        <q-separator vertical/>
        <tally-control-btn color="grey-4" text-color="black">
          Weights
          <br>For...
        </tally-control-btn>
        <tally-control-btn color="grey-4" text-color="black">
          All
          <br>Tallies
          <br>For...
        </tally-control-btn>
      </q-btn-group>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TallyButtonData } from '../_store/types';
import TallyBtn from '../components/TallyBtn.vue';
import TallyControlBtn from '../components/TallyControlBtn.vue';

Vue.component('tally-btn', TallyBtn);
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class Tally extends Vue {
  public horizButtonCount = 8;
  public vertButtonCount = 4;
  public btnLabel = '';
  public btnSize = '18px';
  public buttonData: TallyButtonData[] = [];

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

  public handleClick(row: number, column: number) {
    console.log('Incroised');
    const idx = this.getBtnIndex(row, column);
    // this.buttonData[idx].count++;
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







// .row > div {







//   padding: 10px 15px;







//   background: rgba(86, 61, 124, 0.15);







//   border: 1px solid rgba(86, 61, 124, 0.2);







// }















// .row + .row {







//   margin-top: 1rem;







// }







</style>
