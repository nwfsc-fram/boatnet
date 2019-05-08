<template>
  <span>
    <span v-if="data && !data.blank">
      <q-btn
        class="q-px-lg q-py-xs"
        :color="data.color"
        :text-color="data['text-color']"
        :size="size"
        :disabled="disabled"
        :data="data"
        @click="handleClick"
      >
        {{data.code}}
        <br>
        {{data.reason}}
        <br>
        {{data.count}}
      </q-btn>
    </span>
    <span v-if="data && data.blank">
      <!-- <q-btn class="q-px-lg q-py-xs" size="30px" round width="30px"/> -->
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../../_store/types';
import { State, Getter, Action } from 'vuex-class';
import { QBtn } from 'quasar';
import { TallyButtonData } from '../../_store/types';

/* tslint:disable:no-var-requires  */
// TODO Move audio to a separate service
const lowClickFile = require('../../assets/audio/click4.wav');
const highClickFile = require('../../assets/audio/clack.wav');
const funnyFile = require('../../assets/audio/funnyclick.wav');

const lowClickAudio = new Audio(lowClickFile);
const highClickAudio = new Audio(highClickFile);
const funnyAudio = new Audio(funnyFile);

@Component
export default class TallyBtn extends Vue {
  // Inherited properties:
  @Prop({ default: undefined }) public color!: string;
  @Prop({ default: undefined }) public label!: string;
  @Prop({ default: undefined }) public size!: string;
  @Prop({ default: undefined }) public round!: boolean;
  @Prop({ default: undefined }) public disabled!: boolean;
  // Data:
  @Prop({ default: undefined }) public data!: TallyButtonData;
  @Prop({ default: undefined }) public blank!: boolean;
  // @Prop({ default: undefined }) public reason!: boolean;
  // @Prop({ default: undefined }) public count!: boolean;
  @Getter('incDecValue', { namespace: 'tallyState' })
  private incDecValue!: number;
  @Getter('isSoundEnabled', { namespace: 'appState' })
  private isSoundEnabled!: boolean;


  public handleClick() {
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
        if (this.data.count < 0 ) {
          this.data.count = 0;
        }
      }

      this.$emit('dataChanged', this.data);
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
      default:
        funnyAudio.play();
        break;
    }
  }
}
</script>
