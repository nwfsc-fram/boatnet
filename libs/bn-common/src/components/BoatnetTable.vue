<template>
  <span>
    <q-scroll-area style="height: 500px">

      <q-table
        class="my-sticky-header-table"
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
          <q-tr :props="props" @click.native="select(props.row)" class="cursor-pointer" style="font-weight: bold">
            <slot v-bind:row="props.row"/>
          </q-tr>
        </template>
      </q-table>
      
    </q-scroll-area>
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
  private pagination = {rowsPerPage: 0};

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

<style lang="stylus">
.my-sticky-header-table
  /* max height is important */
  .q-table__middle
    max-height 500px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color #DDDDDD
    font-weight: bolder;

  thead tr:first-child th
    position sticky
    top 0
    opacity 1
    z-index 1

  tr:nth-child(even) 
    background-color: #EEEEEE;

.selected
  background-color: #87CEEB !important;

</style>