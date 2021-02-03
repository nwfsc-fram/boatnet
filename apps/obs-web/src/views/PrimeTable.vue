<template>
  <div>
    <DataTable
      :rowClass="rowClass"
      class="p-datatable-striped p-datatable-sm"
      :value="formattedData"
      :filters="filters"
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
      :loading="loading"
      stateStorage="local"
      :stateKey="tableType"
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
          <q-select
            v-if="col.type === 'toggle' && col.listType === 'fetch'"
            v-model="cellVal"
            use-input
            fill-input
            hide-selected
            :options="lookupsList"
            @focus="populateLookupsList(col)"
            @filter="filterFn"
            :style="'width:' + col.width - 10 + 'px'"
            @input="onCellEdit($event, slotProps, col.listType)"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
              </q-item-section>
            </q-item>
          </template>
          </q-select>
          <q-select
            v-else-if="col.type === 'toggle' && col.listType === 'template'"
            v-model="cellVal"
            :options="col.list"
            @input="onCellEdit($event, slotProps, col.listType)"
          />
          <q-select
            v-else-if="col.type === 'toggle' && col.listType === 'boolean'"
            v-model="cellVal"
            :options="[true, false]"
            @input="onCellEdit($event, slotProps, col.listType)"
          />
          <Calendar
            v-else-if="col.type === 'date'"
            v-model="cellVal"
            @input="onCellEdit($event, slotProps, col.type)"
            appendTo="body"
          />
          <Textarea
            v-else-if="col.type === 'textArea'"
            v-model="cellVal"
            cols="100"
            rows="5"
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
  onUnmounted
} from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { cloneDeep, findIndex, get, intersection, set, startsWith } from 'lodash';
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
import Textarea from 'primevue/textarea';

Vue.component('PrimeTableDialog', PrimeTableDialog);
Vue.component('Button', Button);
Vue.component('Dropdown', Dropdown);
Vue.component('DataTable', DataTable);
Vue.component('Calendar', Calendar);
Vue.component('Column', Column);
Vue.component('InputText', InputText);
Vue.component('MultiSelect', MultiSelect);
Vue.component('Textarea', Textarea );

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

    const columnOptions: any = ref([...(props.columns ? props.columns : [])]);
    const currCols: any = ref([...(props.columns ? props.columns : [])]);
    const lookupsList: any = ref([]);
    let sortedList: any[] = [];

    const cellVal: any = ref('');

    const tableType = state.debriefer.program + '-' + props.type;
    const filters: any = ref({});
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
      const filter = state.debriefer.filters[tableType];
      filters.value = filter ? filter : {};
    });

    onUnmounted(() => {
      saveFilters();
    });

    // clear selection when evaluation period selected
    watch(() => state.debriefer.evaluationPeriod, () => {
      filters.value = {};
      selected.value = [];
    });

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

    /**
     * Update filters stored in state. Currently stored in debriefer'
     * as an obj and the key is the tableType
     * example: { wcgop-Trips: {}, wcgop-Operations: {} }
     */
    function saveFilters() {
      let localStorageInfo = localStorage.getItem(tableType);
      localStorageInfo = localStorageInfo ? localStorageInfo : '';
      const storageObj = JSON.parse(localStorageInfo);

      const currFilters = state.debriefer.filters;
      currFilters[tableType] = storageObj.filters;
      store.dispatch('debriefer/updateFilters', currFilters);
    }

    async function populateLookupsList(col: any) {
      lookupsList.value = [];
      await getLookupInfo(col.list, col.listType, col.lookupField, col.lookupKey);
      if (col.listType === 'fetch') {
        for (let i = 0; i < lookupsList.value.length; i++) {
          lookupsList.value[i].label = get(lookupsList.value[i].doc, col.lookupField);
          lookupsList.value[i].value = lookupsList.value[i].doc;
        }
      }
      sortedList = cloneDeep(lookupsList.value);
    }

    function filterFn(val: any, update: any, abort: any) {
      update(async () => {
          const needle = val.toLowerCase();
          lookupsList.value = sortedList.filter(
            (v: any) => startsWith(v.label.toLowerCase(), needle)
          );
      });
    }

    async function getLookupInfo(
      list: any[],
      listType: string,
      displayField: string,
      key: string
    ) {
        const mode = state.debriefer.program;
        lookupsList.value = await getCouchLookupInfo(mode, 'obs_web', key, [
          displayField,
        ]);

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
        fieldArr.pop();
        fields = fieldArr.join('-');
        newValue = newValue.value;
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
      saveFilters();

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
      formattedData,
      filterFn,
      populateLookupsList
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
