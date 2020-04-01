<template>
  <div class="q-px-md q-py-sm">
    <div>
      <b>{{title}}</b>
    </div>
    <q-input
      :clearable="docType ? true : false"
      outlined
      v-model="valueHolder"
      :mask="mask"
      debounce="500"
      @input="save"
      @focus="displayKeyboard"
      @clear="empty"
      :data-layout="keyboardType"
      :label="displayName"
      :fill-mask="mask ? true : false"
      :type="inputType"
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
      :valType="valType"
      @next="next"
    />
  </div>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed, onMounted } from '@vue/composition-api';
import { get, set } from 'lodash';
import Vue from 'vue';

export default createComponent({
  props: {
    displayName: String,
    mask: String,
    keyboardType: String,
    displayFields: Array,
    docType: String,
    val: [String, Number, Object],
    valType: String,
    inputType: String,
    title: String
  },

  setup(props, context) {
    const store = context.root.$store;
    const keyboard = reactive(store.state.keyboard);
    let isEditable: boolean = true;

    const valueHolder = computed({
      get: () => {
        if (typeof props.val === 'object') {
          const fields: any = props.displayFields ? props.displayFields : [];
          return get(props.val, fields[0]);
        } else {
          return props.val ? props.val : '';
        }
      },
      set: (val: any) => {
        if (isEditable || val === null) {
          if (props.valType === 'number') {
            context.emit('update:val', parseInt(val, 10));
          } else {
            context.emit('update:val', val);
          }
        }
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
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        store.dispatch('keyboard/setKeyboardInputTarget', event.target);
        store.dispatch('keyboard/setActiveFieldName', props.displayName);
        if (!context.root.$store.state.showKeyboard) {
          store.dispatch('keyboard/setKeyboard', true);
        }
      }
    };

    const empty = () => {
      isEditable = true;
    };

    const select = (value: any) => {
      context.emit('update:val', value);
      context.emit('save');
      isEditable = false; // once an item has been selected don't allow
                          // additional edits
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
      next,
      empty
    };
  }
});
</script>
