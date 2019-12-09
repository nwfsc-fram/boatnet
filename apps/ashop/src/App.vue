<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { KeyboardState } from '@boatnet/bn-common';
import { AppSettings } from '@boatnet/bn-common';

@Component
export default class App extends Vue {
  @State('appSettings') private appState!: AppSettings;
  @Action('setAppConfig', { namespace: 'appSettings' })
  private setAppConfig: any;

  @State('keyboard') private keyboard!: KeyboardState;
  @Action('setKeyboard', { namespace: 'keyboard' })
  private setKeyboard: any;
  @Action('setActiveFieldName', { namespace: 'keyboard' })
  private setActiveFieldName: any;
  @Action('setValueSelected', { namespace: 'keyboard' })
  private setValueSelected: any;

  private mounted() {
    document.addEventListener('click', () => {
      if ( document.activeElement &&
        Object.keys(document.activeElement).length === 0 &&
        !this.keyboard.valueSelected) {
        this.setKeyboard(false);
        this.setActiveFieldName('');
      } else {
        this.setValueSelected(false);
      }
    });

    this.$store.subscribe((mutation: any, state: any) => {
      switch (mutation.type) {
        case 'pouchState/syncCompleted':
          this.setAppConfig();
          break;
      }
    });
  }
}
</script>

<style>
.q-dialog__inner--minimized {
  padding: 0 !important;
}

.vue-touch-keyboard {
  background-color: grey;
  border-radius: 10px;
}
</style>
