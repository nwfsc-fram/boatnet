<template>
  <span>
    <span v-if="layout && layout.labels && !layout.blank">
      <q-btn
        class="q-px-lg q-py-md"
        :color="layout.color"
        :text-color="layout['text-color']"
        :disabled="disabled"
        @click="handleClick"
      >
        <q-badge
          v-if="tallyState.lastClickedIndex === layout.index && tallyState.lastClickedWasInc"
          color="black"
          floating
        ><q-icon name="arrow_upward" color="white" /></q-badge>
        <q-badge
          v-if="tallyState.lastClickedIndex === layout.index && !tallyState.lastClickedWasInc"
          color="orange"
          floating
        ><q-icon name="arrow_downward" color="black" /></q-badge>
        <q-badge v-if="tallyMode === deleteButtonMode" color="red" floating>DELETE</q-badge>
        <q-badge v-if="tallyMode === moveSelect" color="blue-3" text-color="black" floating>MOVE</q-badge>
        <q-badge
          v-if="tallyMode === moveLocation && layout.index !== currentButtonIdx"
          color="green-3"
          text-color="black"
          floating
        >SWAP</q-badge>
        <q-badge
          v-if="tallyMode === addExistingSpecies"
          color="blue"
          text-color="white"
          floating
        >SELECT {{layout.labels.shortCode}}</q-badge>
        <q-badge
          v-if="tallyMode === modifyDistSelectButton"
          color="blue"
          text-color="white"
          floating
        >SELECT</q-badge>
        <q-badge
          v-if="tallyMode === nameTempSpeciesButton && layout.labels.shortCode.startsWith('(TEMP')"
          color="red"
          text-color="white"
          floating
        >RENAME</q-badge>
        <q-badge
          v-if="tallyMode === moveLocation && layout.index === currentButtonIdx"
          color="red"
          text-color="white"
          floating
        >MOVING</q-badge>
        <q-badge
          v-if="tallyMode === modifyDistSelectDisp && layout.index === currentButtonIdx"
          color="red"
          text-color="white"
          floating
        >NEW DISP</q-badge>
        {{layout.labels.shortCode}}
        <br>
        {{layout.labels.reason}}
        <br>
        {{data ? data.count : ''}}
      </q-btn>
    </span>
    <span v-if="layout && layout.blank && isHighlightBlankActive()">
      <!-- <q-btn class="q-px-lg q-py-xs" size="30px" round width="30px"/> -->
      <q-btn
        outline
        round
        class="q-px-md q-py-md q-ml-md"
        align="around"
        color="black"
        @click="handleBlankClicked"
      ></q-btn>
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import {
  WcgopAppState,
  TallyOperationMode,
  TallyButtonLayoutData,
  TallyCountData,
  TallyButtonMode,
  TallyState
} from '../../_store/types';
import { State, Getter, Action } from 'vuex-class';
import { QBtn } from 'quasar';

/* tslint:disable:no-var-requires  */
// TODO Move audio to a separate service
const lowClickFile = require('../../assets/audio/click4.mp3');
const highClickFile = require('../../assets/audio/clack.mp3');
const funnyFile = require('../../assets/audio/funnyclick.mp3');
const spaceyFile = require('../../assets/audio/spaceyclick.mp3');

const lowClickAudio = new Audio(lowClickFile);
const highClickAudio = new Audio(highClickFile);
const funnyAudio = new Audio(funnyFile);
const spaceyAudio = new Audio(spaceyFile);

@Component
export default class TallyBtn extends Vue {
  // Inherited properties:
  @Prop({ default: undefined }) public color!: string;
  @Prop({ default: undefined }) public label!: string;
  @Prop({ default: undefined }) public size!: string;
  @Prop({ default: undefined }) public round!: boolean;
  @Prop({ default: undefined }) public disabled!: boolean;
  @Prop({ default: undefined }) public layout!: TallyButtonLayoutData;
  @Prop({ default: undefined }) public data!: TallyCountData;
  @Prop({ default: undefined }) public blank!: boolean;
  @State('tallyState') private tallyState!: TallyState;
  @Getter('incDecValue', { namespace: 'tallyState' })
  private incDecValue!: number;
  @Getter('tallyMode', { namespace: 'tallyState' })
  private tallyMode!: TallyOperationMode;
  @Getter('currentButtonIdx', { namespace: 'tallyState' })
  private currentButtonIdx!: number;
  @Getter('isSoundEnabled', { namespace: 'appState' })
  private isSoundEnabled!: boolean;

  private selectLocationMode = TallyOperationMode.AddNamedSpeciesSelectLocation;
  private deleteButtonMode = TallyOperationMode.DeleteButtonSelect;
  private moveSelect = TallyOperationMode.MoveButtonSelect;
  private moveLocation = TallyOperationMode.MoveSelectLocation;
  private addExistingSpecies =
    TallyOperationMode.AddExistingSpeciesSelectSpecies;
  private addExistingReason = TallyOperationMode.AddExistingSpeciesSelectReason;
  private addExistingLocation =
    TallyOperationMode.AddExistingSpeciesSelectLocation;
  private nameTempSpeciesButton = TallyOperationMode.NameTempSpeciesSelect;
  private modifyDistSelectButton = TallyOperationMode.ModifyDispButtonSelect;
  private modifyDistSelectDisp = TallyOperationMode.ModifyDispSelectDisp;

  public handleBlankClicked() {
    this.$emit('blankClicked', this.layout);
  }

  public isHighlightBlankActive() {
    return (
      this.tallyMode === TallyOperationMode.AddNamedSpeciesSelectLocation ||
      this.tallyMode === TallyOperationMode.MoveSelectLocation ||
      this.tallyMode === TallyOperationMode.AddExistingSpeciesSelectLocation ||
      this.tallyMode === TallyOperationMode.AddTempSpeciesLocation
    );
  }

  public handleClick() {
    if (
      this.tallyMode === TallyOperationMode.DeleteButtonSelect ||
      this.tallyMode === TallyOperationMode.MoveButtonSelect ||
      this.tallyMode === TallyOperationMode.MoveSelectLocation ||
      this.tallyMode === TallyOperationMode.AddExistingSpeciesSelectSpecies ||
      this.tallyMode === TallyOperationMode.AddExistingSpeciesSelectLocation ||
      this.tallyMode === TallyOperationMode.AddTempSpeciesReason ||
      this.tallyMode === TallyOperationMode.AddTempSpeciesLocation ||
      this.tallyMode === TallyOperationMode.NameTempSpeciesSelect ||
      this.tallyMode === TallyOperationMode.ModifyDispButtonSelect
    ) {
      this.$emit('dataChanged', { button: this.layout, data: this.data });
      return;
    } else if (this.tallyMode !== TallyOperationMode.Tally) {
      console.log('Not in Tally mode, no data change.');
      this.playSound('bad');
      return;
    }
    if (this.data && this.data.count !== undefined) {
      const newVal = this.data.count + this.incDecValue;
      if (this.incDecValue > 0) {
        this.playSound('inc');
        this.data.count = newVal;
      } else if (this.data.count === 0) {
        this.playSound('bad');
        return;
      } else {
        this.playSound('dec');
        this.data.count = newVal;
        if (this.data.count < 0) {
          this.data.count = 0;
        }
      }

      this.$emit('dataChanged', { button: this.layout, data: this.data });
    }
  }

  private playSound(soundName: string) {
    if (!this.isSoundEnabled) {
      return;
    }
    switch (soundName) {
      case 'inc':
        highClickAudio.play();
        break;
      case 'dec':
        lowClickAudio.play();
        break;
      case 'bad':
        spaceyAudio.play();
        break;
      default:
        funnyAudio.play();
        break;
    }
  }
}
</script>
