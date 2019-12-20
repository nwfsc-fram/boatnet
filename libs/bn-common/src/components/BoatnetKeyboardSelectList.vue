<template>
  <div class="q-px-md q-py-sm">
    <q-input
      outlined
      v-model="valueHolder"
      :mask="mask"
      debounce="500"
      @input="save"
      @focus="displayKeyboard"
      :data-layout="keyboardType"
      :label="displayName"
      :fill-mask="mask ? true : false"
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
      :displayFields="displayFields"
      :docType="docType"
      :inputValue="valueHolder"
      @next="next"
    />
  </div>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { get, set } from 'lodash';
import Vue from 'vue';

export default createComponent({
  props: {
    displayName: String,
    mask: String,
    keyboardType: String,
    displayFields: Array,
    docType: String,
    val: String
  },

  setup(props, context) {
    const store = context.root.$store;
    const keyboard = reactive(store.state.keyboard);

    const valueHolder = computed({
      get: () => {
        if (typeof props.val === 'object') {
          const fields: any = props.displayFields ? props.displayFields : [];
          return get(props.val, fields[0]);

        } else {
          return props.val ? props.val : '';
        }
      },
      set: (val: string) => {
        context.emit('update:val', val);
      }
    });

    const isActive = computed({
      get: () => {
        const keyboardState = context.root.$store.state.keyboard;
        if (
          props.displayName === keyboardState.activeFieldName &&
          keyboardState.showKeyboard
        ) {
          return true;
        } else {
          return false;
        }
      },
      set: (status: boolean) => store.dispatch('keyboard/setKeyboard', status)
    });

    const displayKeyboard = (event: any) => {
      store.dispatch('keyboard/setKeyboardInputTarget', event.target);
      store.dispatch('keyboard/setActiveFieldName', props.displayName);
      if (!context.root.$store.state.showKeyboard) {
        store.dispatch('keyboard/setKeyboard', true);
      }
    };

    const select = (value: string) => {
      context.emit('update:val', value);
      context.emit('save');
    };

    const save = () => {
      context.emit('save');
    };

    const next = () => {
      const inputs = document.querySelectorAll('input');
      let found = false;
      for (let i = 0; i < inputs.length; i++) {
        if (
          !found &&
          inputs[i] === keyboard.keyboardInputTarget &&
          i < inputs.length - 1
        ) {
          found = true;
          context.root.$nextTick(() => inputs[i + 1].focus());
        }
      }
      if (!found) {
        store.state.setKeyboard(false);
      }
    };

    return {
      keyboard,
      valueHolder,
      isActive,
      displayKeyboard,
      select,
      save,
      next
    };
  }
});
</script>
