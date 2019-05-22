<template>
  <span>
    <boatnet-table
      :data="locations"
      :settings="settings"
      :showBottom="true"
      :isCondensed="true"
      @select="selectTrip"
    >
      <template v-slot:default="rowVals">
        <q-td key="date">{{ rowVals.row.date }}</q-td>
      </template>
    </boatnet-table>

    <div class="row q-gutter-sm q-pa-md">
      <q-btn color="primary" label="Add" @click="addRow"/>
      <q-btn color="primary" label="Edit" @click="editRow" :disabled="selected.length <= 0"/>
      <q-btn color="primary" label="Delete" @click="deleteRow" :disabled="selected.length <= 0"/>
    </div>

    <boatnet-input-dialog
      title="Up"
      :show.sync="showDialog"
      @save="action === 'add' ? saveAdd() : saveEdit()"
    >
      <div class="col q-gutter-md q-pb-md">
        <q-input
          outlined
          class="col-2"
          label="Date"
          mask="date"
          :rules="['date']"
          v-model="locations.date"
        >
          <template v-slot:append>
            <q-icon name="event"></q-icon>
          </template>
        </q-input>
        <q-input
          outlined
          class="col-2"
          v-model="action"
          label="Time (Local 24hr)"
          mask="time"
          fill-mask
        />
        <q-input
          outlined
          class="col-2"
          v-model="action"
          label="Latitude"
          mask="## ##.##"
          fill-mask
        />
        <q-input
          outlined
          class="col-2"
          v-model="action"
          label="Longitude"
          mask="### ##:##"
          fill-mask
        />
        <q-input outlined class="col-2" v-model="action" label="Depth (ftm)" mask="###" fill-mask/>
      </div>
      <div class="col q-pl-md self-start">
        <q-date v-model="locations.date" minimal/>
      </div>
    </boatnet-input-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { WcgopFishTicket, LocationEvent } from '@boatnet/bn-models';
import moment from 'moment';

@Component
export default class BoatnetFishTickets extends Vue {
  @Prop() private locations!: LocationEvent[];
  private locationHolder: LocationEvent[] = this.locations
    ? this.locations
    : [];

  private selected: any[] = [];
  private showDialog = false;
  private action = '';

  private current: LocationEvent = {};

  private settings = {
    rowKey: '__index',
    columns: [
      {
        name: 'date',
        required: true,
        label: 'Date',
        align: 'left',
        field: (row: any) => row.date,
        sortable: true
      }
    ]
  };

  private selectTrip(row: any) {
    this.selected = row ? [row] : [];
  }

  private addRow() {
    this.current = {};
    this.action = 'add';
    this.showDialog = true;
  }

  private editRow() {
    this.action = 'edit';
    this.showDialog = true;
    if (this.selected.length > 0) {
      const temp = JSON.stringify(this.locationHolder[this.selected[0].__index]);
      this.current = JSON.parse(temp);
    }
  }

  private deleteRow() {
    if (this.selected.length > 0) {
      this.locationHolder.splice(this.selected[0].__index, 1);
      this.$emit('update:fishTickets', this.locationHolder);
      this.$emit('save');
    }
  }

  private saveAdd() {
    this.locationHolder.push(this.current);
    this.$emit('update:fishTickets', this.locationHolder);
    this.showDialog = false;
    this.$emit('save');
  }

  private saveEdit() {
    this.locationHolder.splice(
      this.selected[0].__index,
      1,
      this.current
    );
    this.showDialog = false;
    this.$emit('update:fishTickets', this.locationHolder);
    this.$emit('save');
    this.selected = [];
  }
}
</script>