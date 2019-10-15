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

    <boatnet-keyboard
      v-on:selected="select"
      :visible.sync="isActive"
      :layout="keyboardType"
      :inputTarget="keyboard.keyboardInputTarget"
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

import { createComponent, ref, reactive, computed } from '@vue/composition-api';

export default createComponent({
  props: {
    value: String,
    label: String,
    keyboardType: String,
    encodingType: String,
    mask: String,
    showMask: Boolean,
    hint: String,
    list: Array
  },

  setup(props, context) {
    const store = context.root.$store;
    const keyboard = reactive(store.state.keyboard);

    const valueHolder = computed({
      get: () => props.value,
      set: (val: string) => context.emit('update:value', val)
    });

    const isActive = computed({
      get: () => {
        const keyboard = context.root.$store.state.keyboard;
        if (props.label === keyboard.activeFieldName && keyboard.showKeyboard) {
          return true;
        } else {
          return false;
        }
      },
      set: (status: boolean) =>
        store._actions['keyboard/setKeyboard'][0](status)
    });

    const displayKeyboard = (event: any) => {
      store._actions['keyboard/setKeyboardInputTarget'][0](event.target);
      store._actions['keyboard/setActiveFieldName'][0](props.label);
      if (!context.root.$store.state.showKeyboard) {
        store._actions['keyboard/setKeyboard'][0](true);
      }
    };

    const select = (value: string) => {
      context.emit('update:value', value);
    };

    const save = () => {
      context.emit('save');
    };

    return {
      keyboard,
      valueHolder,
      isActive,
      displayKeyboard,
      select,
      save
    };
  }
});
</script>
