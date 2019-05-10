<template>
  <span>
    <span v-if="layout && !layout.blank">
      <q-btn
        class="q-px-lg q-py-md"
        :color="layout.color"
        :text-color="layout['text-color']"
        :size="size"
        :disabled="disabled"
        @click="handleClick"
      >
        {{layout.labels.shortCode}}
        <br>
        {{layout.labels.reason}}
        <br>
        {{data.count}}
      </q-btn>
    </span>
    <span v-if="layout && layout.blank && tallyMode === selectLocationMode">
      <!-- <q-btn class="q-px-lg q-py-xs" size="30px" round width="30px"/> -->
      <q-btn
        outline
        round
        class="q-px-md q-py-md q-ml-md"
        align="around"
        color="black"
        :size="size"
        @click="handleBlankClicked"
      />
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
  TallyButtonMode
} from '../../_store/types';
import { State, Getter, Action } from 'vuex-class';
import { QBtn } from 'quasar';

/* tslint:disable:no-var-requires  */
// TODO Move audio to a separate service
const lowClickFile = require('../../assets/audio/click4.wav');
const highClickFile = require('../../assets/audio/clack.wav');
const funnyFile = require('../../assets/audio/funnyclick.wav');
const spaceyFile = require('../../assets/audio/spaceyclick.wav');

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
  // @Prop({ default: undefined }) public reason!: boolean;
  // @Prop({ default: undefined }) public count!: boolean;
  @Getter('incDecValue', { namespace: 'tallyState' })
  private incDecValue!: number;
  @Getter('tallyMode', { namespace: 'tallyState' })
  private tallyMode!: TallyOperationMode;
  @Getter('isSoundEnabled', { namespace: 'appState' })
  private isSoundEnabled!: boolean;

  private selectLocationMode = TallyOperationMode.AddNamedSpeciesSelectLocation;

  public handleBlankClicked() {
    console.log('HANDLE BLANK CLICKED', this.layout);
    this.$emit('blankClicked', this.layout);
  }

  public handleClick() {
    if (this.tallyMode !== TallyOperationMode.Tally) {
      console.log('Not in Tally mode, no data change.', this.incDecValue);

      this.playSound('bad');
      return;
    }
    if (this.data.count !== undefined) {
      const newVal = this.data.count + this.incDecValue;
      if (this.incDecValue > 0) {
        this.playSound('inc');
        this.data.count = newVal;
      } else if (this.data.count === 0) {
        this.playSound('bad');
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
