<template>
  <q-btn-group spread>
    <tally-control-btn
      control-name="tally-mode"
      @controlclick="handleControlClick"
      :color="tallyMode.color"
      :textcolor="tallyMode['textcolor']"
      size="md"
    >
      Tally
      <br>Mode
      <br>
      {{tallyMode.incdecText}}
    </tally-control-btn>
    <template v-for="reasonInfo in reasonButtonColors">
      <tally-btn
        :layout="getLayout(reasonInfo)"
        :data="getData(reasonInfo)"
        :key="reasonInfo.name"
        size="md"
      />
    </template>
    <tally-control-btn
      color="red-5"
      textcolor="white"
      control-name="all-tallies-done"
      size="md"
      @controlclick="handleControlClick"
    >
      Done
      <br>with
      <br>
      {{speciesCode}}
    </tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

import TallyControlBtn from './TallyControlBtn.vue';
import TallyBtn from './TallyBtn.vue';
import {
  TallyCountData,
  TallyButtonLayoutData,
  TallyState
} from '../../_store/types';
Vue.component('tally-control-btn', TallyControlBtn);
Vue.component('tally-btn', TallyBtn);

@Component
export default class TallyAllTalliesControls extends Vue {
  @Prop({ default: undefined }) public speciesCode!: string; // TODO probably pass actual record
  @State('tallyState') private tallyState!: TallyState;
  @Action('updateAllDB', { namespace: 'tallyState' })
  private updateAllDB: any;
  @Action('updateButtonData', { namespace: 'tallyState' })
  private updateButtonData: any;
  @Getter('reasonButtonColors', { namespace: 'tallyState' })
  private reasonButtonColors!: any[];

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
    switch (controlName) {
      case 'tally-mode':
        // switch mode
        const isInc = this.tallyMode.value > 0;
        this.setTallyMode(!isInc);
        break;
      case 'all-tallies-done':
        this.updateAllDB();
      // Fall through to default
      default:
        this.$emit('controlevent', controlName);
    }
  }

  public getData(reasonInfo: any): TallyCountData {
    const targetData = this.tallyState.tallyDataRec!.data!.filter(
      (rec: TallyCountData) => {
        return (
          rec.shortCode === this.speciesCode && rec.reason === reasonInfo.name
        );
      }
    );
    if (targetData[0]) {
      return targetData[0];
    } else {
      this.updateButtonData({
        skipLayoutUpdate: true,
        skipDataUpdate: true, // skip data update to avoid slamming the DB with zero count entries
        data: {
          // TODO full species data?
          shortCode: this.speciesCode,
          reason: reasonInfo.name,
          count: 0
        }
      });
      // The update will trigger a data update. For now, return valid data
      return {
        shortCode: this.speciesCode,
        reason: reasonInfo.name,
        count: 0
      };
    }
  }

  public getLayout(reasonInfo: any): TallyButtonLayoutData {
    return {
      index: 99, // prevent index tracking from up-arrowing
      color: reasonInfo.color.bg,
      'text-color': reasonInfo.color.text,
      labels: {
        shortCode: this.speciesCode,
        reason: reasonInfo.name
      }
    };
  }
}
</script>
