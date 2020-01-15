<template>
  <div v-if="visible">
    <vue-touch-keyboard
      v-if="layout === 'normal' && isKeyboardEnabled"
      :class="{'normalKeyboard': true,
               'keyboardWithList':(displayFields && displayFields.length != 0),
               'keyboardWithoutList': (displayFields && displayFields.length == 0)}"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="inputTarget"
      :next="next"
    />
    <vue-touch-keyboard
      v-else-if="layout === 'numeric' && isKeyboardEnabled"
      :class="{'numericKeyboard': true,
               'keyboardWithList':(displayFields && displayFields.length != 0),
               'keyboardWithoutList': (displayFields && displayFields.length == 0)}"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="inputTarget"
      :next="next"
    />
    <vue-touch-keyboard
      v-else-if="layout === 'compact' && isKeyboardEnabled"
      :class="{'numericKeyboard': true,
               'keyboardWithList':(displayFields && displayFields.length != 0),
               'keyboardWithoutList': (displayFields && displayFields.length == 0)}"
      :options="keyboardOptions"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="inputTarget"
      :next="next"
    />
    <div v-if="displayFields && displayFields.length != 0 && isKeyboardEnabled">
      <boatnet-keyboard-list
        class="list"
        v-on:selected="select"
        :displayFields="displayFields"
        :docType="docType"
        :value="inputValue"
        :valType="valType"
        />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component
export default class BoatnetKeyboard extends Vue {
  @Prop({ default: 'normal' }) public layout!: string;
  @Prop({ default: true }) public visible!: boolean;
  @Prop() public inputTarget!: any;
  @Prop({ default: () => [] }) public displayFields!: string[];
  @Prop() public docType !: string;
  @Prop() public inputValue!: string;
  @Prop() public valType!: string;

  @Getter('isKeyboardEnabled', { namespace: 'appSettings' })
  private isKeyboardEnabled!: boolean;

  private keyboardOptions = {
    useKbEvents: false,
    preventClickEvent: true
  };

  private select(value: any) {
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
  position: fixed;
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