<template>
  <q-select
    outlined
    v-model="valueHolder"
    :label="label"
    use-input
    fill-input
    hide-selected
    input-debounce="0"
    :options="options"
    option-value="label"
    debounce="500"
    @input="save"
    @filter="filter"
    @focus="displayKeyboard"
    :data-layout="keyboardType"
    dense
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">No results</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';

@Component
export default class BoatnetKeyboardInput extends Vue {
  @Prop() private value!: any;
  @Prop() private label!: string;
  @Prop() private keyboardType!: string;
  @Prop() private options!: string[];

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

  private filter(val: string, update: any, abort: any) {
    this.$emit('filter', val, update, abort);
  }
}
</script>
