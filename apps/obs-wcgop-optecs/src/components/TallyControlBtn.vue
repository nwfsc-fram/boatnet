<template>
  <q-btn
    class="q-px-lg q-py-xs"
    :color="color"
    :text-color="'text-color'"
    :size="size"
    :disabled="disabled"
    :control="control"
    @click="handleClick"
  >
    <slot/>
  </q-btn>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../_store/types';
import { State, Action } from 'vuex-class';
import { QBtn } from 'quasar';
import { TallyButtonData } from '../_store/types';

/* tslint:disable:no-var-requires  */
const funnyFile = require('../assets/audio/funnyclick.wav');
const funnyAudio = new Audio(funnyFile);

@Component
export default class TallyControlBtn extends Vue {
  // Inherited properties:
  @Prop({ default: undefined }) public color!: string;
  @Prop({ default: undefined }) public label!: string;
  @Prop({ default: undefined }) public size!: string;
  @Prop({ default: undefined }) public round!: boolean;
  @Prop({ default: undefined }) public disabled!: boolean;
  @Prop({ default: undefined }) public control!: string; // History, Tally Mode etc
  // Data:
  @Prop({ default: undefined }) public data!: TallyButtonData;
  @Prop({ default: undefined }) public blank!: boolean;

  public handleClick() {
    this.playSound('control');
  }

  private playSound(soundName: string) {
    switch (soundName) {
      case 'control':
      default:
        funnyAudio.play();
        break;
    }
  }
}
</script>
