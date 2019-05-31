<template>
  <q-btn-group spread>
    <tally-control-btn color="grey-2" text-color="black" control-name="history" @controlclick="handleControlClick">History</tally-control-btn>
    <tally-control-btn control-name="template-manager" color="grey-3" @controlclick="handleControlClick">
      Template
      <br>Save/Load
    </tally-control-btn>
    <q-separator vertical/>
    <tally-control-btn control-name="modify-layout" @controlclick="handleControlClick" color="grey-4" text-color="black">
      Modify
      <br>Layout
    </tally-control-btn>
    <tally-control-btn control-name="tally-mode" @controlclick="handleControlClick" :color="tallyMode.color" :textcolor="tallyMode['textcolor']">
      Tally
      <br>Mode
      <br>{{tallyMode.incdecText}}
    </tally-control-btn>
    <q-separator vertical/>
    <tally-control-btn control-name="weights-for" @controlclick="handleControlClick" color="grey-5" text-color="black">
      Weights
      <br>For...
    </tally-control-btn>
    <tally-control-btn control-name="all-tallies-for" @controlclick="handleControlClick" color="grey-6" text-color="black">     All
      <br>Tallies
      <br>For...
    </tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import TallyControlBtn from './TallyControlBtn.vue';
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class TallyControls extends Vue {

  private tallyModeInc: any = {
    value: 1,
    color: 'light-blue-2',
    textcolor: 'black',
    incdecText: '+1'
  };

  private tallyModeDec: any = {
    value: -1,
    color: 'red',
    textcolor: 'white',
    incdecText: '-1'
  };

  private tallyMode = this.tallyModeInc;

  public setTallyMode(incMode: boolean) {
    if (incMode) {
      this.tallyMode = this.tallyModeInc;
      this.$emit('controlevent', 'tally-inc');
    } else {
      this.tallyMode = this.tallyModeDec;
      this.$emit('controlevent', 'tally-dec');
    }
  }

  public handleControlClick(controlName: string): void {
    // Intercept, or pass along event to Tally parent component
    switch (controlName) {
      case 'tally-mode':
        // switch mode
        const isInc = this.tallyMode.value > 0;
        this.setTallyMode(!isInc);
        break;
      default:
        this.$emit('controlevent', controlName);
        break;
    }

  }
}
</script>
