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
      ]" @input="setMode"></q-btn-toggle>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AppSettings } from '@boatnet/bn-common';
import { State, Action, Getter } from 'vuex-class';
import { pouchService } from '@boatnet/bn-pouch';

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
  @Action('setAppConfig', { namespace: 'appSettings' })
  private setAppConfig: any;

  @Getter('appMode', { namespace: 'appSettings' })
  private currentMode!: AppSettings;


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

  private async setMode() {
    this.setAppMode(this.appMode);

    try {
        const db = pouchService.db;
        const queryOptions = {
          limit: 1,
          start_key: this.appMode,
          inclusive_end: true,
          descending: false,
          include_docs: true
        };
        const columns = await db.query(
          pouchService.lookupsDBName,
          'LookupDocs/boatnet-config-lookup',
          queryOptions
        );
        this.setAppConfig(columns.rows[0].doc);
      } catch (err) {
        console.log(err);
      }
  }
}
</script>
