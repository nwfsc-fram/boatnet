<template>
  <div id="app">
    <router-view/>
    <boatnet-keyboard
      :visible.sync="keyboardStatus"
      :layout="keyboard.keyboardType"
      :input="keyboard.keyboardInputTarget"
      @next="next"
    />
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
  @State('keyboard') private keyboard!: KeyboardState;
  @Action('setKeyboard', { namespace: 'keyboard' })
  private setKeyboard: any;
  @Action('setAppConfig', { namespace: 'appSettings' })
  private setAppConfig: any;

  @Action('setAppConfig', { namespace: 'appSettings' })
  private setAppConfig: any;

  private mounted() {
    document.addEventListener('click', () => {
      if (document.activeElement && Object.keys(document.activeElement).length === 0) {
        this.setKeyboard(false);
      }
    });
<<<<<<< HEAD

    this.$store.subscribe((mutation: any, state: any) => {
      switch(mutation.type) {
        case 'pouchState/syncCompleted':
          this.setAppConfig();
          console.log('done setting that');
          break;
      }
    })
=======
    this.setAppConfig();
>>>>>>> 0cf2898d9a728d7d68a97a417fb3c34e3e52c283
  }

  get keyboardStatus() {
    if (this.appState.isKeyboardEnabled && this.keyboard.showKeyboard) {
      return true;
    } else {
      return false;
    }
  }

  set keyboardStatus(status: boolean) {
    this.setKeyboard(status);
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
      if (!found && inputs[i] === this.keyboard.keyboardInputTarget && i < inputs.length - 1) {
        found = true;
        this.$nextTick(() => {
          inputs[i + 1].focus();
        });
      }
    }
    if (!found) {
      this.keyboardStatus = false;
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
