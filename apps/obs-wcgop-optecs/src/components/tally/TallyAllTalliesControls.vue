<template>
  <q-btn-group spread>
    <tally-control-btn color="light-blue-2">Tally<br>Mode<br>+1</tally-control-btn>
    <template v-for="reason in reasons">
    <tally-control-btn :control-name="reason" color="grey-4" :key="`${reason}`" @controlclick="handleControlClick">
      {{species}}
      <br>{{reason}}
      <br>{{counts[reason]}}
    </tally-control-btn>
    </template>
    <tally-control-btn color="red-5" control-name="all-tallies-done" @controlclick="handleControlClick" >Done<br>with<br>{{species}}</tally-control-btn>
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

  public incCount(reason: string) {
   this.counts[reason]++;
  }

  public handleControlClick(controlName: string): void {
    if (controlName !== 'all-tallies-done') {
      this.incCount(controlName);
    } else { // Pass along button event to Tally parent component
      this.$emit('controlevent', controlName);
    }
  }
}
</script>
