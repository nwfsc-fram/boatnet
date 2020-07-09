<template>
  <div>
    <DataTable
      class="p-datatable-striped"
      :value="value"
      :filters="filters"
      :paginator="true"
      :rows="10"
      :selectionMode="enableSelection ? null : 'multiple'"
      :first="pageStart"
      :selection.sync="selected"
      :scrollHeight="isFullSize ? '700px' : '350px'"
      :scrollable="true"
      editMode="cell"
      columnResizeMode="expand"
      @cell-edit-init="onCellEditInit"
      @row-click="onRowSelect"
      :reorderableColumns="true"
      :data-key="uniqueKey"
      :resizableColumns="true"
      stateStorage="local"
      :stateKey="tableType"
      :rowsPerPageOptions="[10,25,50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
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
            appendTo="body"
          >
            <template #value="slotProps">
              <div>Display Columns</div>
            </template>
          </MultiSelect>
        </div>
      </template>

      <Column v-if="enableSelection" selectionMode="multiple" headerStyle="width: 3em"></Column>

      <Column
        v-for="col of displayColumns"
        :field="col.field"
        :header="col.header"
        :key="col.key"
        :sortable="true"
        :headerStyle="'width: ' + col.width + 'px'"
      >
        <template v-if="col.isEditable" #editor="slotProps">
          <Dropdown
            v-if="col.type === 'toggle'"
            v-model="cellVal"
            :options="lookupsList"
            :placeholder="cellVal"
            :filter="col.search ? true : false"
            :optionLabel="col.listType === 'fetch' ? 'doc.' + col.lookupField : 'value'"
            :optionValue="col.listType === 'fetch' ? 'doc' : 'value'"
            @before-show="getLookupInfo(col.list, col.listType, col.lookupField, col.lookupKey)"
            @input="onCellEdit($event, slotProps, col.listType)"
            appendTo="body"
          />
          <Calendar
            v-else-if="col.type === 'date'"
            v-model="cellVal"
            @input="onCellEdit($event, slotProps, col.type)"
            appendTo="body"
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
          <span style="pointer-events: none">
            {{ formatValue(slotProps, col.type, col.displayField) }}
          </span>
          <Button
            class="p-button-secondary"
            v-if="col.type === 'popup' && containsMultiples(slotProps, col.popupField)"
            label="..."
            @click="show(slotProps, col.popupColumns, col.uniqueKey, col.popupField)"
          />
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
import {
  createComponent,
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  onBeforeMount
} from '@vue/composition-api';
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
import { getCouchLookupInfo } from '@boatnet/bn-common/src/helpers/getLookupsInfo';

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
    uniqueKey: String,
    enableSelection: Boolean,
    isFullSize: Boolean
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state = store.state;

    let filters: any = ref({});
    const columnOptions: any = ref([...(props.columns ? props.columns : [])]);
    const currCols: any = ref([...(props.columns ? props.columns : [])]);
    const lookupsList: any = ref([]);

    const cellVal: any = ref('');

    const tableType = state.debriefer.program + '-' + props.type;
    const selected: any = ref([]);
    const pageStart: any = ref(1);
    const stateDisplayCols = state.debriefer.displayColumns;

    const popupData: any = ref({});
    const popupField: any = ref('');
    const showPopup: any = ref(false);
    const popupColumns: any = ref([]);
    const popupUniqueKey: any = ref('');

    onMounted(() => {
      updateSelection();
    });

    function updateSelection() {
      if (props.type === 'Trips') {
        selected.value = state.debriefer.trips;
      } else if (props.type === 'Specimens') {
        selected.value = state.debriefer.specimens.selected;
        pageStart.value = state.debriefer.specimens.page;
      }
    }

    function onRowSelect(event: any) {
      if (props.type === 'Trips') {
        store.dispatch('debriefer/updateTrips', selected.value);
      } /*else if (props.type === 'Operations') {
        store.dispatch('debriefer/updateOperations', selected.value);
      }*/
    }

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

    async function getLookupInfo(
      list: any[],
      listType: string,
      displayField: string,
      key: string
    ) {
      if (listType === 'boolean') {
        lookupsList.value = [{ value: true }, { value: false }];
      } else if (!list) {
        const mode = state.debriefer.program;
        lookupsList.value = await getCouchLookupInfo(mode, 'obs_web', key, [
          displayField
        ]);
      } else {
        const lookupVals = [];
        for (const listItem of list) {
          lookupVals.push({ value: listItem });
        }
        lookupsList.value = lookupVals;
      }
    }

    function getIndex(data: any) {
      const keyId = props.uniqueKey ? props.uniqueKey : '';
      const findItem: any = {};
      findItem[keyId] = get(data, keyId);
      const index = findIndex(props.value, findItem);
      return index;
    }

    function formatValue(slotProps: any, type: string, displayField: string[]) {
      const value = props.value ? props.value : [];
      const index = getIndex(slotProps.data);

      let val: any;

      if (displayField) {
        let fieldIndex = 0;
        for (const field of displayField) {
          if (fieldIndex === 0) {
            val = get(value[index], field);
          } else {
            val = val + ' ' + get(value[index], field);
          }
          fieldIndex++;
        }
      } else {
        val = get(value[index], slotProps.column.field);
      }

      if (type === 'date') {
        val = moment(val).format('MM/DD/YYYY HH:mm');
      } else if (val && type === 'double' && val % 1 !== 0) {
        val = val.toFixed(2);
      }
      return val;
    }

    function onCellEditInit(event: any) {
      const value = get(event.data, event.field);
      cellVal.value = value ? value.toString() : '';
      if (cellVal.value.indexOf(':') !== -1) {
        cellVal.value = new Date(cellVal.value);
      }
    }

    function onCellEdit(newValue: any, slotProps: any, type: string) {
      const valueHolder: any = props.value ? props.value : {};
      const index = getIndex(slotProps.data);
      let fields: string = slotProps.column.field;
      let editingCellRow: any = valueHolder[index];
      if (!editingCellRow) {
        editingCellRow = { ...slotProps.data };
      }
      if (type === 'boolean') {
        newValue = newValue;
        cellVal.value = newValue.toString();
      } else if (type === 'number') {
        newValue = Number(newValue);
      } else if (type === 'date') {
        newValue = moment(newValue).format();
      } else if (type === 'fetch') {
        const fieldArr: string[] = fields.split('.');
        fieldArr.splice(fieldArr.length - 1, 1);
        fields = fieldArr.join('.');

        const updateCellValFieldsArr: string[] = slotProps.column.field.split('.');
        updateCellValFieldsArr.splice(0, 1);
        const updateCellValFields = updateCellValFieldsArr.join('.');
        cellVal.value = get(newValue, updateCellValFields);
      }
      set(editingCellRow, fields, newValue);
      valueHolder[index] = editingCellRow;

      context.emit('save', editingCellRow);
      context.emit('update:value', valueHolder);
    }

    function containsMultiples(slotProps: any, popupValue: string) {
      const val = get(slotProps.data, popupValue);
      const length = val ? val.length : 0;
      return length > 1 ? true : false;
    }

    function show(
      slotProps: any,
      columns: any,
      uniqueKey: string,
      popupValue: string
    ) {
      popupField.value = popupValue;
      popupData.value = slotProps.data;
      showPopup.value = true;
      popupColumns.value = columns;
      popupUniqueKey.value = uniqueKey;
    }

    return {
      containsMultiples,
      filters,
      columnOptions,
      displayColumns,
      cellVal,
      onCellEditInit,
      onCellEdit,
      getLookupInfo,
      lookupsList,
      formatValue,
      tableType,
      selected,
      pageStart,
      state,
      show,
      popupData,
      popupField,
      showPopup,
      popupColumns,
      popupUniqueKey,
      onRowSelect
    };
  }
});
</script>

<style scoped>
.p-inputtext {
  background-color: inherit !important;
}
</style>
