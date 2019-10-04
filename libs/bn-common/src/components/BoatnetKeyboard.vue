<template>
  <div v-if="visible">
    <vue-touch-keyboard
      v-if="layout === 'normal'"
      :class="{ keyboard: true, normal: true }"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="input"
      :next="next"
    />
    <vue-touch-keyboard
      v-else-if="layout === 'numeric'"
      :class="{ keyboard: true, numeric: true }"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="input"
      :next="next"
    />
    <vue-touch-keyboard
      v-else-if="layout === 'compact'"
      :class="{ keyboard: true, numeric: true }"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="input"
      :next="next"
    />
    <div v-if="list != null">
      <boatnet-keyboard-list :list="list"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

@Component
export default class BoatnetKeyboard extends Vue {
  @Prop({ default: 'normal' }) public layout!: string;
  @Prop({ default: true }) public visible!: boolean;
  @Prop() public input!: any;
  @Prop() public list!: string[];

  private keyboardOptions = {
    useKbEvents: false,
    preventClickEvent: true
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
  position: absolute;
  left: 100px;
  bottom: 0;

  z-index: 10000;
  width: 100%;
  height: 200px;

  margin: 0 auto;
  padding: 1em;
}
.normal {
  max-width: 1000px;
}
.numeric {
  max-width: 500px;
}
</style>