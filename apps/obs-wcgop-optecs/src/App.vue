<template>
  <div id="app">
    <router-view @displayKeyboard="displayKeyboard"/>
    <boatnet-keyboard :visible.sync="isKeyboardVisible" :layout="keyboardType" :input="keyboardInputTarget"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component
export default class App extends Vue {
  private isKeyboardVisible: boolean = false;
  private keyboardType: string = 'normal';
  private keyboardInputTarget = null;
  private displayKeyboard(event: any) {
    this.isKeyboardVisible = true;
    this.keyboardType = event.dataset.layout;
    this.keyboardInputTarget = event;
  }
}
</script>
