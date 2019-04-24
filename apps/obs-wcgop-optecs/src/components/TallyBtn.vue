<template>
  <span>
    <span v-if="!data.blank">
      <q-btn
        class="q-px-lg q-py-xs"
        :color="data.color"
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
    <span v-if="data.blank">
      <!-- <q-btn class="q-px-lg q-py-xs" size="30px" round width="30px"/> -->
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../_store/types';
import { State, Action } from 'vuex-class';
import { QBtn } from 'quasar';
import { TallyButtonData } from '../_store/types';

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

  public handleClick() {
    if (this.data.count !== undefined) {
      this.data.count++;
    }
  }
}
</script>
