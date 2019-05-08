<template>
  <q-btn
    class="q-px-lg q-py-xs"
    :color="color"
    :text-color="textcolor"
    :size="size"
    :disabled="disabled"
    :control-name="controlName"
    @click="handleClick"
  >
    <slot/>
  </q-btn>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../../_store/types';
import { State, Action, Getter } from 'vuex-class';
import { QBtn } from 'quasar';
import { TallyButtonData } from '../../_store/types';

/* tslint:disable:no-var-requires  */
const funnyFile = require('../../assets/audio/funnyclick.wav');
const funnyAudio = new Audio(funnyFile);

const lowClickFile = require('../../assets/audio/click3.wav');
const lowClickAudio = new Audio(lowClickFile);

@Component
export default class TallyControlBtn extends Vue {
  // Inherited properties:
  @Prop({ default: undefined }) public color!: string;
  @Prop({ default: 'black' }) public textcolor!: string;
  @Prop({ default: undefined }) public label!: string;
  @Prop({ default: undefined }) public size!: string;
  @Prop({ default: undefined }) public round!: boolean;
  @Prop({ default: undefined }) public disabled!: boolean;
  @Prop({ default: undefined }) public controlName!: string; // History, Tally Mode etc
  // Data:
  @Prop({ default: undefined }) public data!: TallyButtonData;
  @Prop({ default: undefined }) public blank!: boolean;
  @Getter('isSoundEnabled', { namespace: 'appState' })
  private isSoundEnabled!: boolean;


  public handleClick() {
    this.playSound(this.controlName);
    this.$emit('controlclick', this.controlName);
  }

  private playSound(soundName: string) {
    if (!this.isSoundEnabled) {
      return;
    }

    switch (soundName) {
      case 'modify-layout-done':
        funnyAudio.play();
        break;
      default:
        lowClickAudio.play();
        break;
    }
  }
}
</script>
