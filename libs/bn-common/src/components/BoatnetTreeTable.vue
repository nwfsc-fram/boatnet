<template>
  <span>
    <pTreeTable
      :value.sync="nodes"
      :filters="filters"
      filterMode="strict"
      :expandedKeys="expandedKeys"
      sortMode="single"
      :paginator="true"
      :rows="10"
      style="height: 450px"
      :rowsPerPageOptions="[10,25,50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
      <template #header>
        <div style="text-align:left">
          <MultiSelect
            v-model="columns"
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
        </div>
      </template>
      <pColumn
        v-for="col of columns"
        :key="columns[col]"
        :field="col.field"
        :header="col.header"
        :expander="col.expander"
        :headerStyle="'width: ' + col.width + 'px'"
        :style="'width:' +  col.width + 'px'"
        filterMatchMode="contains"
      >
        <template #filter>
          <div :style="'min-width:' +  col.width + 'px; max-width: ' +  50 + 'px'">
            <InputText type="text" v-model="filters[col.field]" class="p-column-filter" />
          </div>
        </template>
        <template #body="slotProps">
          <div :style="'min-width:' +  col.width + 'px'">
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
                v-if="col.type === 'link'"
                class="tooltip fakelink"
                v-on:click="select(slotProps, col.highlightIds)">
                {{ displayData(slotProps, col.type, col.field) }}
                <span
                  class="tooltiptext"
                  style="pointer-events: none"
                >{{ displayData(slotProps, 'string', col.tooltipLabel) }}</span>
              </span>
              <div
                v-else
                v-on:click="edit(slotProps, col)"
              >{{ displayData(slotProps, col.type, col.field) }}</div>
            </span>
          </div>
        </template>
      </pColumn>
    </pTreeTable>
  </span>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BoatnetTripsSettings } from '@boatnet/bn-common';
import { BaseTrip } from '@boatnet/bn-models';
import { getCouchLookupInfo } from '../helpers/getLookupsInfo';
import { cloneDeep, get } from 'lodash';

import TreeTable from 'primevue/treetable';
Vue.component('pTreeTable', TreeTable);

import pColumn from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
Vue.component('Dropdown', Dropdown);
Vue.component('InputText', InputText);
Vue.component('pColumn', pColumn);

@Component
export default class BoatnetTreeTable extends Vue {
  @Prop() public nodes!: any[];
  @Prop() public settings!: any;
  @Prop() public selectionKeys!: any;
  @Prop() public isEditable!: any;
  @Prop() public program!: string;
  @Prop() public selectionMode!: string;

  private expandedKeys: any = {};

  private selected: any[] = [];
  private filters: any = {};

  private selectedKey1: any = null;
  private editingRow = '';
  private editingCol: string = '';

  private lookupsList: any[] = [];
  private sortedList: any[] = [];
  private lookupFieldName: string = '';

  private columns: any[] = this.settings.columns;
  private columnOptions: any[] = [...this.columns];

  private created() {
    const cols: any[] = this.columns;
  }

  private deSelect() {
    this.editingRow = '';
    this.editingCol = '';
  }

  private async edit(data: any, col: any) {
    const nodeKey = data.node.key;
    if (this.editingRow !== data.node.key) {
      this.editingRow = nodeKey;
    }
    this.editingCol = col.name;

    this.lookupFieldName = col.lookupField;
    this.lookupsList = await this.getOptionsList(
      col.lookupView,
      [this.lookupFieldName],
      data
    );
    this.sortedList = cloneDeep(this.lookupsList);
    /* if (this.expandedKeys[nodeKey]) {
        this.expandedKeys[nodeKey] = false;
        this.$emit('update:expandedKeys', this.expandedKeys);
      } else {
        this.expandedKeys[nodeKey] = true;
        this.$emit('update:expandedKeys', this.expandedKeys);
      }*/
  }

  private select(data: any, field: any) {
    const ids = data.node.data[field];
    this.$emit('selected', ids);
  }

  private displayData(data: any, colType: string, colField: string) {
    let value: any = data.node.data[colField];
    if (value && colType === 'double' && value % 1 !== 0) {
      value = value.toFixed(2);
    }
    return value;
  }

  private filterFn(val: any, update: any, abort: any) {
    update(() => {
      const needle = val.toLowerCase();
      this.lookupsList = this.sortedList.filter((v) => v.label.toLowerCase().indexOf(needle) > -1);
    });
  }

  private onCellEdit(event: any, slotProps: any, col: any) {
    let value: any;
    if (col.type === 'toggle' || col.type === 'toggle-search') {
      slotProps.node.data[slotProps.column.field] = event.label;
      value = event.value;
    } else {
      slotProps.node.data[slotProps.column.field] = event;
      value = event;
    }
 /*   this.$emit('save', {
      key: slotProps.node.key,
      column: slotProps.column.field,
      value
    });*/
  }

  private async getOptionsList(view: string, field: string[], data: any) {
    const lookupList: any[] = [];
    let lookupField = this.lookupFieldName;
    if (data.column.field === 'name') {
      const catchContent = data.node.data.catchContent;
      view = catchContent.type;
      if (view === 'catch-grouping') {
        lookupField = 'name';
      } else if (view === 'taxonomy-alias') {
        lookupField = 'commonNames[0]';
      }
    }
    const results = await getCouchLookupInfo(this.program, 'obs_web', view, [lookupField]);
    for (let i = 0; i < results.length; i++) {
      lookupList[i] = { label: get(results[i].doc, lookupField), value: results[i].doc };
    }
    return lookupList;
  }
}
</script>

<style>
tr {
  height: 40px !important;
}
input.p-column-filter.p-inputtext.p-component {
  background-color: inherit !important;
}
thead.p-treetable-thead {
  display: block;
  overflow: hidden;
}

tbody.p-treetable-tbody {
  display: block;
  position: relative;
  height: 250px;
  overflow: auto;
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
</style>