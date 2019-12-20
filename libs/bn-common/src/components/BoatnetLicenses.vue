<template>
  <div>
    <span v-for="(item, i) in list" :key="i">
      <boatnet-keyboard-select-list
        :keyboardType="config.keyboardType"
        :displayName="config.displayName"
        :listLabels="config.listLabels"
        :displayFields="config.displayFields"
        :docType="config.docType"
        :val = list[i]
        @save="save"
      >
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
import { createComponent, ref, computed } from '@vue/composition-api';
import { get, set } from 'lodash';
import Vue from 'vue';

export default createComponent({
  props: {
    config: Object
  },

  setup(props, context) {
    const list: any[] = [''];
    const deleteMessage = ref('');
    const showDeleteDialog = ref(false);
    let deleteIndex: number = 0;

    const modelName = props.config ? props.config.modelName : '';
    const maxListSize = props.config ? props.config.maxItems : 0;

    const addEmptyItem = (iList: any[]) => {
      const emptyItem = set({}, modelName, '');
      iList.splice(0, 0, emptyItem);
    };

    const save = () => {
      context.emit('update:list', list);
      context.emit('save');
    };

    const confirmDelete = (index: number) => {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      showDeleteDialog.value = true;
      deleteMessage.value = 'Are you sure you want to delete this entry?';
      deleteIndex = index;
    };

    const onDelete = () => {
      list.splice(deleteIndex, 1);
      context.emit('save');
    };

    const add = () => {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      if (list.length < maxListSize) {
        addEmptyItem(list);
      } else {
        context.emit('error', 'Reached limit, cannot add more items.');
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