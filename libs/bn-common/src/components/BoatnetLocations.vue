<template>
  <span>
    <boatnet-table
      :data="locations"
      :settings="settings"
      :showBottom="false"
      :isCondensed="true"
      @select="selectTrip"
    >
      <template v-slot:default="rowVals">
        <q-td key="type">{{ rowVals.row.type }}</q-td>
        <q-td key="date">{{ formatDate(rowVals.row.date) }}</q-td>
        <q-td key="longitude">{{ rowVals.row.location.coordinates[0] }}</q-td>
        <q-td key="latitude">{{ rowVals.row.location.coordinates[1] }}</q-td>
        <q-td key="depth">{{ rowVals.row.depth }}</q-td>
      </template>
    </boatnet-table>

    <div class="row q-gutter-sm q-pa-md">
      <q-btn color="primary" label="Add" @click="addRow"/>
      <q-btn color="primary" label="Edit" @click="editRow" :disabled="selected.length <= 0"/>
      <q-btn color="primary" label="Delete" @click="deleteRow" :disabled="selected.length <= 0"/>
    </div>

    <boatnet-input-dialog
      :title="action === 'add' ? setType() : current.type"
      :show.sync="showDialog"
      @save="action === 'add' ? saveAdd() : saveEdit()"
    >
      <div class="col q-gutter-md q-pb-md">
        <boatnet-datetime
          dateLabel="Date"
          timeLabel="Time (Local 24hr)"
          :value.sync="current.date"
          :showPopup="false"
        />
        <q-input
          outlined
          class="col-2"
          v-model="current.location.coordinates[0]"
          label="Longitude"
          fill-mask
        />
        <q-input
          outlined
          class="col-2"
          v-model="current.location.coordinates[1]"
          label="Latitude"
          fill-mask
        />
        <q-input
          outlined
          class="col-2"
          v-model="current.depth"
          label="Depth (ftm)"
          mask="###"
          fill-mask
        />
      </div>
      <div class="col q-pl-md self-start">
        <q-date v-model="current.date" minimal :default-year-month="defaultYearMonth"/>
      </div>
    </boatnet-input-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { WcgopFishTicket, LocationEvent } from '@boatnet/bn-models';
import moment from 'moment';

@Component
export default class BoatnetLocations extends Vue {
  @Prop() private locations!: LocationEvent[];
  private locationHolder: LocationEvent[] = this.locations
    ? this.locations
    : [];
  private defaultYearMonth = moment().format('YYYY/MM');

  private selected: any[] = [];
  private showDialog = false;
  private action = '';

  private temp = '';

  private current: LocationEvent = {
    location: {
      type: 'Point',
      coordinates: []
    }
  };

  private settings = {
    rowKey: '__index',
    columns: [
      {
        name: 'type',
        required: true,
        label: 'Type',
        align: 'left',
        field: 'Set',
        sortable: true
      },
      {
        name: 'date',
        required: true,
        label: 'Date',
        align: 'left',
        field: (row: any) => row.date,
        sortable: true
      },
      {
        name: 'longitude',
        required: true,
        label: 'Longitude',
        align: 'left',
        field: (row: any) => row.depth,
        sortable: true
      },
      {
        name: 'latitude',
        required: true,
        label: 'Latitude',
        align: 'left',
        field: (row: any) => row.depth,
        sortable: true
      },
      {
        name: 'depth',
        required: true,
        label: 'Depth (ftm)',
        align: 'left',
        field: (row: any) => row.depth,
        sortable: true
      }
    ]
  };

  private setType() {
    if (this.locationHolder.length === 0) {
      return 'Set';
    } else if (this.locationHolder.length === 1) {
      return 'Up';
    } else {
      return 'Loc#' + (this.locationHolder.length - 1);
    }
  }

  private formatDate(date: string) {
    return moment(date).format('HH:mm MM/DD/YY');
  }

  private selectTrip(row: any) {
    this.selected = row ? [row] : [];
  }

  private addRow() {
    this.current = {
      location: {
        type: 'Point',
        coordinates: []
      }
    };
    this.current.type = this.setType();
    this.action = 'add';
    this.showDialog = true;
  }

  private editRow() {
    this.action = 'edit';
    this.showDialog = true;
    if (this.selected.length > 0) {
      const temp = JSON.stringify(
        this.locationHolder[this.selected[0].__index]
      );

      this.current = JSON.parse(temp);
    }
  }

  private deleteRow() {
    if (this.selected.length > 0) {
      this.locationHolder.splice(this.selected[0].__index, 1);
      this.$emit('update:location', this.locationHolder);
      this.$emit('save');
    }
  }

  private saveAdd() {
    this.locationHolder.push(this.current);
    this.$emit('update:location', this.locationHolder);
    this.showDialog = false;
    this.$emit('save');
  }

  private saveEdit() {
    this.locationHolder.splice(this.selected[0].__index, 1, this.current);
    this.showDialog = false;
    this.$emit('update:location', this.locationHolder);
    this.$emit('save');
    this.selected = [];
  }
}
</script>