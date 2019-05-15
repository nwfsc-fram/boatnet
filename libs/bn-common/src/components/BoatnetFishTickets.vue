<template>
  <span>
    <q-table
      dense
      hide-bottom
      :data="fishTickets"
      :columns="columns"
      row-key="__index"
      selection="single"
      :selected.sync="selected"
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click.native="selectTrip(props.row)" class="cursor-pointer">
          <q-td/>
          <q-td key="fishTicketNum" :props="props">{{ props.row.fishNum }}</q-td>
          <q-td key="date" :props="props">{{ props.row.date }}</q-td>
          <q-td key="state" :props="props">{{ props.row.state }}</q-td>
        </q-tr>
      </template>
    </q-table>
    <div class="row q-gutter-sm q-pa-md justify-center">
      <q-btn color="primary" label="Add" @click="addRow"/>
      <q-btn color="primary" label="Edit" @click="editRow" :disabled="selected.length <= 0"/>
      <q-btn color="primary" label="Delete" @click="deleteRow" :disabled="selected.length <= 0"/>
    </div>

    <boatnet-input-dialog
      :title="action === 'add' ? 'Add Fish Ticket' : 'Edit Fish Ticket'"
      :show.sync="showDialog"
      @save="action === 'add' ? saveAdd() : saveEdit()"
    >
      <q-input outlined class="col-2" v-model="currFishTicket.fishNum" label="Fish Ticket #"/>
      <div class="col-2">
        <div>State:</div>
        <q-btn-toggle
          v-model="currFishTicket.state"
          toggle-color="primary"
          :options="[
                {label: 'CA', value: 'CA'},
                {label: 'OR', value: 'OR'},
                {label: 'WA', value: 'WA'}
                ]"
        />
      </div>
      <boatnet-date dateLabel="Date" :value.sync="currFishTicket.date"/>
    </boatnet-input-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { WcgopFishTicket } from '@boatnet/bn-models';
import moment from 'moment';

@Component
export default class BoatnetFishTickets extends Vue {
  @Prop() private fishTickets!: WcgopFishTicket[];

  private selected: any[] = [];
  private showDialog = false;
  private action = '';

  private currFishTicket: WcgopFishTicket = {};

  private columns = [
    {
      name: 'fishTicketNum',
      required: true,
      label: 'Fish #',
      align: 'left',
      field: (row: any) => row.fishNum,
      sortable: true
    },
    {
      name: 'date',
      align: 'left',
      label: 'Date',
      field: (row: any) => row.date,
      sortable: true
    },
    {
      name: 'state',
      align: 'left',
      label: 'State',
      field: (row: any) => row.state,
      sortable: true
    }
  ];

  private selectTrip(row: any) {
    if (this.selected.length > 0 && this.selected[0].__index === row.__index) {
      this.selected = [];
    } else {
      this.selected = [row];
    }
  }

  private addRow() {
    this.currFishTicket = {};
    this.action = 'add';
    this.showDialog = true;
  }

  private editRow() {
    this.action = 'edit';
    this.showDialog = true;
    if (this.selected.length > 0) {
      const temp = JSON.stringify(this.fishTickets[this.selected[0].__index]);
      this.currFishTicket = JSON.parse(temp);
    }
  }

  private deleteRow() {
    if (this.selected.length > 0) {
      this.fishTickets.splice(this.selected[0].__index, 1);
      this.$emit('update:fishTickets', this.fishTickets);
      this.$emit('save');
    }
  }

  private saveAdd() {
    this.fishTickets.push(this.currFishTicket);
    this.showDialog = false;
    this.$emit('update:fishTickets', this.fishTickets);
    this.$emit('save');
  }

  private saveEdit() {
    this.fishTickets.splice(this.selected[0].__index, 1, this.currFishTicket);
    this.showDialog = false;
    this.$emit('update:fishTickets', this.fishTickets);
    this.$emit('save');
    this.selected = [];
  }
}
</script>