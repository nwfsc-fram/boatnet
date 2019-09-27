<template>
  <q-page padding>
    <div>
      <q-toggle v-model="isKeyboardEnabled" label="Show Keyboard" @input="enableKeyboard"/>
    </div>
    <div>
      <q-toggle v-model="isSoundEnabled" label="Enable Sound" @input="enableSound"/>
    </div>
    <div>
      <q-btn-toggle v-model="appMode" :options="[
      {label: 'wcgop', value: 'wcgop'},
      {label: 'ashop', value: 'ashop'},
      {label: 'trawl', value: 'trawl'},
      {label: 'hake', value: 'hake'},
      {label: 'hook + line', value: 'hookline'},
      ]" @change="setMode"></q-btn-toggle>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AppSettings } from '@boatnet/bn-common';
import { State, Action } from 'vuex-class';

@Component
export default class PageSettings extends Vue {
  public isKeyboardEnabled?: boolean = false;
  public isSoundEnabled?: boolean = false;
  public appMode?: string = '';

  @State('appSettings') private appSettings!: AppSettings;
  @Action('setKeyboardStatus', { namespace: 'appSettings' })
  private setKeyboardStatus: any;
  @Action('setSoundEnabled', { namespace: 'appSettings' })
  private setSoundEnabled: any;
  @Action('setAppMode', { namespace: 'appSettings' })
  private setAppMode: any;


  private mounted() {
    this.isKeyboardEnabled = this.appSettings.isKeyboardEnabled;
    this.isSoundEnabled = this.appSettings.isSoundEnabled;
    this.appMode = this.appSettings.appMode;
  }

  private enableKeyboard(input: boolean) {
    this.setKeyboardStatus(this.isKeyboardEnabled);
  }

  private enableSound() {
    this.setSoundEnabled(this.isSoundEnabled);
  }

  private setMode() {
    this.setAppMode(this.appMode);
  }
}
</script>
