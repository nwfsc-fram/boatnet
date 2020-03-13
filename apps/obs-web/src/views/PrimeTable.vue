<template>
  <div>
    <DataTable
      :value="value"
      :filters="filters"
      :paginator="true"
      :rows="10"
      :selection.sync="selected"
      editMode="cell"
      columnResizeMode="expand"
      @row-select="onRowSelect"
      @row-unselect="onRowUnselect"
      @cell-edit-init="onCellEditInit"
      @cell-edit-complete="onCellEditComplete"
      data-key="key"
    >
      <template #empty>No data available</template>
      <template #header>
        <div style="text-align:left; float:left">
          <MultiSelect
            v-model="columns"
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
        v-for="col of columns"
        :field="col.field"
        :header="col.header"
        :key="col.field"
        :sortable="true"
      >
        <template v-if="isEditable" #editor="slotProps">
          <Dropdown
            v-if="col.type === 'toggle'"
            v-model="cellVal"
            :options="lookupsList"
            placeholder="Select"
            @before-show="getLookupInfo(col.list, col.lookupField, col.lookupKey)"
            @change="saveDropDown($event, slotProps)"
            @input="onCellEdit($event, slotProps)"
          />
          <InputText
            v-else
            type="text"
            v-model="cellVal"
            class="p-column-filter"
            @input="onCellEdit($event, slotProps)"
          />
        </template>
        <!--<template #filter>
          <InputText type="text" v-model="filters[col.field]" class="p-column-filter" />
        </template>-->
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  onMounted,
  watch
} from '@vue/composition-api';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { get, set } from 'lodash';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';

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
    selected: Array,
    isEditable: Boolean,
    title: String
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const state = context.root.$store.state;

    const filters: any = {};
    const columns = props.columns ? props.columns : [];
    const columnOptions = [...columns];
    const lookupsList: any = ref([]);

    let cellVal: any = ref('');
    let editingCellRows: any = {};

    async function getLookupInfo(list: any[], displayField: string, key: string) {
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

    function saveDropDown(originalEvent: any, slotProps: any) {
      save(slotProps.index, slotProps.column.field);
    }

    function onCellEditInit(event: any) {
      cellVal.value = get(event.data, event.field);
    }

    function onCellEdit(newValue: any, slotProps: any) {
      if (!editingCellRows[slotProps.index]) {
        editingCellRows[slotProps.index] = { ...slotProps.data };
      }
      set(editingCellRows[slotProps.index], slotProps.column.field, newValue);
    }

    function onCellEditComplete(event: any) {
      save(event.index, event.field);
    }

    function save(index: number, field: string) {
      const valueHolder: any = props.value ? props.value : {};

      if (!editingCellRows[index]) {
        return;
      }
      const editingCellValue: string = get(editingCellRows[index], field);
      if (editingCellValue.trim().length > 0) {
        set(valueHolder, index, editingCellRows[index]);
        context.emit('update:value', valueHolder);
      }
      masterDB
        .put(
          valueHolder[index]._id,
          editingCellRows[index],
          valueHolder[index]._rev
        )
        .then((response: any) => {
          valueHolder[index]._rev = response.rev;
        });
    }

    function onRowSelect(event: any) {
      context.emit('onRowSelect', event);
    }

    function onRowUnselect(event: any) {
      context.emit('onRowUnselect', event);
    }

    return {
      filters,
      columnOptions,
      cellVal,
      onCellEditInit,
      onCellEdit,
      onCellEditComplete,
      onRowSelect,
      onRowUnselect,
      getLookupInfo,
      lookupsList,
      save,
      saveDropDown
    };
  }
});
</script>

<style scoped>
.p-inputtext {
  background-color: inherit !important;
}
</style>
