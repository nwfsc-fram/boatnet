<template>
  <q-btn-group spread>
    <tally-control-btn control-name="reset-data" @controlclick="handleControlClick" color="red">Reset<br>Data</tally-control-btn>
    <tally-control-btn control-name="add-named-species" @controlclick="handleControlClick" color="green-5">
      Add
      <br>Named
      <br>Species
    </tally-control-btn>
    <q-separator vertical/>
    <tally-control-btn control-name="name-temp-button" @controlclick="handleControlClick" :disabled="!isNameTempEnabled">
      Name
      <br>Temp
      <br>Species
    </tally-control-btn>
    <tally-control-btn control-name="add-temp-button" @controlclick="handleControlClick" color="green-5">
      Add
      <br>Temp
      <br>Species
    </tally-control-btn>
    <tally-control-btn control-name="modify-disp" @controlclick="handleControlClick" color="grey-4">
      Modify
      <br>Disp.
    </tally-control-btn>
    <tally-control-btn control-name="delete-button" @controlclick="handleControlClick" color="red-5">
      Delete
      <br>Tally
    </tally-control-btn>
    <tally-control-btn control-name="move-button" @controlclick="handleControlClick" color="grey-4">
      Move
      <br>Tally
    </tally-control-btn>
    <tally-control-btn control-name="add-exist" @controlclick="handleControlClick" color="green-5">
      Add
      <br>Existing
      <br>Species
    </tally-control-btn>
    <tally-control-btn color="green-9" textcolor="white" control-name="modify-layout-done" @controlclick="handleControlClick" >Done</tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import TallyControlBtn from './TallyControlBtn.vue';
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class TallyLayoutControls extends Vue {

  @Getter('isNameTempEnabled', { namespace: 'tallyState' })
  private isNameTempEnabled!: boolean;

  public handleControlClick(controlName: string): void {
    // Pass along button event to Tally parent component
    if (controlName) {
      this.$emit('controlevent', controlName);
    } else {
      console.log('[Tally Controls] Control button has no assigned name, skipping.');
    }
  }
}
</script>
