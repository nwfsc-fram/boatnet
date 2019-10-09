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
  @Action('setNext', { namespace: 'keyboard' })
  private setNext: any;

  private mounted() {
    this.setNext(this.next);
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

  // private outputKey(event: any) {
  //   this.filterText += event;
  //   console.log(event);
  // }

  private setInput(event: any) {
    console.log(event);
  }

  private next() {
    const inputs = document.querySelectorAll('input');
    let found = false;
    for (let i = 0; i < inputs.length; i++) {
      if (
        !found &&
        inputs[i] === this.keyboard.keyboardInputTarget &&
        i < inputs.length - 1
      ) {
        found = true;
        this.$nextTick(() => {
          inputs[i + 1].focus();
        });
      }
    }
    if (!found) {
      this.setKeyboard(false);
    }
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
