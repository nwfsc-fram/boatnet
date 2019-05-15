<template>
  <div>
    <q-table
      :data="data"
      :columns="settings.columns"
      :row-key="settings.rows"
      selection="single"
      :selected.sync="selected"
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click.native="selectTrip(props)" class="cursor-pointer">
          <q-td/>
          <q-td v-for="(value, i) in props.cols" :key="value.name">{{ value }}</q-td>
        </q-tr>
      </template>
    </q-table>

    <!--  <div class="row q-gutter-sm q-pa-md justify-center">
      <q-btn color="primary" label="Add" @click="addRow" :disabled="!curr"/>
      <q-btn color="primary" label="Edit" @click="editRow" :disabled="!curr"/>
      <q-btn color="primary" label="Delete" @click="deleteRow" :disabled="!curr"/>
    </div>-->
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class BoatnetTable extends Vue {
  @Prop() private data!: any[];
  @Prop() private settings!: any;
  @Prop() private selected!: any[];
  private curr = this.selected.length > 0 ? this.selected[0] : null;

  private selectTrip(row: any) {
    if (this.selected.length > 0 && this.selected[0].__index === row.__index) {
      this.$emit('update:selected', []);
    } else {
      this.$emit('update:selected', [row]);
    }
  }
}
</script>
