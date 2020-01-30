<template>
  <div>
    <span v-for="(item, i) in lists" :key="i">
      <boatnet-keyboard-select-list
        :displayName="config.displayName + ' ' + (i + 1)"
        :keyboardType="config.keyboardType"
        :val.sync="lists[i]"
        :listLabels="config.listLabels"
        :displayFields="config.displayFields"
        :docType="config.docType"
        :valType="config.valType"
        @save="save(i)"
      >
        <template v-if="i >= (minListSize - 1)" v-slot:after>
          <q-icon
            :name="i != (minListSize - 1) ? 'clear' : 'add'"
            @click="i != (minListSize - 1) ? confirmDelete(i) : add()"
            class="cursor-pointer"
          />
        </template>
      </boatnet-keyboard-select-list>
    </span>

    <boatnet-warning-dialog
      :message="deleteMessage"
      :show.sync="showDeleteDialog"
      @confirm="onDelete"
      confirmationAction='Delete'
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
    const modelName: string = props.config ? props.config.modelName : '';
    const maxListSize: number = props.config ? props.config.maxItems : 0;
    const minListSize: number = props.config ? props.config.minItems : 1;

    const lists: string[] = initList();
    const deleteMessage = ref('');
    const showDeleteDialog = ref(false);
    let deleteIndex: number = 0;

    function initList() {
      const items: any[] = props.list ? props.list : [];
      if (items.length === 0) {
        for (let i = 0; i < minListSize; i++) {
          items.push('');
        }
      }
      return items;
    }

    function save(index: number) {
      context.emit('update:list', lists);
      context.emit('save');
    }

    function confirmDelete(index: number) {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      showDeleteDialog.value = true;
      const displayName = props.config ? props.config.displayName : '';
      deleteMessage.value = 'Are you sure you want to delete '
                          + displayName + ': '
                          + lists[index] + '?';
      deleteIndex = index;
    }

    function onDelete() {
      lists.splice(deleteIndex, 1);
      context.emit('save');
    }

    function add() {
      context.root.$store.dispatch('keyboard/setKeyboard', false);
      if (lists.length < maxListSize) {
        lists.push('');
      } else {
        context.emit('error', 'Reached limit, cannot add more items.');
      }
    }

    return {
      save,
      add,
      confirmDelete,
      onDelete,
      deleteMessage,
      showDeleteDialog,
      lists,
      maxListSize,
      minListSize
    };
  }
});
</script>