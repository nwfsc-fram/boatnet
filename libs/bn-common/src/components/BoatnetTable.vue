<template>
  <span>
    <q-table
      :dense="isCondensed"
      :hide-bottom="showBottom"
      :data="data"
      :columns="settings.columns"
      :row-key="settings.rowKey"
      :selected.sync="selected"
      :pagination="pagination"
      separator="vertical"
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click.native="select(props.row)" class="cursor-pointer">
          <slot v-bind:row="props.row"/>
        </q-tr>
      </template>
    </q-table>
  </span>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BoatnetTripsSettings } from '@boatnet/bn-common';
import { BaseTrip } from '@boatnet/bn-models';

@Component
export default class BoatnetTable extends Vue {
  @Prop() public data!: any[];
  @Prop() public settings!: any;
  @Prop({ default: false }) public showBottom!: boolean;
  @Prop({ default: false }) public isCondensed!: boolean;
  public selected: any[] = [];
  private pagination = {rowsPerPage: 9};

  private select(row: any) {
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
