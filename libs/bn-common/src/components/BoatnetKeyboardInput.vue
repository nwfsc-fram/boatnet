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
    :fill-mask="showMask"
    :hint="hint"
    :data-layout="keyboardType"
    dense
  >
  <template v-slot:append>
      <slot name="after"/>
  </template>
  </q-input>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

@Component
export default class BoatnetKeyboardInput extends Vue {
  @Prop() private value!: any;
  @Prop() private label!: string;
  @Prop() private keyboardType!: string;
  @Prop({ default: 'text' }) private encodingType!: string;
  @Prop() private mask!: string;
  @Prop({ default: true }) private showMask!: boolean;
  @Prop() private hint!: string;
  @Prop() private list!: string[];

  @Action('setKeyboard', { namespace: 'keyboard' })
  private setKeyboard: any;
  @Action('setKeyboardType', { namespace: 'keyboard' })
  private setKeyboardType: any;
  @Action('setKeyboardInputTarget', { namespace: 'keyboard' })
  private setKeyboardInputTarget: any;
  @Action('setInput', { namespace: 'keyboard' })
  private setInput: any;
  @Action('setList', { namespace: 'keyboard' })
  private setList: any;
  @Getter('input', { namespace: 'keyboard' })
  private input!: string;

  get valueHolder() {
    this.value = this.input;
    return this.value;
  }
  set valueHolder(val: any) {
    this.setInput(val);
    this.$emit('update:value', val);
  }

  private displayKeyboard(event: any) {
    this.setKeyboard(true);
    this.setKeyboardType(this.keyboardType);
    this.setKeyboardInputTarget(event.target);
    this.setList(this.list);
  }

  private save() {
    this.$emit('save');
  }
}
</script>
