<template>
  <q-btn-group spread>
    <tally-control-btn
      control-name="tally-mode"
      :color="tallyMode.color"
      :textcolor="tallyMode['textcolor']"
      size="md"
      @controlclick="handleControlClick"
    >
      Tally
      <br>Mode
      <br>
      {{ tallyMode.incdecText }}
    </tally-control-btn>
    <template v-for="reasonInfo in reasonButtonColors">
      <tally-btn
        :key="reasonInfo.name"
        :layout="getLayout(reasonInfo)"
        :data="getData(reasonInfo)"
        size="md"
        @dataChanged="handleDataChanged"
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
      {{ speciesCode }}
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
  @Action('clearLastIncDec', { namespace: 'tallyState' })
  private clearLastIncDec: any;
  @Getter('reasonButtonColors', { namespace: 'tallyState' })
  private reasonButtonColors!: any[];
  @Getter('incDecValue', { namespace: 'tallyState' })
  private incDecValue!: number;

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

  public mounted() {
    this.tallyMode =
      this.incDecValue > 0 ? this.tallyModeInc : this.tallyModeDec;
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

  public handleDataChanged(data: any) {
    // Don't care, but this means we were clicked, so clear the up/down arrow
    this.clearLastIncDec();
  }
  public handleControlClick(controlName: string): void {
    const isInc = this.tallyMode.value > 0;
    switch (controlName) {
      case 'tally-mode':
        // switch mode
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
