<template>
  <q-page padding>
    <q-toggle v-model="appState.isKeyboardEnabled" label="Show Keyboard" @input="enableKeyboard"/>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../_store/types/types';
import { State, Action } from 'vuex-class';

@Component
export default class PageSettings extends Vue {
  @State('appState') private appState!: WcgopAppState;
  @Action('setKeyboardStatus', { namespace: 'appState' }) private setKeyboardStatus: any;

  private enableKeyboard() {
    this.setKeyboardStatus(this.appState.isKeyboardEnabled);
  }
}
</script>
