<template>
  <div class="q-px-md q-py-sm">
    <div class="text-bold">{{ config.displayName }}</div>
    <q-input
      outlined
      v-model="valueHolder"
      :type="config.encodingType"
      :mask="config.mask"
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
        const modelName = props.config ? props.config.modelName : '';
        const names = modelName.split('.');
        let val: any = props.model;
        for (const name of names) {
          val = val ? val[name] : '';
        }
        return val ? val : '';
      },
      set: (val: string) => context.emit('update:value', val)
    });

    const isActive = computed({
      get: () => {
        const keyboardState = context.root.$store.state.keyboard;
        if (props.config && props.config.displayName === keyboardState.activeFieldName && keyboardState.showKeyboard) {
          return true;
        } else {
          return false;
        }
      },
      set: (status: boolean) =>
       store.dispatch('keyboard/setKeyboard', status)
    });

    const displayKeyboard = (event: any) => {
      const displayName = props.config ? props.config.displayName : '';
      store.dispatch('keyboard/setKeyboardInputTarget', event.target);
      store.dispatch('keyboard/setActiveFieldName', displayName);
      if (!context.root.$store.state.showKeyboard) {
        store.dispatch('keyboard/setKeyboard', true);
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
