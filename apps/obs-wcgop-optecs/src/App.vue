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
import { WcgopAppState } from '@/_store/types';
import { KeyboardState } from './_store';

@Component
export default class App extends Vue {
  @State('appState') private appState!: WcgopAppState;
  @State('keyboard') private keyboard!: KeyboardState;
  @Action('setKeyboard', { namespace: 'keyboard' })
  private setKeyboard: any;

  private mounted() {
    document.addEventListener('click', () => {
      if (document.activeElement && Object.keys(document.activeElement).length === 0) {
        this.setKeyboard(false);
      }
    });
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
  .q-page-container {
    background-color: lightgray;
  }

  .q-dialog__inner--minimized {
  padding: 0 !important;
  }
</style>
