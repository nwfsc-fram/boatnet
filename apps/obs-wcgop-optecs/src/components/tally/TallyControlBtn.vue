<template>
  <q-btn
    class="q-px-md q-py-xs"
    :color="color"
    :text-color="textcolor"
    :disabled="disabled"
    :control-name="controlName"
    :size="size"
    @click="handleClick"
  >
    <slot/>
  </q-btn>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { TallyButtonLayoutData } from '../../_store/types';

/* tslint:disable:no-var-requires  */
const funnyFile = require('../../assets/audio/funnyclick.mp3');
const funnyAudio = new Audio(funnyFile);

const lowClickFile = require('../../assets/audio/click3.mp3');
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
