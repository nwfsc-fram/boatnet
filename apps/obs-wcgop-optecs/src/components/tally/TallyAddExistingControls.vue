<template>
  <q-btn-group spread>
    <template v-for="reason in reasonButtonColors">
      <tally-control-btn
        :key="`${reason.name}`"
        :control-name="reason.name"
        :color="reason.color.bg"
        :text-color="reason.color.text"
        @controlclick="handleControlClick"
      >
        <q-badge
          v-if="reason.name === currentReason"
          color="blue"
          text-color="white"
          floating
        >
          SELECTED
        </q-badge>
        {{ speciesCode }}
        <br>
        {{ reason.name }}
      </tally-control-btn>
    </template>
    <tally-control-btn
      color="red-5"
      textcolor="white"
      control-name="tally-mode"
      @controlclick="handleControlClick"
    >
      Done
      <br>with
      <br>
      {{ speciesCode }}
    </tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import TallyControlBtn from './TallyControlBtn.vue';
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class TallyAddExistingControls extends Vue {
  @Prop({ default: undefined }) public speciesCode!: string; // TODO pass actual species record?
  @Action('setCurrentReason', { namespace: 'tallyState' })
  private setCurrentReason: any;
  @Getter('reasonTypes', { namespace: 'tallyState' })
  private reasonTypes!: string[];
  @Getter('reasonButtonColors', { namespace: 'tallyState' })
  private reasonButtonColors!: any[];
  @Getter('currentReason', { namespace: 'tallyState' })
  private currentReason!: string;

  public handleControlClick(controlName: string): void {
    switch (controlName) {
      case 'tally-mode':
        this.$emit('controlevent', controlName);
        break;
      default:
        this.setCurrentReason(controlName);
        this.$emit('selectedReason', controlName);
      // TODO placement mode
    }
  }
}
</script>
