<template>
  <div>
    <pTreeTable
      :value.sync="nodes"
      :filters="filters"
      filterMode="strict"
      sortMode="multiple"
      style="height: calc(100vh - 420px)"
      selectionMode="single"
      :expandedKeys.sync="expandedKeys"
      @node-select="onNodeSelect"
      @node-unselect="onNodeUnselect"
      @node-expand="expand"
      @node-collapse="collapse"
    >
      <template #header>
        <div>
          <span style="text-align:left">
            <MultiSelect
              v-model="displayColumns"
              :options="columnOptions"
              optionLabel="header"
              placeholder="Select Columns"
              style="width: 20em"
              appendTo="body"
            >
              <template #value>
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
          </span>
          <span style="position:relative; bottom: 2px">
            &nbsp;
            <q-btn v-if="selectedRow" @click="addToDcs('false')" color="primary">add to dcs</q-btn>
          </span>
        </div>
      </template>
      <pColumn
        v-for="col of displayColumns"
        :key="columns[col]"
        :field="col.field"
        :header="col.header"
        :expander="col.expander"
        :sortable="true"
        :headerStyle="state.debriefer.displayCodes && col.codeWidth ? 
          'width: ' + col.codeWidth + 'px' :
          'width: ' + col.width + 'px'"
        :style="'width:' +  col.width + 'px'"
        :filterMatchMode="col.type === 'toggle-search' ? 'in' : 'startsWith'"
        headerClass="sticky top table-cell"
        bodyClass="table-cell"
      >
        <template #filter>
          <div>
            <MultiSelect
              v-if="col.type === 'toggle-search'"
              :style="'width: 100%; background-color: transparent'"
              v-model="filters[col.field]"
              :options="filterOptions[col.header]"
              appendTo="body"
              :optionLabel="state.debriefer.displayCodes ? 'label' : ''"
              :optionValue="state.debriefer.displayCodes ? 'value' : ''"
              :filter="true"
            />
            <InputText
              v-else
              type="text"
              v-model="filters[col.field]"
              class="p-column-filter"
            />
          </div>
        </template>
        <template #body="slotProps">
              <span
                v-if="col.type === 'link' && displayData(slotProps, col) > 0"
                class="tooltip fakelink"
                v-on:click="select(slotProps, col.highlightIds)">
                {{ displayData(slotProps, col) }}
                <span
                  class="tooltiptext"
                  style="pointer-events: none"
                >{{ displayData(slotProps, col) }}</span>
              </span>
              <span
                v-else-if="(slotProps.node.data.type === 'child' ||
                            slotProps.node.data.type === 'basket' ) && 
                            ['operationNum', 'catchNum', 'disposition', 'weightMethod'].includes(slotProps.column.field)"
                style="color: white"
              >{{ displayData(slotProps, col) }}</span>
              <span
                v-else
              >{{ displayData(slotProps, col) }}</span>
              <q-popup-edit
                v-if="col.isEditable"
                v-model="tempVal"
                :title="col.header"
                buttons
                @save="onCellEdit($event, slotProps, col)"
                @before-show="init(slotProps, col)"
              >
                <q-select
                  v-if="col.type === 'toggle-search'"
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
                <q-input
                    v-else-if="col.type === 'number' || col.type === 'double'"
                    type="number"
                    v-model="tempVal"
                    dense
                    autofocus
                />
                <q-input
                    v-else
                    v-model="tempVal"
                    dense
                    autofocus
                />
              </q-popup-edit>
        </template>
      </pColumn>
    </pTreeTable>

    <debriefer-dcs-row-dialog-comp
      :dcsDetailsDialog="dcsDetailsDialog"
      :rowData.sync="selectedRow"
      :isAfi.sync="afiChoice"
      @close="dcsDetailsDialog = false"
    ></debriefer-dcs-row-dialog-comp>
    </div>
</template>


<script lang="ts">
import { createComponent, ref, computed, onMounted, reactive } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { getCouchLookupInfo } from '../helpers/getLookupsInfo';
import { cloneDeep, find, get, orderBy, remove, uniq } from 'lodash';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';

import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import TreeTable from 'primevue/treetable';
import ContextMenu from 'primevue/contextmenu';

Vue.component('pColumn', Column);
Vue.component('Dropdown', Dropdown);
Vue.component('InputText', InputText);
Vue.component('pTreeTable', TreeTable);
Vue.component('ContextMenu', ContextMenu);

export default createComponent ({
  props: {
    nodes: Array,
    columns: Array,
    isEditable: Boolean,
    program: String,
    type: String,
    selectionMode: String,
    initExpandedKeys: Object,
    isFullSize: Boolean,
    lookupsMap: Array
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const tableType = props.program + '-' + props.type;
    const expandedKeys: any = props.initExpandedKeys ? ref(props.initExpandedKeys) : ref({});

    const columnOptions: any = ref([...(props.columns ? props.columns : [])]);
    const currCols: any = ref([...(props.columns ? props.columns : [])]);

    const editingCol: any = ref('');
    const editingRow: any = ref('');
    const filters: any = ref({});

    const lookupFieldName: any = ref('');
    const lookupsList: any = ref([]);
    const sortedList: any = ref([]);
    const jp = require('jsonpath');

    const tempVal: any = ref('');

    const masterDB: Client<any> = couchService.masterDB;

    const stateProgram: any = ref(state.debriefer.program);
    const displayCodes: any = ref(state.debriefer.displayCodes);

    function clearFilters() {
      filters.value = {};
      const currFilters = state.debriefer.filters;
      currFilters[tableType] = filters.value;
      store.dispatch('debriefer/updateFilters', currFilters);
    }

    function deSelect() {
      editingRow.value = '';
      editingCol.value = '';
    }

    function converToCode(view: any, val: any, context: any) {
      let code: any;
      let lookupView: string = view === 'taxonomy-alias' && context.catchContent ? context.catchContent.type : view;
      if (lookupView === 'taxonomy-alias' && context.catchContent) {
        code = find(props.lookupsMap, { key: lookupView + ':' + val});
        return code.value + ' - ' + val;
      } else {
        code = find(props.lookupsMap, { key: lookupView + ':' + val});
        return code ? code.value : undefined;
      }      
    }

    function displayData(data: any, col: any) {
      const colType = col.type;
      const colField = col.field;
      let value: any = data.node.data[colField];
      if (state.debriefer.displayCodes && col.lookupView && value) {
        value = converToCode(col.lookupView, value, data.node.data);
      }
      if (value && colType === 'double' && value % 1 !== 0) {
        value = parseFloat(value).toFixed(2);
      }
      return value;
    }

    const filterOptions = computed(() => {
      const filterList: any = {};
      for (const col of columnOptions.value) {
        if (col.type === 'toggle-search') {
          filterList[col.header] = jp.query(props.nodes, '$..' + col.field);
          filterList[col.header] = uniq(filterList[col.header]);
          remove(filterList[col.header], (item: string) => {
            if (item && item.includes('Basket')) {
              return true;
            } else {
              return false;
            }
          });
          if (state.debriefer.displayCodes && col.lookupView) {
            const data = jp.query(props.nodes, '$..data');
            for (let i = 0; i < filterList[col.header].length; i++) {
              filterList[col.header][i] = {
                label: converToCode(col.lookupView, filterList[col.header][i], data[i]),
                value: filterList[col.header][i]
              };
            }
            remove(filterList[col.header], (item: any) => {
              return !item || !item.label ? true : false;
          });
          }
          filterList[col.header] = filterList[col.header].sort();
          remove(filterList[col.header], (item: any) => {
            return !item;
          });
        }
      }
      return filterList;
    });

    const displayColumns = computed({
      get: () => {
        if (!displayCodes[tableType]) {
          currCols.value = [...(props.columns ? props.columns : [])];
        } else {
          currCols.value = displayCodes[tableType];
        }
        currCols.value = orderBy(currCols.value, ['order']);
        return currCols.value;
      },
      set: (val) => {
        currCols.value = val;
        displayCodes[tableType] = val;
        store.dispatch('debriefer/updateDisplayColumns', displayCodes);
      },
    });

    async function init(data: any, col: any) {
      tempVal.value = data.node.data[col.field];
      if (state.debriefer.displayCodes && col.lookupView && tempVal.value) {
        tempVal.value = converToCode(col.lookupView, tempVal.value, data.node.data);
      }
      const nodeKey = data.node.key;
      if (editingRow.value !== data.node.key) {
        editingRow.value = nodeKey;
      }
      editingCol.value = col.name;
      lookupFieldName.value = col.lookupField;
      lookupsList.value = await getOptionsList(
        col.lookupView,
        [lookupFieldName.value],
        data
      );
      sortedList.value = cloneDeep(lookupsList.value);
      store.dispatch('debriefer/updateCatches', props.nodes);
    }

    function filterFn(val: any, update: any, abort: any) {
      update(() => {
        const needle = val.toLowerCase();
        lookupsList.value = sortedList.value.filter((v: any) => v.label.toLowerCase().indexOf(needle) > -1);
      });
    }

    async function getOptionsList(key: string, field: string[], data: any) {
      const lookupList: any[] = [];
      let lookupField = lookupFieldName.value;
      if (data.column.field === 'name') {
        const catchContent = data.node.data.catchContent;
        key = catchContent.type;
        if (key === 'catch-grouping') {
          lookupField = 'name';
        } else if (key === 'taxonomy-alias') {
          lookupField = 'commonNames[0]';
        }
      }
      const programState = state.debriefer.program;
      const results = await getCouchLookupInfo(programState, 'obs_web', key, [lookupField]);
      for (let i = 0; i < results.length; i++) {
        let label = get(results[i].doc, lookupField);
        if (state.debriefer.displayCodes && label) {
            label = converToCode(key, label, data.node.data);
            label = label ? label : '';
          }
        lookupList[i] = { label, value: results[i].doc };
      }
      return lookupList;
    }

    function onCellEdit(event: any, slotProps: any, col: any) {
      const currField = slotProps.column.field;
      if (col.type === 'toggle' || col.type === 'toggle-search') {
        slotProps.node.data[currField] = event.label;
      } else {
        slotProps.node.data[currField] = event;
      }
      // when top level element is edited, edit children as well
      if (['weightMethod', 'disposition'].includes(currField) && slotProps.node.children.length > 0) {
        for (let i = 0; i < slotProps.node.children.length; i++) {
          slotProps.node.children[i].data[currField] = event.label;
        }
      }
      context.emit('save', { data: slotProps, event});
    }

    function select(data: any, field: any) {
      const ids = data.node.data[field];
      context.emit('selected', ids);
    }

    const selectedRow: any = ref(null);

    const dcsDetailsDialog = ref(false);
    const afiChoice: any = ref('blank');

    const addToDcs = (isAfi: string) => {
        afiChoice.value = isAfi;
        dcsDetailsDialog.value = true;
    };

    const onNodeSelect = async (node: any) => {
      const operationDoc = await masterDB.get(node.key.split('_')[0]);
      const nodeCopy = cloneDeep(node.data);
      nodeCopy.tripId = operationDoc.legacy.tripId;
      selectedRow.value = nodeCopy;
    };
    const onNodeUnselect = (node: any) => selectedRow.value = null;

    function expand() {
      context.emit('expand', expandedKeys);
    }

    function collapse() {
      context.emit('collapse', expandedKeys);
    }

    function openNewDebriefingTab() {
      const type = props.type ? props.type.toLowerCase() : '';
      const route = '/observer-web/table/' + type;
      window.open(route, '_blank');
    }

    async function updateDisplayCodes(status: any) {
      store.dispatch('debriefer/updateDisplayCodes', status);
    }

    async function updateProgram(status: string) {
      store.dispatch('debriefer/updateProgram', status);
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
      displayColumns,
      columnOptions,
      editingCol,
      editingRow,
      expandedKeys,
      filters,
      filterOptions,
      lookupFieldName,
      lookupsList,
      sortedList,
      state,

      clearFilters,
      collapse,
      deSelect,
      displayData,
      init,
      expand,
      filterFn,
      getOptionsList,
      onCellEdit,
      openNewDebriefingTab,
      select,
      selectedRow, dcsDetailsDialog,  afiChoice,
      onNodeSelect, onNodeUnselect, addToDcs,
      tempVal,
      stateProgram, displayCodes, isAuthorized,
      updateDisplayCodes, updateProgram
    };
  }
});
</script>

<style>
tr {
  height: 40px !important;
}
input.p-column-filter.p-inputtext.p-component {
  background-color: inherit !important;
}

.sticky {
  overflow: hidden;
  position: sticky !important;
  top: 0px;
  z-index: 1;
}

.table-cell {
  overflow: hidden;
   padding: 2px!important;
   margin: 0!important;
}

.p-treetable-header {
  width: 100%;
}

.fakelink {
  color: blue;
  cursor: pointer;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}

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