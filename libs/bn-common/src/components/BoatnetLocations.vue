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
        <q-td key="position">{{ getPositionName(rowVals.row.__index) }}</q-td>
        <q-td key="date">{{ formatDate(rowVals.row.locationDate) }}</q-td>
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
      :settings="locationDialog"
      :show.sync="showDialog"
      @save="action === 'add' ? saveAdd() : saveEdit()"
    >
      <div class="col q-gutter-md q-pb-md">
        <q-input outlined label="Date" mask="date" v-model="dateVal"/>
        <boatnet-keyboard-input
          :value.sync="timeVal"
          label="Time"
          keyboardType="numeric"
          mask="time"
          :showMask="true"
        />
        <boatnet-keyboard-input
          :value.sync="current.location.coordinates[0]"
          label="Longitude"
          keyboardType="numeric"
          mask="###°##.##"
        />
        <boatnet-keyboard-input
          :value.sync="current.location.coordinates[1]"
          label="Latitude"
          keyboardType="numeric"
          mask="##°##.##"
        />
        <boatnet-keyboard-input
          :value.sync="current.depth"
          label="Depth (ftm)"
          keyboardType="numeric"
          mask="###"
          :showMask="false"
        />
        {{ geolocation }}
      </div>
      <div class="col q-pl-md self-start">
        <!-- <q-date v-model="dateVal" minimal :default-year-month="defaultYearMonth"/> -->
        <pCalendar
          v-model="dateVal"
          :inline="true"
          :showTime="true" hourFormat="12"
        >
        </pCalendar>
      </div>
    </boatnet-input-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { WcgopFishTicket } from '@boatnet/bn-models';
import moment from 'moment';
import { FishingLocation } from '@boatnet/bn-models';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

@Component
export default class BoatnetLocations extends Vue {
  @Prop() private locations!: FishingLocation[];
  private locationHolder: FishingLocation[] = this.locations
    ? this.locations
    : [];
  private defaultYearMonth = moment().format('YYYY/MM');

  private selected: any[] = [];
  private showDialog = false;
  private action = '';

  private dateVal: any = null;
  private timeVal: string = '';

  private geolocation = this.getGeolocation();

  private current: FishingLocation = {
    location: {
      type: 'Point',
      coordinates: []
    }
  };

  private locationDialog = {
    title: this.action === 'add' ? this.getPositionName(this.locationHolder.length) : this.getPositionName(this.current.__index),
    width: 600,
    height: 200,
    confirmationLabel: 'Yes'
  };

  private settings = {
    rowKey: '__index',
    columns: [
      {
        name: 'position',
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

  private created() {
    if (this.locations) {
      this.locationHolder = this.sortByDate(this.locations);
    }

  }

  private getGeolocation() {
        navigator.geolocation.getCurrentPosition(
        (position) => {
          return position.coords.longitude + ' ' + position.coords.latitude;
        },
        (error) => {
            alert(error.message);
        }, {
            enableHighAccuracy: true
            , timeout: 5000
        }
    );
  }

  private sortByDate(locs: FishingLocation[]) {
    return locs.sort((a, b) => {
      if (moment(a.locationDate).isAfter(b.locationDate)) {
        return 1;
      } else if (moment(a.locationDate).isBefore(b.locationDate)) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  private getPositionName(index: number) {
    if (index === 0) {
      return 'Set';
    } else if (index === 1) {
      return 'Up';
    } else {
      return 'Loc#' + (index - 1);
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
    this.action = 'add';
    this.timeVal = '';
    this.dateVal = null;
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
      this.dateVal = this.current.locationDate
        ? moment(this.current.locationDate).format('YYYY/MM/DD')
        : '';
      this.timeVal = this.current.locationDate
        ? moment(this.current.locationDate).format('HH:mm')
        : '';
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
    this.current.locationDate = moment(
      this.dateVal + ' ' + this.timeVal,
      'YYYY/MM/DD HH:mm'
    ).format();
    this.locationHolder.push(this.current);
    this.locationHolder = this.sortByDate(this.locationHolder);
    this.$emit('update:locations', this.locationHolder);
    this.showDialog = false;
    this.$emit('save');
  }

  private saveEdit() {
    this.current.locationDate = moment(
      this.dateVal + ' ' + this.timeVal,
      'YYYY/MM/DD HH:mm'
    ).format();
    this.locationHolder.splice(this.selected[0].__index, 1, this.current);
    this.locationHolder = this.sortByDate(this.locationHolder);
    this.showDialog = false;
    this.$emit('update:locations', this.locationHolder);
    this.$emit('save');
    this.selected = [];
  }
}
</script>