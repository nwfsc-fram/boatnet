<template>
  <q-btn-group spread>
    <tally-control-btn color="red">Reset<br>Data</tally-control-btn>
    <tally-control-btn color="grey-4">
      Add
      <br>Named
      <br>Species
    </tally-control-btn>
    <q-separator vertical/>
    <tally-control-btn disabled>
      Name
      <br>Temp
      <br>Species
    </tally-control-btn>
    <tally-control-btn color="grey-4">
      Add
      <br>Temp
      <br>Species
    </tally-control-btn>
    <tally-control-btn color="grey-4">
      Modify
      <br>Disp.
    </tally-control-btn>
    <tally-control-btn color="grey-4">
      Delete
      <br>Tally
    </tally-control-btn>
    <tally-control-btn color="grey-4">
      Move
      <br>Tally
    </tally-control-btn>
    <tally-control-btn color="grey-4">
      Add
      <br>Existing
      <br>Species
    </tally-control-btn>
    <tally-control-btn color="red-5" control-name="modify-layout-done" @controlclick="handleControlClick" >Done</tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import TallyControlBtn from './TallyControlBtn.vue';
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class TallyLayoutControls extends Vue {
  public handleControlClick(controlName: string): void {
    // Pass along button event to Tally parent component
    this.$emit('controlevent', controlName);
  }
}
</script>
