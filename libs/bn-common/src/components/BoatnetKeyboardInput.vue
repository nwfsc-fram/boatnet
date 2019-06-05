<template>
  <q-input
    outlined
    v-model="valueHolder"
    :type="encodingType"
    :mask="mask"
    :label="label"
    debounce="500"
    @input="save"
    @focus="displayKeyboard"
    :data-layout="keyboardType"
  >
  <template v-slot:append>
      <slot name="after"/>
  </template>
  </q-input>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';

@Component
export default class BoatnetKeyboardInput extends Vue {
  @Prop() private value!: any;
  @Prop() private label!: string;
  @Prop() private keyboardType!: string;
  @Prop({ default: 'text' }) private encodingType!: string;
  @Prop() private mask!: string;

  @Action('setKeyboard', { namespace: 'keyboard' })
  private setKeyboard: any;
  @Action('setKeyboardType', { namespace: 'keyboard' })
  private setKeyboardType: any;
  @Action('setKeyboardInput', { namespace: 'keyboard' })
  private setKeyboardInput: any;

  get valueHolder() {
    return this.value;
  }
  set valueHolder(val: any) {
    this.$emit('update:value', val);
  }

  private displayKeyboard(event: any) {
    this.setKeyboard(true);
    this.setKeyboardType(this.keyboardType);
    this.setKeyboardInput(event.target);
  }

  private save() {
    this.$emit('save');
  }
}
</script>
