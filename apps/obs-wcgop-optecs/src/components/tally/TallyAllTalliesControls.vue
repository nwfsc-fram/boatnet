<template>
  <q-btn-group spread>
    <tally-control-btn control-name="tally-mode" @controlclick="handleControlClick" :color="tallyMode.color" :textcolor="tallyMode['textcolor']">Tally
      <br>Mode
      <br>{{tallyMode.incdecText}}
    </tally-control-btn>
    <template v-for="reason in reasons">
    <tally-control-btn :control-name="reason" color="grey-4" :key="`${reason}`" @controlclick="handleControlClick">
      {{species}}
      <br>{{reason}}
      <br>{{counts[reason]}}
    </tally-control-btn>
    </template>
    <tally-control-btn color="red-5" textcolor="white" control-name="all-tallies-done" @controlclick="handleControlClick" >Done<br>with<br>{{species}}</tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import TallyControlBtn from './TallyControlBtn.vue';
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class TallyAllTalliesControls extends Vue {
  @Prop({ default: undefined }) public species!: string; // TODO probably pass actual record
  public reasons: string[] = [
  'SFTY',
  'DOCK',
  'ACCI',
  'USED',
  'OTHR',
  'REG',
  'DROP',
  'PRED',
  'MKT',
  'RET'
  ];

  private counts: any = { // Map/ Set is not reactive, so came up with this workaround
    SFTY: 0,
    DOCK: 0,
    ACCI: 0,
    USED: 0,
    OTHR: 0,
    REG: 0,
    DROP: 0,
    PRED: 0,
    MKT: 0,
    RET: 0
  };

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

  public incCount(reason: string) {
   this.counts[reason]++;
  }

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
    switch (controlName) {
     case 'tally-mode':
        // switch mode
        const isInc = this.tallyMode.value > 0;
        this.setTallyMode(!isInc);
        break;
      case 'all-tallies-done':
        this.$emit('controlevent', controlName);
      default:
        this.incCount(controlName);
    }
  }
}
</script>
