<template>
  <div>
    <span v-for="(item, i) in lists" :key="i">
      <boatnet-keyboard-select-list
        :keyboardType="config.keyboardType"
        :displayName="config.displayName"
        :listLabels="config.listLabels"
        :displayFields="config.displayFields"
        :docType="config.docType"
        :val.sync="lists[i]"
        @save="save"
      >
        <template v-slot:after>
          <q-icon
            :name="i != 0 || maxListSize === lists.length ? 'clear' : 'add'"
            @click="i != 0 || maxListSize === lists.length ? confirmDelete(i) : add()"
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
    config: Object,
    list: Array
  },

  setup(props, context) {
    const lists = props.list ? props.list : [''];
    const deleteMessage = ref('');
    const showDeleteDialog = ref(false);
    let deleteIndex: number = 0;

    const modelName: string = props.config ? props.config.modelName : '';
    const maxListSize: number = props.config ? props.config.maxItems : 0;

    const save = () => {
      context.emit('update:list', lists);
      context.emit('save');
    };

    const confirmDelete = (index: number) => {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      showDeleteDialog.value = true;
      deleteMessage.value = 'Are you sure you want to delete this entry?';
      deleteIndex = index;
    };

    const onDelete = () => {
      lists.splice(deleteIndex, 1);
      context.emit('save');
    };

    const add = () => {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      if (lists.length < maxListSize) {
        lists.splice(0, 0, '');
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
      lists,
      maxListSize
    };
  }
});
</script>