<template>
  <div>
    <DataTable
      :value="value"
      :filters="filters"
      :paginator="true"
      :rows="10"
      :selection.sync="selected"
      :scrollable="true"
      editMode="cell"
      columnResizeMode="expand"
      @cell-edit-init="onCellEditInit"
      :reorderableColumns="true"
      :data-key="uniqueKey"
      stateStorage="local"
      :stateKey="state.debriefer.program + '-' + type"
    >
      <template #empty>No data available</template>
      <template v-if="!simple" #header>
        <div style="text-align:left">
          <MultiSelect
            v-model="displayColumns"
            :options="columnOptions"
            optionLabel="header"
            placeholder="Select Columns"
            style="width: 20em"
          >
            <template #value="slotProps">
              <div>Display Columns</div>
            </template>
          </MultiSelect>
        </div>
      </template>

      <Column v-if="!simple" selectionMode="multiple" headerStyle="width: 3em"></Column>

      <Column
        v-for="col of displayColumns"
        :field="col.field"
        :header="col.header"
        :key="col.key"
        :sortable="true"
        headerStyle="width: 150px"
      >
        <template v-if="col.isEditable" #editor="slotProps">
          <Dropdown
            v-if="col.type === 'boolean'"
            v-model="cellVal"
            :options="lookupsList"
            :placeholder="cellVal"
            @before-show="getBooleanLookup"
            @input="onCellEdit($event, slotProps, col.type)"
          />
          <Dropdown
            v-else-if="col.type === 'toggle'"
            v-model="cellVal"
            :options="lookupsList"
            :placeholder="cellVal"
            :filter="true"
            @before-show="getLookupInfo(col.list, col.lookupField, col.lookupKey)"
            @input="onCellEdit($event, slotProps, col.type)"
          />
          <InputText
            v-else
            type="text"
            v-model="cellVal"
            class="p-column-filter"
            @input="onCellEdit($event, slotProps, col.type)"
          ></InputText>
        </template>
        <template #body="slotProps">
          <Button
            v-if="col.type === 'popup'"
            label="Expand Data"
            @click="show(slotProps, col.popupColumns, col.uniqueKey)"
          />
          <span v-else style="pointer-events: none">{{ formatValue(slotProps, col.type) }}</span>
        </template>
        <template #filter v-if="!simple">
          <InputText type="text" v-model="filters[col.field]" class="p-column-filter" />
        </template>
      </Column>
    </DataTable>
    <prime-table-dialog
      :showDialog.sync="showPopup"
      :data="popupData"
      :field="popupField"
      :columns="popupColumns"
      :uniqueKey="popupUniqueKey"
    />
  </div>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { get, set, findIndex } from 'lodash';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import moment from 'moment';
import PrimeTableDialog from './PrimeTableDialog.vue';

Vue.component('PrimeTableDialog', PrimeTableDialog);
Vue.component('Button', Button);
Vue.component('Dropdown', Dropdown);
Vue.component('DataTable', DataTable);
Vue.component('Calendar', Calendar);
Vue.component('Column', Column);
Vue.component('InputText', InputText);
Vue.component('MultiSelect', MultiSelect);

export default createComponent({
  props: {
    columns: Array,
    value: Array,
    type: String,
    simple: Boolean,
    uniqueKey: String
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state = store.state;

    const filters: any = reactive({});
    const columnOptions: any = ref([...(props.columns ? props.columns : [])]);
    const currCols: any = ref([...(props.columns ? props.columns : [])]);
    const lookupsList: any = ref([]);

    const cellVal: any = ref('');

    const tableType = state.debriefer.program + '-' + props.type;
    const selected: any = ref([]);
    const stateDisplayCols = state.debriefer.displayColumns;

    const popupData: any = ref({});
    const popupField: any = ref('');
    const showPopup: any = ref(false);
    const popupColumns: any = ref([]);
    const popupUniqueKey: any = ref('');

    const displayColumns = computed({
      get: () => {
        if (!stateDisplayCols[tableType]) {
          currCols.value = [...(props.columns ? props.columns : [])];
        } else {
          currCols.value = stateDisplayCols[tableType];
        }
        return currCols.value;
      },
      set: (val) => {
        currCols.value = val;
        stateDisplayCols[tableType] = val;
        store.dispatch('debriefer/updateDisplayColumns', stateDisplayCols);
      }
    });

    async function getBooleanLookup() {
      lookupsList.value = ['true', 'false'];
    }

    async function getLookupInfo(
      list: any[],
      displayField: string,
      key: string
    ) {
      if (!list) {
        const lookupListHolder: any = [];
        const mode = state.debriefer.program;
        const view = mode + '-lookups';
        const results = await masterDB
          .viewWithDocs('obs_web', view, { key })
          .then((response: any) => {
            for (const row of response.rows) {
              const val = get(row.doc, displayField);
              lookupListHolder.push(val);
            }
            lookupsList.value = lookupListHolder;
          });
      } else {
        lookupsList.value = list;
      }
    }

    function getIndex(data: any) {
      const keyId = props.uniqueKey ? props.uniqueKey : '';
      const findItem: any = {};
      findItem[keyId] = get(data, keyId);
      const index = findIndex(props.value, findItem);
      return index;
    }

    function formatValue(slotProps: any, type: string) {
      const value = props.value ? props.value : [];
      const index = getIndex(slotProps.data);

      let val: any = get(value[index], slotProps.column.field);
      if (type === 'date') {
        val = moment(val).format('MM/DD/YYYY HH:mm');
      }
      return val;
    }

    function onCellEditInit(event: any) {
      cellVal.value = get(event.data, event.field).toString();
    }

    function onCellEdit(newValue: any, slotProps: any, type: string) {
      const valueHolder: any = props.value ? props.value : {};
      const index = getIndex(slotProps.data);
      let editingCellRow: any = valueHolder[index];
      if (!editingCellRow) {
        editingCellRow = { ...slotProps.data };
      }
      if (type === 'boolean') {
        newValue = newValue === 'true';
      } else if (type === 'number') {
        newValue = Number(newValue);
      }
      set(editingCellRow, slotProps.column.field, newValue);
      valueHolder[index] = editingCellRow;

      context.emit('save', editingCellRow);
      context.emit('update:value', valueHolder);
    }

    function show(slotProps: any, columns: any, uniqueKey: string) {
      popupField.value = slotProps.column.field;
      popupData.value = slotProps.data;
      showPopup.value = true;
      popupColumns.value = columns;
      popupUniqueKey.value = uniqueKey;
    }

    return {
      filters,
      columnOptions,
      displayColumns,
      cellVal,
      onCellEditInit,
      onCellEdit,
      getLookupInfo,
      getBooleanLookup,
      lookupsList,
      formatValue,
      tableType,
      selected,
      state,
      show,
      popupData,
      popupField,
      showPopup,
      popupColumns,
      popupUniqueKey
    };
  }
});
</script>

<style scoped>
.p-inputtext {
  background-color: inherit !important;
}
</style>
