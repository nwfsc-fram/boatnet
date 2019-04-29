<template>
  <div id="app">
    <router-view @displayKeyboard="displayKeyboard"/>
    <boatnet-keyboard
      :visible.sync="isKeyboardVisible"
      :layout="keyboardType"
      :input="keyboardInputTarget"
      @next="next"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import { WcgopAppState } from '@/_store/types';

@Component
export default class App extends Vue {
  @State('appState') private appState!: WcgopAppState;
  private isKeyboardVisible: boolean = false;
  private keyboardType: string = 'normal';
  private keyboardInputTarget = null;

  private displayKeyboard(event: any) {
    this.isKeyboardVisible = this.appState.isKeyboardEnabled ? true : false;
    this.keyboardType = event.dataset.layout;
    this.keyboardInputTarget = event;
  }

  private next() {
    const inputs = document.querySelectorAll('input');
    let found = false;
    for (let i = 0; i < inputs.length; i++) {
      if (!found && inputs[i] === this.keyboardInputTarget && i < inputs.length - 1) {
        found = true;
        this.$nextTick(() => {
          inputs[i + 1].focus();
        });
      }
    }
    if (!found) {
      this.isKeyboardVisible = false;
    }
  }
}
</script>
