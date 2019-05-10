<template>
  <q-btn-group spread>
    <template v-for="reason in reasonButtonColors">
      <tally-control-btn
        :control-name="reason.name"
        :color="reason.color.bg"
        :textcolor="reason.color.text"
        :key="`${reason.name}`"
        @controlclick="handleControlClick"
      >
        {{species.shortCode}}
        <br>
        {{reason.name}}
      </tally-control-btn>
    </template>
    <tally-control-btn
      color="red-5"
      textcolor="white"
      control-name="cancel"
      @controlclick="handleControlClick"
    >Done</tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

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
  @Getter('reasonButtonColors', { namespace: 'tallyState' })
  private reasonButtonColors!: any[];

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
