<template>
  <span>
    <q-scroll-area style="height: 470px">
      <div>
        <pTreeTable
          :value="nodes"
          :expandedKeys="expandedKeys"
          selectionMode="checkbox"
          :selectionKeys.sync="selectedKey1"
          @node-select="select"
          @node-unselect="unSelect"
          sortMode="single"
          style="height: 470px"
        >
          <pColumn
            v-for="col of settings.columns"
            :key="settings.columns[col]"
            :field="col.field"
            :header="col.label"
            :expander="col.expander"
            :headerStyle="'width: ' + col.width + 'px'"
          >
            <template #body="slotProps">
              <Button
                v-if="col.label === 'Edit'"
                icon="pi pi-pencil"
                class="p-button-secondary"
                @click="edit(slotProps)"
              />
              <div
                v-else-if="slotProps.node.key === editingRow && col.isEditable && slotProps.node.data[slotProps.column.field]"
              >
                <Dropdown
                  v-if="col.type === 'toggle'"
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
              <span v-else>{{slotProps.node.data[slotProps.column.field]}}</span>
            </template>
          </pColumn>
        </pTreeTable>
      </div>
    </q-scroll-area>
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

  public selected: any[] = [];

  private selectedKey1: any = null;
  private editingRow = '';

  private lookupsList: any[] = [];

  private created() {
    const cols: any[] = this.settings.columns;
    if (this.isEditable && cols.findIndex((s) => s.name === 'Edit') === -1) {
      this.settings.columns.push({
        name: 'Edit',
        align: 'left',
        label: 'Edit',
        width: '40'
      });
    }
  }

  private onCellEdit(event: any, slotProps: any, col: any) {
    if (slotProps.column.field === 'name') {
      slotProps.node.data.name = event.displayName;
      slotProps.node.data.catchContent = event;
    }
    if (col.type === 'toggle') {
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
  font-weight: bold;
  height: 40px !important;
}

</style>