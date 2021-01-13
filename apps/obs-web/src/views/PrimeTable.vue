<template>
  <div>
    <DataTable
      :rowClass="rowClass"
      class="p-datatable-striped p-datatable-sm"
      :value="formattedData"
      :filters="filters"
      :paginator="true"
      :rows="10"
      :selectionMode="enableSelection ? null : 'multiple'"
      :first="pageStart"
      :selection.sync="selected"
      :scrollHeight="isFullSize ? '70vh' : '55vh'"
      :scrollable="true"
      editMode="cell"
      columnResizeMode="expand"
      @cell-edit-init="onCellEditInit"
      :reorderableColumns="true"
      :data-key="uniqueKey"
      :resizableColumns="true"
      stateStorage="local"
      :stateKey="tableType"
      :rowsPerPageOptions="[10,25,50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      :loading="loading"
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
          <q-icon
            v-if="!isFullSize"
            style="float: right"
            name="open_in_new"
            size="md"
            v-on:click="openNewDebriefingTab"
          />
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
        :filterMatchMode="col.type === 'toggle' ? 'in' : 'startsWith'"
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
          <span
            style="pointer-events: none"
          >{{ formatValue(slotProps, col.type, col.displayField) }}</span>
          <Button
            class="p-button-secondary"
            v-if="col.type === 'popup' && containsMultiples(slotProps, col.popupField)"
            label="..."
            @click="show(slotProps, col.popupColumns, col.uniqueKey, col.popupField)"
          />
        </template>
        <template #filter v-if="!simple">
          <MultiSelect
            v-if="col.type === 'toggle'"
            :style="'width: ' + (col.width - 30) + 'px; background-color: transparent'"
            v-model="filters[col.field]"
            @before-show="getLookupName(col.lookupKey, col.lookupField, col.listType)"
            :options="col.list ? col.list : lookupsList"
            appendTo="body"
            :filter="true"
          />
          <InputText v-else type="text" v-model="filters[col.field]" class="p-column-filter"/>
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
import { findIndex, indexOf, get, intersection, set, values } from 'lodash';
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
    isFullSize: Boolean,
    loading: Boolean,
    initialSelection: Array
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state = store.state;

    const filters: any = ref({});
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

    let haulNumTracker = 0;
    let rowBackground = 'highlightRow';

    let updateStatePermissions = false;
    const flatten = require('flat');
    const unflatten = flatten.unflatten;

    onMounted(() => {
      pageStart.value = 0;
      selected.value = props.initialSelection;
      updateStatePermissions = true;
    });

    // clear selection when evaluation period selected
    watch(() => state.debriefer.evaluationPeriod, () => { selected.value = []; });

    watch(selected, (updatedSelection, prevSelection) => {
      if (updateStatePermissions) {
        context.emit('selectValues', updatedSelection);
      }
    });

    const formattedData = computed(() => {
      const flattenedData: any[] = [];
      if (props.value) {
        for (const rowVal of props.value) {
          flattenedData.push(flatten(rowVal, { delimiter: '-' }));
        }
      }
      return flattenedData;
    });

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
      },
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
          displayField,
        ]);
      } else {
        const lookupVals = [];
        for (const listItem of list) {
          lookupVals.push({ value: listItem });
        }
        lookupsList.value = lookupVals;
      }
    }

    async function getLookupName(lookupKey: string, fieldName: string, type: string) {
      let lookupVals: any[] = [];
      lookupsList.value = [];
      if (type === 'boolean') {
        lookupVals = [true, false];
      } else {
        const result = await masterDB.viewWithDocs('obs_web', 'all_doc_types', { key: lookupKey});
        for (const row of result.rows) {
          lookupVals.push(get(row.doc, fieldName));
        }
      }
      lookupVals = intersection(lookupVals);
      lookupsList.value = lookupVals.sort();
    }

    function formatValue(slotProps: any, type: string, displayField: string[]) {
      let formattedValue: any;
      if (displayField) {
        const valArr = [];
        for (const field of displayField) {
          valArr.push(get(slotProps.data, field));
        }
        formattedValue = valArr.join(' ');
      } else {
        formattedValue = get(slotProps.data, slotProps.column.field);
      }

      if (type === 'date') {
        formattedValue = moment(formattedValue).format('MM/DD/YYYY HH:mm');
      } else if (formattedValue && type === 'double' && formattedValue % 1 !== 0) {
        formattedValue = formattedValue.toFixed(2);
      }
      return formattedValue;
    }

    function onCellEditInit(event: any) {
      const value = get(event.data, event.field);
      cellVal.value = value ? value.toString() : '';
      if (cellVal.value.indexOf(':') !== -1) {
        cellVal.value = new Date(cellVal.value);
      }
    }

    function onCellEdit(newValue: any, slotProps: any, type: string) {
      let fields: string = slotProps.column.field;
      let editingCellRow: any = slotProps.data;
      if (type === 'boolean') {
        newValue = newValue;
        cellVal.value = newValue.toString();
      } else if (type === 'number') {
        newValue = Number(newValue);
      } else if (type === 'date') {
        newValue = moment(newValue).format();
      } else if (type === 'fetch') {
        const fieldArr: string[] = fields.split('-');
        fieldArr.splice(fieldArr.length - 1, 1);
        fields = fieldArr.join('-');

        const updateCellValFieldsArr: string[] = slotProps.column.field.split(
          '-'
        );
        updateCellValFieldsArr.splice(0, 1);
        const updateCellValFields = updateCellValFieldsArr.join('-');
        cellVal.value = get(newValue, updateCellValFields);
      }
      set(editingCellRow, fields, newValue);
      editingCellRow = unflatten(editingCellRow, {delimiter: '-'});
      context.emit('save', editingCellRow);
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

    /**
     * Groups rows and sets a common background color making it easier
     * to understand what belongs to what
     */
    function rowClass(data: any) {
      const selectedIndex = findIndex(selected.value, (item: any) => {
        return item._id === data._id;
      });
      if (selectedIndex !== -1) {
        return 'plain';
      }
      if (!props.enableSelection) {
         if (haulNumTracker !== data.operationNum) {
          rowBackground = rowBackground === 'plain' ? 'highlightRow' : 'plain';
          haulNumTracker = data.operationNum;
          return rowBackground;
        } else {
          return rowBackground;
        }
      }
    }

    function openNewDebriefingTab() {
      const type = props.type ? props.type.toLowerCase() : '';
      const route = '/observer-web/table/' + type;
      window.open(route, '_blank');
      context.emit('update:showErrors', false);
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
      rowClass,
      openNewDebriefingTab,
      getLookupName,
      formattedData
    };
  },
});
</script>

<style scoped>
.p-inputtext {
  background-color: inherit !important;
}

::v-deep .highlightRow {
  background-color: #e9ecef !important;
}

.p-multiselect-trigger {
  background-color: transparent
}
</style>
