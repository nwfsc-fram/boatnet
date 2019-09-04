<template>
  <span>
    <q-scroll-area style="height: 570px">
    <div>

      <pTreeTable
      :value="nodes"
      :expandedKeys="expandedKeys"
      selectionMode="single"
      :selected.sync="selected"
      >
        <pColumn v-for="col of settings.columns" :key="settings.columns[col]"
        :field="col.field" :header="col.label" :expander="col.expander" :headerStyle="'width: ' + col.width"></pColumn>

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
  public selected: any[] = [];

  private select(row: any) {
    console.log('this happens');
    if (this.selected.length > 0 && this.selected[0].__index === row.__index) {
      this.selected = [];
      this.$emit('select', undefined);
    } else {
      this.selected = [row];
      // delete row.__index; // This was here because __index is not in our models
      this.$emit('select', row);
    }
  }
}
</script>

<style >

tr {
  font-weight: bold;
  height: 40px !important;
}

tr:nth-child(even) {
  background-color: #EEEEEE !important;
}

.selected {
  background-color: #87CEEB !important;
}

</style>