<template>
  <q-dialog v-model="showDialog">
    <q-card style="width: 800px; max-width: 80vw; height: 600px">
      <q-card-section>
        <div class="text-h6" style="text-align: center">Data</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <prime-table
          :value="tableData"
          :columns="columns"
          :isEditable="true"
          type="Edits"
          :simple="true"
          uniqueKey="fishTicketNumber"
          @save="save"
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Save" />
        <q-btn flat label="Close" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import Vue, { WatchOptions } from 'vue';
import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { get, set } from 'lodash';

export default createComponent({
  props: {
    showDialog: Boolean,
    data: Object,
    columns: Array,
    field: String
  },

  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const editingCellRows: any = ref({});

    const tableData = computed({
      get: () => {
        const fieldName = props.field ? props.field : '';
        return get(props.data, fieldName);
      },
      set: (val: any) => undefined
    });

    function closeDialog() {
      context.emit('update:showDialog', false);
    }

    function save(data: any) {
      const currRecord: any = props.data ? props.data : {};
      const id = currRecord._id;
      const rev = currRecord._rev;
      masterDB.put(id, currRecord, rev).then((response: any) => {
        currRecord._rev = response.rev;
        context.emit('update:data', currRecord);
      });
    }

    return {
      closeDialog,
      save,
      tableData
    };
  }
});
</script>

<style>
body .p-inputtext {
  background-color: white !important;
}
</style>