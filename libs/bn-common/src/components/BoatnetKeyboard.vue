<template>
  <div v-if="visible">
    <vue-touch-keyboard
      v-if="layout === 'normal'"
      :class="{'normalKeyboard': true,
               'keyboardWithList':(list && list.length != 0),
               'keyboardWithoutList': (list && list.length == 0)}"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="inputTarget"
      :next="next"
    />
    <vue-touch-keyboard
      v-else-if="layout === 'numeric'"
      :class="{'numericKeyboard': true,
               'keyboardWithList':(list && list.length != 0),
               'keyboardWithoutList': (list && list.length == 0)}"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="inputTarget"
      :next="next"
    />
    <vue-touch-keyboard
      v-else-if="layout === 'compact'"
      :class="{'numericKeyboard': true,
               'keyboardWithList':(list && list.length != 0),
               'keyboardWithoutList': (list && list.length == 0)}"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="inputTarget"
      :next="next"
    />
    <div v-if="list && list.length != 0">
      <boatnet-keyboard-list
        class="list"
        v-on:selected="select"
        :list="list"
        :value="inputValue"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

@Component
export default class BoatnetKeyboard extends Vue {
  @Prop({ default: 'normal' }) public layout!: string;
  @Prop({ default: true }) public visible!: boolean;
  @Prop() public inputTarget!: any;
  @Prop({ default: () => [] }) public list!: string[];
  @Prop() public inputValue!: string;

  private keyboardOptions = {
    useKbEvents: false,
    preventClickEvent: true
  };

  private select(value: string) {
    this.$emit('selected', value);
  }

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

<style scoped lang="scss">
.popover {
  position: absolute;
  bottom: 0;

  z-index: 10000;
  height: 200px;
}
.keyboard {
  @extend .popover;
  width: 100%;
  margin: 0 auto;
  padding: 1em;
}
.normalKeyboard {
  @extend .keyboard;
  max-width: 1000px;
}
.numericKeyboard {
  @extend .keyboard;
  max-width: 500px;
}
.keyboardWithoutList {
  right: 0;
  left: 0;
}
.keyboardWithList {
  right: 25%;
}
.list {
  @extend .popover;
  left: 75%;
  height: 200px;
  background-color: grey;
}
</style>