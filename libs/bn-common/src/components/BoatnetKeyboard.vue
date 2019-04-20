<template>
  <div>
    <vue-touch-keyboard
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