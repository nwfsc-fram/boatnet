<template>
  <div>
    <ContextMenu id="cMenu" style="position: fixed !important;" :model="menuModel" ref="cm" />
    <DataTable
      :rowClass="rowClass"
      class="p-datatable-striped p-datatable-sm"
      :value="formattedData"
      :filters="filters"
      :selectionMode="enableSelection ? null : 'multiple'"
      :first="pageStart"
      :selection.sync="selected"
      :scrollHeight="isFullSize ? '70vh' : '50vh'"
      :scrollable="true"
      editMode="cell"
      columnResizeMode="expand"
      :reorderableColumns="true"
      :data-key="uniqueKey"
      :resizableColumns="true"
      :loading="loading"
      stateStorage="local"
      :stateKey="tableType"
      contextMenu
      @row-contextmenu="onRowContextMenu"
      @column-resize-end="resizeColumn"
      @column-reorder="reorderColumn"
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
          <div style="float: right">
            <q-btn
              v-if="isAuthorized(['development_staff'])"
              flat
              icon="settings"
            >
            <q-tooltip>Settings</q-tooltip>
            <q-menu>
              <q-list style="width: 225px">
                <q-item clickable v-close-popup>
                  <q-toggle
                    left-label
                    v-model="displayCodes"
                    label="Display codes:"
                    @input="updateDisplayCodes"
                  />
                </q-item>
                <q-item clickable v-close-popup>
                  <span>Program:</span>
                  <q-btn-toggle
                    class="q-ml-md"
                    v-model="program"
                    toggle-color="primary"
                    dense
                    :options="[
                      {label: 'A-SHOP', value: 'ashop'},
                      {label: 'WCGOP', value: 'wcgop'},
                    ]"
                    @input="updateProgram"
                  />
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-toggle
            v-else
            left-label
            v-model="displayCodes"
            label="Display codes:"
            @input="updateDisplayCodes"
          />
            <q-btn
              flat
              icon="mdi-filter-off-outline"
              @click="clearFilters"
            >
              <q-tooltip>Clear Filters</q-tooltip>
            </q-btn>
            <q-btn
              v-if="!isFullSize"
              flat
              icon="open_in_new"
              @click="openNewDebriefingTab"
            >
              <q-tooltip>Expand</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div style="text-align:left">
         <q-btn-toggle
            v-if="type === 'Operations'"
            v-model="displayMode"
            toggle-color="primary"
            :options="[
              { label: 'Fixed Gear', value: fixedGearMode },
              { label: 'Trawl', value: trawlMode }
            ]"
            @input="toggleHaulCols"
          />
          </div>
      </template>

      <Column v-if="showSelectionBoxes" selectionMode="multiple" headerStyle="width: 3em"></Column>

      <Column
        v-for="col of displayColumns"
        :field="col.field"
        :header="col.header"
        :key="col.key"
        :sortable="true"
        :headerStyle="state.debriefer.displayCodes && col.codeWidth ? 
          'width: ' + col.codeWidth + 'px' :
          'width: ' + col.width + 'px'"
        :filterMatchMode="col.type === 'toggle' ? 'in' : 'startsWith'"
      >
        <template #body="slotProps">
          <div :style="col.field !== 'notes' ? 'white-space:pre-wrap;' : ''">{{ formatValue(slotProps, col) }}</div>
          <q-popup-edit
            v-if="col.isEditable"
            v-model="tempVal"
            :title="col.header"
            buttons
            @save="onCellEdit(tempVal, slotProps, col)"
            @before-show="init(slotProps, col)"
          >
            <q-input
              v-if="col.type === 'input'"
              v-model="tempVal"
              dense
              autofocus
            />
            <q-input
              v-if="col.type === 'number' || col.type === 'double'"
              type="number"
              v-model="tempVal"
              dense
              autofocus
            />
            <q-input
              v-else-if="col.type === 'date'"
              v-model="tempVal">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date v-model="tempVal" mask="MM/DD/YYYY HH:mm">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Set" color="primary" flat></q-btn>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
            </q-input>
            <q-select
              v-if="col.type === 'toggle' && col.listType === 'fetch'"
              v-model="tempVal"
              use-input
              fill-input
              hide-selected
              :options="lookupsList"
              @filter="filterFn"
              :style="'width:' + col.width - 10 + 'px'"
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
              v-model="tempVal"
              :options="col.list"
            />
            <q-select
              v-else-if="col.type === 'toggle' && col.listType === 'boolean'"
              v-model="tempVal"
              :options="[true, false]"
            />
            <Textarea
              v-else-if="col.type === 'textArea'"
              v-model="tempVal"
              cols="100"
              :rows="5"
            />
            <Textarea
              v-else-if="col.type === 'coordinate'"
              v-model="tempVal"
              cols="100"
              :rows="2"
            />
          </q-popup-edit>
          <Button
            class="p-button-secondary"
            v-if="col.type === 'popup' && containsMultiples(slotProps, col.popupField)"
            label="..."
            @click="show(slotProps, col.popupColumns, col.uniqueKey, col.popupField)"
          />
          <span v-if="col.type === 'actions'">
            <Button title="delete row" class="p-button-rounded" icon="pi pi-trash" @click="deleteRow(slotProps.data)"></Button>
            &nbsp;
            <Button title="duplicate row" class="p-button-rounded" icon="pi pi-copy" @click="duplicateRow(slotProps.data)"></Button>
          </span>
        </template>
        <template #filter v-if="!simple">
          <MultiSelect
            v-if="col.type === 'toggle'"
            :style="'width: 100%; background-color: transparent'"
            v-model="filters[col.field]"
            :options="col.list ? col.list : filterOptions[col.header]"
            :optionLabel="state.debriefer.displayCodes && col.listType === 'fetch' ? 'label' : null"
            :optionValue="state.debriefer.displayCodes && col.listType === 'fetch' ? 'value' : null"
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

    <debriefer-dcs-row-dialog-comp
      :dcsDetailsDialog="dcsDetailsDialog"
      :rowData.sync="selectedRow"
      :isAfi.sync="afiChoice"
      @close="dcsDetailsDialog = false"
    ></debriefer-dcs-row-dialog-comp>

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
  onActivated,
  onUnmounted
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { cloneDeep, find, findIndex, filter, get, intersection,
         remove, set, startsWith, uniq } from 'lodash';
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
import { fromDMS, toDMS } from 'dmsformat';
import { authService } from '@boatnet/bn-auth/lib';
import { DcsRow, TripLevel, CollectionMethod, DcsErrorType, AfiFlag } from '@boatnet/bn-models';

Vue.component('PrimeTableDialog', PrimeTableDialog);
Vue.component('Button', Button);
Vue.component('Dropdown', Dropdown);
Vue.component('DataTable', DataTable);
Vue.component('Calendar', Calendar);
Vue.component('Column', Column);
Vue.component('InputText', InputText);
Vue.component('MultiSelect', MultiSelect);
Vue.component('Textarea', Textarea );

import ContextMenu from 'primevue/contextmenu';
import { Notify } from 'quasar';
import DebrieferDcs from './DebrieferDcs.vue';

Vue.component('ContextMenu', ContextMenu);


export default createComponent({
  components: { DebrieferDcs },
  props: {
    columns: Array,
    value: Array,
    type: String,
    simple: Boolean,
    uniqueKey: String,
    enableSelection: Boolean,
    showSelectionBoxes: Boolean,
    isFullSize: Boolean,
    loading: Boolean,
    initialSelection: Array,
    lookupsMap: Array
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state = store.state;

    const columnOptions: any = ref([...(props.columns ? props.columns : [])]);
    const currCols: any = ref([...(props.columns ? props.columns : [])]);
    const lookupsList: any = ref([]);
    let sortedList: any[] = [];

    const testCols: any = ref([...(props.columns ? props.columns : [])]);

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

    const trawlMode: string = 'trawl';
    const fixedGearMode: string = 'fixed gear';
    const displayMode: any = state.debriefer.displayColumns.operationMode ? state.debriefer.displayColumns.operationMode : trawlMode;

    let haulNumTracker = 0;
    let rowBackground = 'highlightRow';

    let updateStatePermissions = false;
    const flatten = require('flat');
    const unflatten = flatten.unflatten;
    const jp = require('jsonpath');
    const arrayMove = require('array-move');

    const tempVal: any = ref('');

    const program: any = ref('');
    const displayCodes: any = ref(false);

    onActivated(() => {
      filters.value = state.debriefer.filters[tableType];
    });

    onMounted(async () => {
      pageStart.value = 0;
      selected.value = props.initialSelection;
      updateStatePermissions = true;
      const initFilters = state.debriefer.filters[tableType];
      filters.value = initFilters ? initFilters : {};
      if (tableType === 'wcgop-Operations' && displayMode === trawlMode) {
        displayColumns.value = setTrawlMode(displayColumns.value);
      } else if (tableType === 'wcgop-Operations' && displayMode === fixedGearMode) {
        displayColumns.value = setFixedGearMode(displayColumns.value);
      }
      program.value = state.debriefer.program;
    });

    onUnmounted(async () => {
      saveFilters();
      await saveColumnConfiguration();
    });

    // clear selection when evaluation period selected
    watch(() => state.debriefer.evaluationPeriod, () => {
      filters.value = {};
      selected.value = [];
    });

    watch(() => state.debriefer.observer, () => {
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

    const filterOptions = computed(() => {
      const filterList: any = {};
      for (const col of columnOptions.value) {
        if (col.type === 'toggle') {
          if (col.listType === 'template') {
            filterList[col.header] = col.list;
          } else if (col.listType === 'boolean') {
            filterList[col.header] = [true, false];
          } else if (col.listType === 'fetch') {
            const searchField = col.field.replace(/-/g, '.');
            filterList[col.header] = jp.query(props.value, '$..' + searchField);
            filterList[col.header] = uniq(filterList[col.header]);
            if (state.debriefer.displayCodes && col.lookupKey) {
              for (let i = 0; i < filterList[col.header].length; i++) {
                filterList[col.header][i] = {label: converToCode(col.lookupKey, filterList[col.header][i]), value: filterList[col.header][i]};
              }
            }
            filterList[col.header] = filterList[col.header].sort();
          }
        }
      }
      return filterList;
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

    function clearFilters() {
      filters.value = {};
      const currFilters = state.debriefer.filters;
      currFilters[tableType] = filters.value;
      store.dispatch('debriefer/updateFilters', currFilters);
    }

    function reorderColumn(event: any) {
      displayColumns.value = arrayMove(displayColumns.value, event.dragIndex - 1, event.dropIndex - 1);
    }

    function resizeColumn(event: any) {
      const colIndex = event.element.cellIndex - 1;
      const width = parseFloat(displayColumns.value[colIndex].width);
      displayColumns.value[colIndex].width = (width + event.delta).toString();
    }

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

    async function saveColumnConfiguration() {
      stateDisplayCols[tableType] = displayColumns.value;
      store.dispatch('debriefer/updateDisplayColumns', stateDisplayCols);
      let updatedRecord: any = {};

      // save columns to users column-config docs
      const userColConfig: any = await masterDB.viewWithDocs('obs_web', 'debriefer-config', { key: state.user.activeUserAlias.personDocId });
      updatedRecord = userColConfig.rows[0].doc;
      updatedRecord.columnConfig[tableType] = displayColumns.value;
      await masterDB.bulk([updatedRecord], true);
    }

    async function populateLookupsList(col: any) {
      lookupsList.value = [];
      await getLookupInfo(col.list, col.listType, col.lookupField, col.lookupKey);
      if (col.listType === 'fetch') {
        for (let i = 0; i < lookupsList.value.length; i++) {
          lookupsList.value[i].label = get(lookupsList.value[i].doc, col.lookupField);
          if (state.debriefer.displayCodes && col.lookupKey && lookupsList.value[i].label) {
            lookupsList.value[i].label = converToCode(col.lookupKey, lookupsList.value[i].label);
          }
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

    async function getLookupName(columnInfo: any) {
      let lookupVals: any[] = [];
      lookupsList.value = [];
      if (columnInfo.listType === 'boolean') {
        lookupVals = [true, false];
      } else {
        const result = await masterDB.viewWithDocs('obs_web', 'all_doc_types', { key: columnInfo.lookupKey});
        for (const row of result.rows) {
          lookupVals.push(get(row.doc, columnInfo.lookupField));
        }
      }
      lookupVals = intersection(lookupVals);
      return lookupVals.sort();
    }

    function converToCode(key: any, val: any) {
      const code: any = find(props.lookupsMap, { key: key + ':' + val});
      return code ? code.value : undefined;
    }

    function formatValue(slotProps: any, col: any) {
      const type = col.type;
      const displayField = col.displayField;
      let formattedValue: any;
      if (displayField) {
        const valArr = [];
        for (const field of displayField) {
          valArr.push(get(slotProps.data, field));
        }
        formattedValue = valArr.join(' ');
      } else {
        formattedValue = get(slotProps.data, slotProps.column.field);
        if (displayCodes.value && col.lookupKey && formattedValue) {
          formattedValue = converToCode(col.lookupKey, formattedValue);
        }
      }
      if (type === 'date') {
        if (formattedValue !== '-') {
          formattedValue = moment(formattedValue).format('MM/DD/YYYY HH:mm');
        }
      } else if (type === 'coordinate') {
        const lat = get(slotProps.data, displayField[0]);
        const long = get(slotProps.data, displayField[1]);
        formattedValue = toDMS([lat, long], 'DD mm X', { decimalPlaces: 2, latLonSeparator: '\n' });
      } else if (formattedValue && type === 'double' && formattedValue % 1 !== 0) {
        formattedValue = formattedValue.toFixed(2);
      }
      return formattedValue;
    }

    function onCellEditInit(event: any) {
      let columnInfo: any = filter(props.columns, ['field', event.field]);
      columnInfo = columnInfo[0];
      const type = columnInfo.type;
      const value = get(event.data, event.field);
      cellVal.value = value ? value.toString() : '';
      if (type === 'date') {
        if (cellVal.value) {
          cellVal.value = new Date(cellVal.value);
        } else {
          cellVal.value = new Date(moment().format());
        }
      } else if (type === 'coordinate') {
        const lat = get(event.data, columnInfo.displayField[0]);
        const long = get(event.data, columnInfo.displayField[1]);
        cellVal.value = toDMS([lat, long], 'DD mm X', { decimalPlaces: 2, latLonSeparator: '\n' });
      }
    }

    async function init(data: any, colInfo: any) {
      const field = data.column.field;
      tempVal.value = get(data.data, field);
      if (state.debriefer.displayCodes && colInfo.lookupKey && tempVal.value) {
        tempVal.value = converToCode(colInfo.lookupKey, tempVal.value);
      } else if (colInfo.type === 'coordinate') {
        const lat = get(data.data, colInfo.displayField[0]);
        const long = get(data.data, colInfo.displayField[1]);
        tempVal.value = toDMS([lat, long], 'DD mm X', { decimalPlaces: 2, latLonSeparator: '\n' });
      } else if (colInfo.type === 'date') {
        tempVal.value = moment(tempVal.value).format('MM/DD/YYYY HH:mm');
      }
      if (colInfo.type === 'toggle' && colInfo.listType === 'fetch') {
        await populateLookupsList(colInfo);
      }
    }

    function onCellEdit(newValue: any, slotProps: any, col: any) {
      let fields: string = slotProps.column.field;
      let editingCellRow: any = slotProps.data;
      if (col.listType === 'fetch') {
        const fieldArr: string[] = fields.split('-');
        fieldArr.pop();
        fields = fieldArr.join('-');
        newValue = newValue.doc;
        editingCellRow = unflatten(editingCellRow, {delimiter: '-'});
        set(editingCellRow, fields, newValue);
      } else {
        if (col.type === 'boolean') {
          newValue = newValue;
          cellVal.value = newValue.toString();
        } else if (col.type === 'number') {
          newValue = Number(newValue);
        } else if (col.type === 'date') {
          newValue = moment(newValue).format();
        } else if (col.type === 'coordinate') {
          newValue = fromDMS(newValue);
        }
        set(editingCellRow, fields, newValue);
        editingCellRow = unflatten(editingCellRow, {delimiter: '-'});
      }
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
    }

    function toggleHaulCols(mode: string) {
      if (mode === trawlMode) {
        displayColumns.value = setTrawlMode(currCols.value);
      } else if (mode === fixedGearMode) {
        displayColumns.value = setFixedGearMode(currCols.value);
      }
      stateDisplayCols.operationMode = mode;
      stateDisplayCols[tableType] = displayColumns.value;
      store.dispatch('debriefer/updateDisplayColumns', stateDisplayCols);
    }

    function setTrawlMode(cols: any) {
      cols = remove(cols, (n: any) => {
          if (!['totalGearSegments', 'gearSegmentsLost', 'avgSoakTime-value',
                'totalHooks', 'avgNumHooksPerSegment', 'catches-0-legacy-hooksSampled',
                'legacy-isBrdPresent'].includes(n.field)) {
            return n;
          }
      });
      cols.push({
        field: 'legacy-isBrdPresent',
        header: 'BRD',
        type: 'toggle',
        listType: 'boolean',
        key: 'wcgopOpIsBRDPresent',
        width: '100',
        isEditable: true
      });
      return cols;
    }

    function setFixedGearMode(cols: any) {
      cols = remove(cols, (n: any) => {
          if (!['totalGearSegments', 'gearSegmentsLost', 'avgSoakTime-value',
                'totalHooks', 'avgNumHooksPerSegment', 'catches-0-legacy-hooksSampled',
                'legacy-isBrdPresent'].includes(n.field)) {
            return n;
          }
      });
      cols.push({
          field: 'totalGearSegments',
          header: 'Total Gear Segments',
          type: 'number',
          key: 'wcgopOpTotGear',
          width: '100',
          isEditable: true
      });
      cols.push({
        field: 'gearSegmentsLost',
        header: 'Lost Gear',
        type: 'number',
        key: 'wcgopOpTotGearLost',
        width: '100',
        isEditable: true,
      });
      cols.push({
        field: 'avgSoakTime-value',
        header: 'Average Soak Time',
        type: 'number',
        key: 'wcgopOpAvgSoakTime',
        width: '100',
        isEditable: true,
      });
      cols.push({
        field: 'totalHooks',
        header: 'Total Hooks',
        type: 'number',
        key: 'wcgopOpTotHooks',
        width: '100',
        isEditable: true,

      });
      cols.push({
        field: 'avgNumHooksPerSegment',
        header: 'Hook Count Per Segment',
        type: 'number',
        key: 'wcgopOpAvgNumHooksPerSeg',
        width: '100',
        isEditable: true,
      });
      cols.push({
        field: 'catches-0-legacy-hooksSampled',
        header: 'Hooks Sampled',
        type: 'number',
        key: 'wcgopOpHooksSampled',
        width: '100',
        isEditable: true,
      });
      return cols;
    }

    const selectedRow: any = ref(null);
    const cm: any = ref(null);
    const menuModel = [
        {label: 'Add Row to DCS', icon: 'pi pi-fw pi-plus', command: () => addToDcs('blank')},
        {label: 'Add context to DCS', icon: 'pi pi-fw pi-plus-circle', command: () => addToDcs('false')},
        {label: 'Add context to DCS as AFI', icon: 'pi pi-exclamation-circle', command: () => addToDcs('true')}
    ];

    const dcsDetailsDialog = ref(false);
    const afiChoice: any = ref('blank');

    const addToDcs = (isAfi: string) => {
        afiChoice.value = isAfi;
        dcsDetailsDialog.value = true;
    };

    const onRowContextMenu = (event: any) => {
        selectedRow.value = event.data;
        cm.value.show(event.originalEvent);
    };

    const deleteRow = (row: any) => {
      context.emit('deleteRow', row);
    };

    const duplicateRow = (row: any) => {
      context.emit('duplicateRow', row);
    };

    async function updateDebrieferConfig(field: string, status: any) {
      const userColConfig: any = await couchService.masterDB.viewWithDocs(
        'obs_web',
        'debriefer-config',
        { key: state.user.activeUserAlias.personDocId }
      );
      const doc: any = userColConfig.rows[0].doc;
      doc[field] = status;
      await couchService.masterDB.bulk([doc], true);
    }

    async function updateDisplayCodes(status: any) {
      store.dispatch('debriefer/updateDisplayCodes', status);
      await updateDebrieferConfig('displayCodes', status);
    }

    async function updateProgram(status: string) {
      store.dispatch('debriefer/updateProgram', status);
      await updateDebrieferConfig('program', status);
    }

    function isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (state.user.userRoles.includes(role)) {
          return true;
        }
      }
      return false;
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
      populateLookupsList,
      displayMode,
      toggleHaulCols,
      fixedGearMode,
      trawlMode,
      selectedRow, cm, menuModel, onRowContextMenu, dcsDetailsDialog, deleteRow, duplicateRow, afiChoice,
      filterOptions,
      TripLevel, CollectionMethod, DcsErrorType, AfiFlag,
      reorderColumn, resizeColumn,
      init, tempVal, clearFilters,

      updateDisplayCodes, displayCodes,
      updateProgram, program,
      isAuthorized
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

#cMenu {
   display: initial !important;
}

* >>> .p-contextmenu .p-component {
  top: 0px !important;
  left: 0px !important;
}
</style>
