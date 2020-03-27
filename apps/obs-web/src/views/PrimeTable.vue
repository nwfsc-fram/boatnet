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
      @cell-edit-complete="onCellEditComplete"
      :reorderableColumns="true"
      data-key="_id"
      stateStorage="local"
      :stateKey="state.debriefer.program + '-' + type"
    >
      <template #empty>No data available</template>
      <template #header>
        <div style="text-align:left; float:left">
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
        <!--<div class="text-h6 q-pl-md" style="text-align:center; float:left">{{title}}</div>-->
        <div style="text-align: right">
          <i class="pi pi-search" style="margin: 4px 4px 0px 0px;"></i>
          <InputText v-model="filters['global']" placeholder="Global Search" size="50" />
        </div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>

      <Column
        v-for="col of displayColumns"
        :field="col.field"
        :header="col.header"
        :key="col.key"
        :sortable="true"
        headerStyle="width: 150px"
      >
        <template v-if="isEditable" #editor="slotProps">
          <Dropdown
            v-if="col.type === 'boolean'"
            v-model="cellVal"
            :options="lookupsList"
            :placeholder="cellVal"
            @before-show="getBooleanLookup"
            @change="saveDropDown($event, slotProps)"
            @input="onCellEdit($event, slotProps, col.type)"
          />
          <Dropdown
            v-else-if="col.type === 'toggle'"
            v-model="cellVal"
            :options="lookupsList"
            :placeholder="cellVal"
            :filter="true"
            @before-show="getLookupInfo(col.list, col.lookupField, col.lookupKey)"
            @change="saveDropDown($event, slotProps)"
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
          <span style="pointer-events: none">{{ formatValue(slotProps, col.type) }}</span>
        </template>
        <!-- <template #filter>
          <InputText type="text" v-model="filters[col.field]" class="p-column-filter" />
        </template>-->
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, computed } from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { get, set } from 'lodash';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import moment from 'moment';

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
    isEditable: Boolean,
    type: String
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state = store.state;

    const filters: any = {};
    const columnOptions: any = ref([...(props.columns ? props.columns : [])]);
    const currCols: any = ref([...(props.columns ? props.columns : [])]);
    const lookupsList: any = ref([]);

    const cellVal: any = ref('');

    const tableType = state.debriefer.program + '-' + props.type;
    const selected: any = ref([]);

    const stateDisplayCols = state.debriefer.displayColumns;

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

    function formatValue(slotProps: any, type: string) {
      let val: any = get(
        props.value ? props.value[slotProps.index] : {},
        slotProps.column.field
      );
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
      let editingCellRow: any = valueHolder[slotProps.index];
      if (!editingCellRow) {
        editingCellRow = { ...slotProps.data };
      }
      if (type === 'boolean') {
        newValue = newValue === 'true';
      } else if (type === 'number') {
        newValue = Number(newValue);
      }
      set(editingCellRow, slotProps.column.field, newValue);
      valueHolder[slotProps.index] = editingCellRow;
      context.emit('update:value', valueHolder);
    }

    function onCellEditComplete(event: any) {
      save(event.index, event.field);
    }

    function saveDropDown(originalEvent: any, slotProps: any) {
      save(slotProps.index, slotProps.column.field);
    }

    function save(index: number, field: string) {
      const editingCellRow = props.value ? props.value[index] : {};
      const valueHolder: any = props.value ? props.value : {};

      if (!editingCellRow) {
        return;
      }
      const editingCellValue: any = get(editingCellRow, field);
      if (editingCellValue) {
        set(valueHolder, index, editingCellRow);
        context.emit('update:value', valueHolder);
      }
      masterDB
        .put(valueHolder[index]._id, editingCellRow, valueHolder[index]._rev)
        .then((response: any) => {
          valueHolder[index]._rev = response.rev;
        });
    }

    return {
      filters,
      columnOptions,
      displayColumns,
      cellVal,
      onCellEditInit,
      onCellEdit,
      onCellEditComplete,
      getLookupInfo,
      getBooleanLookup,
      lookupsList,
      save,
      saveDropDown,
      formatValue,
      tableType,
      selected,
      state
    };
  }
});
</script>

<style scoped>
.p-inputtext {
  background-color: inherit !important;
}
</style>
