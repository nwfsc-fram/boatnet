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
import { AppSettings } from '@boatnet/bn-common';
import { State, Action } from 'vuex-class';

@Component
export default class PageSettings extends Vue {
  public isKeyboardEnabled?: boolean = false;
  public isSoundEnabled?: boolean = false;

  @State('appSettings') private appSettings!: AppSettings;
  @Action('setKeyboardStatus', { namespace: 'appSettings' })
  private setKeyboardStatus: any;
  @Action('setSoundEnabled', { namespace: 'appSettings' })
  private setSoundEnabled: any;


  private mounted() {
    this.isKeyboardEnabled = this.appSettings.isKeyboardEnabled;
    this.isSoundEnabled = this.appSettings.isSoundEnabled;
  }

  private enableKeyboard(input: boolean) {
    this.setKeyboardStatus(this.isKeyboardEnabled);
  }

  private enableSound() {
    this.setSoundEnabled(this.isSoundEnabled);
  }
}
</script>
