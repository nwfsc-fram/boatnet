<template>
  <div>
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
        <slot name="after" />
      </template>
    </q-input>

    <boatnet-keyboard v-on:selected="select"
      :visible.sync="isActive"
      :layout="keyboardType"
      :inputTarget="target"
      :list="list"
      :inputValue="valueHolder"
      @next="keyboard.next"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { KeyboardState } from '@boatnet/bn-common';

@Component
export default class BoatnetKeyboardSelectList extends Vue {
  @Prop() private value!: any;
  @Prop() private label!: string;
  @Prop() private keyboardType!: string;
  @Prop({ default: 'text' }) private encodingType!: string;
  @Prop() private mask!: string;
  @Prop({ default: true }) private showMask!: boolean;
  @Prop() private hint!: string;
  @Prop({ default: () => [] }) private list!: string[];

  private target: any = {};
  @Action('setActiveFieldName', { namespace: 'keyboard' })
  private setActiveFieldName: any;
  @State('keyboard') private keyboard!: KeyboardState;

  get valueHolder() {
    return this.value;
  }
  set valueHolder(val: any) {
    this.$emit('update:value', val);
  }

  get isActive() {
    if (this.label === this.keyboard.activeFieldName) {
      return true;
    } else {
      return false;
    }
  }

  private select(value: string) {
    this.$emit('update:value', value);
  }

  private displayKeyboard(event: any) {
    this.target = event.target;
    this.setActiveFieldName(this.label);
  }

  private save() {
    this.$emit('save');
  }
}
</script>
