<template>
  <q-btn-group spread>
    <template v-for="reason in reasons">
      <tally-control-btn
        :control-name="reason"
        color="grey-4"
        :key="`${reason}`"
        @controlclick="handleControlClick"
      >
        {{species.shortCode}}
        <br>
        {{reason}}
      </tally-control-btn>
    </template>
    <tally-control-btn
      color="red-5"
      textcolor="white"
      control-name="cancel"
      @controlclick="handleControlClick"
    >Cancel</tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Action } from 'vuex-class';

import { TallyOperationMode } from '../../_store/types';
import TallyControlBtn from './TallyControlBtn.vue';
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class TallyAddNewButton extends Vue {
  @Prop({ default: undefined }) private species!: any; // TODO Species type here?
  @Action('highlightEmptyButtons', { namespace: 'tallyState' })
  private highlightEmptyButtons: any;
  @Action('setTallyOpMode', { namespace: 'tallyState' })
  private setTallyOpMode: any;

  private reasons: string[] = [
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

  public handleControlClick(controlName: string): void {
    switch (controlName) {
      case 'cancel':
        this.$emit('cancel');
        break;
      default:
        this.$emit('selectedReason', controlName); // Reason e.g. RET, MKT
        this.setTallyOpMode(TallyOperationMode.AddNamedSpeciesSelectLocation);
    }
  }
}
</script>
