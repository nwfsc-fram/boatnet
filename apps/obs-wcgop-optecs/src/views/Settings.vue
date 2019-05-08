<template>
  <q-page padding>
    <div>
      <q-toggle v-model="isKeyboardEnabled" label="Show Keyboard" @input="enableKeyboard"/>
    </div>
    <div>
      <q-toggle v-model="isSoundEnabled" label="Enable Sound" @input="enableSound"/>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../_store/types/types';
import { State, Action } from 'vuex-class';

@Component
export default class PageSettings extends Vue {
  public isKeyboardEnabled?: boolean = false;
  public isSoundEnabled?: boolean = false;

  @State('appState') private appState!: WcgopAppState;
  @Action('setKeyboardStatus', { namespace: 'appState' })
  private setKeyboardStatus: any;
  @Action('setSoundEnabled', { namespace: 'appState' })
  private setSoundEnabled: any;


  private mounted() {
    this.isKeyboardEnabled = this.appState.isKeyboardEnabled;
    this.isSoundEnabled = this.appState.isSoundEnabled;
  }

  private enableKeyboard(input: boolean) {
    this.setKeyboardStatus(this.isKeyboardEnabled);
  }

  private enableSound() {
    this.setSoundEnabled(this.isSoundEnabled);
  }
}
</script>
