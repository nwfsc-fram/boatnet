<template>
  <div class="q-pa-sm">
    <div class="text-bold">{{ config.displayName }}</div>
    <q-input
      outlined
      v-model="valueHolder"
      :type="config.encodingType"
      :mask="config.mask"
      :label="config.displayName"
      debounce="500"
      @input="save"
      @focus="displayKeyboard"
      :fill-mask="config.showMask"
      :hint="config.hint"
      :data-layout="config.keyboardType"
      dense
    >
      <template v-slot:append>
        <slot name="after" />
      </template>
    </q-input>

    <boatnet-keyboard
      v-on:selected="select"
      :visible.sync="isActive"
      :layout="config.keyboardType"
      :inputTarget="keyboard.keyboardInputTarget"
      :list="config.list"
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
    config: Object,
    model: Object
  },

  setup(props, context) {
    const store = context.root.$store;
    const keyboard = reactive(store.state.keyboard);

    const valueHolder = computed({
      get: () => {
        console.log('get value');
        const modelName = props.config ? props.config.modelName : '';
        const val = props.model ? props.model[modelName] : '';
        return val ? val : '';
      },
      set: (val: string) => context.emit('update:value', val)
    });

    const isActive = computed({
      get: () => {
        const keyboard = context.root.$store.state.keyboard;
        if (props.config && props.config.displayName === keyboard.activeFieldName && keyboard.showKeyboard) {
          return true;
        } else {
          return false;
        }
      },
      set: (status: boolean) =>
        store._actions['keyboard/setKeyboard'][0](status)
    });

    const displayKeyboard = (event: any) => {
      const displayName = props.config ? props.config.displayName : '';
      store._actions['keyboard/setKeyboardInputTarget'][0](event.target);
      store._actions['keyboard/setActiveFieldName'][0](displayName);
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
