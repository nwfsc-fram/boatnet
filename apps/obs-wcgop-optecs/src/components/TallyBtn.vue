<template>
  <q-btn :color="color" :label="label"/>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../_store/types/types';
import { State, Action } from 'vuex-class';
import { QBtn } from 'quasar';

@Component
export default class TallyBtn extends Vue {
  @Prop({default: undefined}) public color!: string;
  @Prop({default: undefined}) public label!: string;
}
</script>
