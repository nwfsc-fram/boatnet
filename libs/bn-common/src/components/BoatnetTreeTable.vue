<template>
  <span>
    <q-scroll-area style="height: 470px">
    <div>

      <pTreeTable
        :value="nodes"
        :expandedKeys="expandedKeys"
        selectionMode="single"
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
          :headerStyle="'width: ' + col.width"
          :sortable="true"
        >
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

  public selected: any[] = [];

  private selectedKey1: any = null;

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