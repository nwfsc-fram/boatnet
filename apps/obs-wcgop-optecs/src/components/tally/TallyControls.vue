<template>
  <q-btn-group spread>
    <tally-control-btn color="light-blue-2" text-color="black" control-name="history" @controlclick="handleControlClick">History</tally-control-btn>
    <tally-control-btn control-name="switch-page" @controlclick="handleControlClick" disabled>
      Switch
      <br>Page
      <br>&gt;
    </tally-control-btn>
    <q-separator vertical/>
    <tally-control-btn control-name="modify-layout" @controlclick="handleControlClick" color="grey-4" text-color="black">
      Modify
      <br>Layout
    </tally-control-btn>
    <tally-control-btn control-name="tally-mode" @controlclick="handleControlClick" color="light-blue-2" text-color="black">
      Tally
      <br>Mode
      <br>+1
    </tally-control-btn>
    <q-separator vertical/>
    <tally-control-btn control-name="weights-for" @controlclick="handleControlClick" color="grey-4" text-color="black">
      Weights
      <br>For...
    </tally-control-btn>
    <tally-control-btn control-name="all-tallies-for" @controlclick="handleControlClick" color="grey-4" text-color="black">     All
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

  public handleControlClick(controlName: string): void {
    // Pass along button event to Tally parent component
    this.$emit('controlevent', controlName);
  }
}
</script>
