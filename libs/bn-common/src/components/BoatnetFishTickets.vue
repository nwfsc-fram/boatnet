<template>
  <span>
    <boatnet-table
      :data="modifiedFishTickets"
      :settings="settings"
      :showBottom="true"
      :isCondensed="true"
      @select="selectTrip"
    >
      <template v-slot:default="rowVals">
        <q-td key="fishTicketNum">{{ rowVals.row.fishNum }}</q-td>
        <q-td key="date">{{ rowVals.row.date }}</q-td>
        <q-td key="state">{{ rowVals.row.state }}</q-td>
      </template>
    </boatnet-table>

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
      <div class="col self-start q-gutter-md q-pb-md">
        <boatnet-keyboard-input
                  :value.sync="currFishTicket.fishNum"
                  label="Fish Ticket #"
                  keyboardType="normal"
                />
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
        <q-input
          outlined
          class="col-2"
          label="Date"
          mask="date"
          :rules="['date']"
          v-model="currFishTicket.date"
        >
          <template v-slot:append>
            <q-icon name="event"></q-icon>
          </template>
        </q-input>
      </div>
      <div class="col q-pl-md">
        <q-date v-model="currFishTicket.date" minimal/>
      </div>
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
  private modifiedFishTickets: WcgopFishTicket[] = this.fishTickets
    ? this.fishTickets
    : [];

  private selected: any[] = [];
  private showDialog = false;
  private action = '';

  private currFishTicket: WcgopFishTicket = {};

  private settings = {
    rowKey: '__index',
    columns: [
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
    ]
  };

  private selectTrip(row: any) {
    this.selected = row ? [row] : [];
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
      this.modifiedFishTickets.splice(this.selected[0].__index, 1);
      this.$emit('update:fishTickets', this.modifiedFishTickets);
      this.$emit('save');
    }
  }

  private saveAdd() {
    this.modifiedFishTickets.push(this.currFishTicket);
    this.$emit('update:fishTickets', this.modifiedFishTickets);
    this.showDialog = false;
    this.$emit('save');
  }

  private saveEdit() {
    this.modifiedFishTickets.splice(
      this.selected[0].__index,
      1,
      this.currFishTicket
    );
    this.showDialog = false;
    this.$emit('update:fishTickets', this.modifiedFishTickets);
    this.$emit('save');
    this.selected = [];
  }
}
</script>