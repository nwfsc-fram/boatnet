<template>
  <div>
    <vue-touch-keyboard
      :class="{ keyboard: true }"
      :options="keyboardOptions"
      v-if="visible"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="input"
      :next="next"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

@Component
export default class BoatnetKeyboard extends Vue {
  @Prop({ default: 'normal' }) public layout!: string;
  @Prop({ default: true }) public visible!: boolean;
  @Prop() public input!: any;

  private keyboardOptions = {
    useKbEvents: false,
    preventClickEvent: false
  };

  private accept(text: string) {
    this.hide();
  }

  private hide() {
    this.$emit('update:visible', false);
  }

  private next() {
    this.$emit('next');
  }
}
</script>

<style scoped>
.keyboard {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: 1000;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;

  padding: 1em;
}
</style>