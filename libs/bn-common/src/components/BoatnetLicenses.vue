<template>
  <div class="q-col-gutter-md column">
    <span v-for="(item, i) in list" :key="i">
      <boatnet-keyboard-select-list :config="config" :model="item" @save="save">
        <template v-slot:after>
          <q-icon
            :name="i != 0 ? 'clear' : 'add'"
            @click="i != 0 ? confirmDelete(i) : add()"
            class="cursor-pointer"
          />
        </template>
      </boatnet-keyboard-select-list>
    </span>

    <boatnet-delete-dialog
      :message="deleteMessage"
      :show.sync="showDeleteDialog"
      @confirmDelete="onDelete"
    />
  </div>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { get, set } from 'lodash';
import Vue from 'vue';

export default createComponent({
  props: {
    config: Object,
    model: Object
  },

  setup(props, context) {
    const deleteMessage = ref('');
    const showDeleteDialog = ref(false);
    let deleteIndex: number = 0;

    const listName = props.config ? props.config.listName : '';
    const modelName = props.config ? props.config.modelName : '';

    const addEmptyItem = (list: Array<Object>) => {
      const emptyItem = set({}, modelName, '');
      list.splice(0, 0, emptyItem);
    };

    const initList = () => {
      const model: any = props.model;
      let list = get(model, listName);
      if (!list) {
        list = [];
        addEmptyItem(list);
        Vue.set(model, listName, list);
      }
      return list;
    };
    const list = initList();

    const save = () => {
      context.emit('update:list', list);
      context.emit('save');
    };

    const confirmDelete = (index: number) => {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      showDeleteDialog.value = true;
      deleteMessage.value = "Are you sure you'd like to delete this entry?";
      deleteIndex = index;
    };

    const onDelete = () => {
      list.splice(deleteIndex, 1);
      context.emit('save');
    };

    const add = () => {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      if (list.length < 7) {
        addEmptyItem(list);
      } else {
        context.emit('error', 'Cannot add more than 7 licenses');
      }
    };

    return {
      save,
      add,
      confirmDelete,
      onDelete,
      deleteMessage,
      showDeleteDialog,
      list
    };
  }
});
</script>