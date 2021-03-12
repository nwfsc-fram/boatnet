<template>
  <div>
    <pTreeTable
      :value.sync="nodes"
      :filters="filters"
      filterMode="strict"
      :expandedKeys.sync="expandedKeys"
      sortMode="single"
      style="height: calc(100vh - 420px)"
      @node-expand="expand"
      @node-collapse="collapse"
      selectionMode="single"

      @node-select="onNodeSelect"
      @node-unselect="onNodeUnselect"
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
        :headerStyle="'width: ' + col.width + 'px'"
        :style="'width:' +  col.width + 'px'"
        filterMatchMode="contains"
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
            <div
              v-if="slotProps.node.key === editingRow &&
                           col.isEditable && col.name === editingCol &&
                           slotProps.node.data[slotProps.column.field]"
            >
              <q-select
                v-if="col.type === 'toggle'"
                :style="'width: ' + col.width + 'px'"
                v-model="slotProps.node.data[slotProps.column.field]"
                :options="lookupsList"
                option-label="label"
                option-value="label"
                @input="onCellEdit($event, slotProps, col)"
                @blur="deSelect"
              />
              <q-select
                v-else-if="col.type === 'toggle-search'"
                :style="'width: ' + col.width + 'px'"
                use-input
                hide-selected
                fill-input
                autofocus
                v-model="slotProps.node.data[slotProps.column.field]"
                :options="lookupsList"
                option-label="label"
                option-value="label"
                @filter="filterFn"
                @input="onCellEdit($event, slotProps, col)"
                @blur="deSelect"
              />
              <q-input
                v-else
                autofocus
                debounce="500"
                v-model="slotProps.node.data[slotProps.column.field]"
                @input="onCellEdit($event, slotProps, col)"
                @blur="deSelect"
              />
            </div>
            <span v-else>
              <span
                v-if="col.type === 'link' && displayData(slotProps, col.type, col.field) > 0"
                class="tooltip fakelink"
                v-on:click="select(slotProps, col.highlightIds)">
                {{ displayData(slotProps, col.type, col.field) }}
                <span
                  class="tooltiptext"
                  style="pointer-events: none"
                >{{ displayData(slotProps, 'string', col.tooltipLabel) }}</span>
              </span>
              <span
                v-else
                v-on:click="edit(slotProps, col)"
              >{{ displayData(slotProps, col.type, col.field) }}</span>
            </span>
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
import { cloneDeep, get, uniq } from 'lodash';

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
    initExpandedKeys: Object
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const tableType = props.program + '-' + props.type;

    const stateDisplayCols = state.debriefer.displayColumns;
    const columnOptions: any = ref([...(props.columns ? props.columns : [])]);
    const currCols: any = ref([...(props.columns ? props.columns : [])]);

    const editingCol: any = ref('');
    const editingRow: any = ref('');
    const expandedKeys: any = props.initExpandedKeys ? ref(props.initExpandedKeys) : ref({});
    const filters: any = ref({});

    const lookupFieldName: any = ref('');
    const lookupsList: any = ref([]);
    const sortedList: any = ref([]);
    const filterOptions: any = reactive({});
    var jp = require('jsonpath');

    onMounted(() => {
      for (const col of columnOptions.value) {
        if (col.type === 'toggle-search') {
          filterOptions[col.header] = jp.query(props.nodes, '$..' + col.field);
          filterOptions[col.header] = uniq(filterOptions[col.header]);
        }
      }
    });

    function deSelect() {
      editingRow.value = '';
      editingCol.value = '';
    }

    function displayData(data: any, colType: string, colField: string) {
      let value: any = data.node.data[colField];
      if (value && colType === 'double' && value % 1 !== 0) {
        value = value.toFixed(2);
      }
      return value;
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
      },
    });

    async function edit(data: any, col: any) {
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
    }

    function filterFn(val: any, update: any, abort: any) {
      update(() => {
        const needle = val.toLowerCase();
        lookupsList.value = sortedList.filter((v: any) => v.label.toLowerCase().indexOf(needle) > -1);
      });
    }

    async function getOptionsList(view: string, field: string[], data: any) {
      const lookupList: any[] = [];
      let lookupField = lookupFieldName.value;
      if (data.column.field === 'name') {
        const catchContent = data.node.data.catchContent;
        view = catchContent.type;
        if (view === 'catch-grouping') {
          lookupField = 'name';
        } else if (view === 'taxonomy-alias') {
          lookupField = 'commonNames[0]';
        }
      }
      const results = await getCouchLookupInfo(props.program ? props.program : '', 'obs_web', view, [lookupField]);
      for (let i = 0; i < results.length; i++) {
        lookupList[i] = { label: get(results[i].doc, lookupField), value: results[i].doc };
      }
      return lookupList;
    }

    function onCellEdit(event: any, slotProps: any, col: any) {
      let value: any;
      if (col.type === 'toggle' || col.type === 'toggle-search') {
        slotProps.node.data[slotProps.column.field] = event.label;
        value = event.value;
      } else {
        slotProps.node.data[slotProps.column.field] = event;
        value = event;
      }
    }

    function select(data: any, field: any) {
      const ids = data.node.data[field];
      context.emit('selected', ids);
    }

    function expand() {
      context.emit('expand', expandedKeys);
    }

    function collapse() {
      context.emit('collapse', expandedKeys);
    }

    const selectedRow: any = ref(null);

    const dcsDetailsDialog = ref(false);
    const afiChoice: any = ref('blank');

    const addToDcs = (isAfi: string) => {
        afiChoice.value = isAfi
        dcsDetailsDialog.value = true;
    };

    const onNodeSelect = (node: any) => selectedRow.value = node.data;
    const onNodeUnselect = (node: any) => selectedRow.value = null;

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

      collapse,
      deSelect,
      displayData,
      edit,
      expand,
      filterFn,
      getOptionsList,
      onCellEdit,
      select,
      selectedRow, dcsDetailsDialog,  afiChoice,
      onNodeSelect, onNodeUnselect, addToDcs
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