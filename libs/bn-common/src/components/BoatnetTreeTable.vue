<template>
  <span>
    <pTreeTable
      :value="nodes"
      :filters="filters"
      filterMode="lenient"
      :expandedKeys="expandedKeys"
      :selectionMode="selectionMode ? selectionMode : 'checkbox'"
      :selectionKeys.sync="selectedKey1"
      @node-select="select"
      @node-unselect="unSelect"
      sortMode="single"
      style="height: 450px"
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
      >
        <template #filter>
          <InputText type="text" v-model="filters[col.field]" class="p-column-filter" />
        </template>
        <template #body="slotProps">
          <Button
            v-if="col.header === 'Edit'"
            icon="pi pi-pencil"
            class="p-button-secondary"
            @click="edit(slotProps)"
          />
          <div
            v-else-if="slotProps.node.key === editingRow &&
                           col.isEditable &&
                           slotProps.node.data[slotProps.column.field]"
          >
            <Dropdown
              v-if="col.type === 'toggle'"
              :style="'width: ' + col.width + 'px'"
              v-model="slotProps.node.data[slotProps.column.field]"
              :placeholder="slotProps.node.data[slotProps.column.field]"
              :options="lookupsList"
              :optionLabel="'doc.' + col.lookupField"
              optionValue="doc"
              @input="onCellEdit($event, slotProps, col)"
              @before-show="getOptionsList(col.lookupView, [col.lookupField], slotProps)"
            />
            <Dropdown
              v-else-if="col.type === 'toggle-search'"
              :style="'width: ' + col.width + 'px'"
              v-model="slotProps.node.data[slotProps.column.field]"
              :placeholder="slotProps.node.data[slotProps.column.field]"
              :options="lookupsList"
              :filter="true"
              :optionLabel="'doc.' + col.lookupField"
              optionValue="doc"
              @input="onCellEdit($event, slotProps, col)"
              @before-show="getOptionsList(col.lookupView, [col.lookupField], slotProps)"
            />
            <q-input
              v-else
              debounce="500"
              v-model="slotProps.node.data[slotProps.column.field]"
              @input="onCellEdit($event, slotProps, col)"
            />
          </div>
          <span v-else>{{ displayData(slotProps, col.type) }}</span>
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
import { get } from 'lodash';

import TreeTable from 'primevue/treetable';

Vue.component('pTreeTable', TreeTable);

import pColumn from 'primevue/column';
Vue.component('pColumn', pColumn);

@Component
export default class BoatnetTreeTable extends Vue {
  @Prop() public nodes!: any[];
  @Prop() public settings!: any;
  @Prop() public expandedKeys!: any;
  @Prop() public selectionKeys!: any;
  @Prop() public isEditable!: any;
  @Prop() public program!: string;
  @Prop() public selectionMode!: string;

  public selected: any[] = [];
  private filters: any = {};

  private selectedKey1: any = null;
  private editingRow = '';

  private lookupsList: any[] = [];

  private columns: any[] = this.settings.columns;
  private columnOptions: any[] = [...this.columns];

  private created() {
    const cols: any[] = this.columns;
    if (this.isEditable && cols.findIndex((s) => s.name === 'Edit') === -1) {
      this.columns.push({
        name: 'Edit',
        align: 'left',
        label: 'Edit',
        width: '40'
      });
    }
  }

  private displayData(data: any, colType: string) {
    let value: any = data.node.data[data.column.field];
    if (value && colType === 'double' && value % 1 !== 0) {
      value = value.toFixed(2);
    }
    return value;
  }

  private onCellEdit(event: any, slotProps: any, col: any) {
    if (col.type === 'toggle' || col.type === 'toggle-search') {
      slotProps.node.data[slotProps.column.field] = event[col.lookupField];
    } else {
      slotProps.node.data[slotProps.column.field] = event;
    }
    this.$emit('save', {
      key: slotProps.node.key,
      column: slotProps.column.field,
      value: event
    });
  }

  private edit(data: any) {
    if (this.editingRow !== data.node.key) {
      this.editingRow = data.node.key;
    }
  }

  private async getOptionsList(view: string, field: string[], data: any) {
    if (data.column.field === 'name') {
      const catchContent = data.node.data.catchContent;
      view = catchContent.type;
      if (view === 'catch-grouping') {
        field = ['name'];
      } else if (view === 'taxonomy-alias') {
        field = ['commonNames[0]'];
      }
    }
    this.lookupsList = await getCouchLookupInfo(
      this.program,
      'obs_web',
      view,
      field
    );
    if (data.column.field === 'name') {
      let i = 0;
      for (const item of this.lookupsList) {
        this.lookupsList[i].doc.displayName = get(item, 'doc.' + field);
        i++;
      }
    }
  }

  private select(node: any) {
    // if (this.selected.length > 0 && this.selected[0].__index === row.__index) {
    //   this.selected = [];
    //   this.$emit('select', undefined);
    // } else {
    //   this.selected = [row.catch];
    //   // delete row.__index; // This was here because __index is not in our models
    //   this.$emit('select', row.catch);
    // }
    console.log(node.catch);
    this.selected = [node.catch];
    this.$emit('select', node.catch);
  }

  private unSelect(node: any) {
    this.selected = [];
    this.$emit('select', undefined);
  }
}
</script>

<style >
tr {
  height: 40px !important;
}
.p-inputtext {
  background-color: inherit !important;
}
</style>