<template>
  <div>
    <div class="text-h6">Trips</div>
    <prime-table :value="WcgopTrips" :columns="columns" />
    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Bulk Editing</div>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-input label="Column" v-model="bulkEditColumn" readonly />
          <q-input label="Previous Value" v-model="bulkEditColumnPreviousValue" readonly />
          <q-input label="New Value" v-model="bulkEditColumnNewValue"></q-input>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup></q-btn>
          <q-btn flat label="Save" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>


<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { DebrieferState } from '../_store/types/types';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopCatch,
  WcgopSpecimen,
  Basket
} from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date, colors } from 'quasar';
import { convertToObject } from 'typescript';

import PrimeTable from './PrimeTable.vue';
Vue.component('PrimeTable', PrimeTable);

@Component
export default class DebrieferTrips extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  private columns = [
    { field: 'key', header: 'Trip Id' },
    { field: 'tripStatus.description', header: 'Trip Status' },
    { field: 'vessel.vesselName', header: 'Vessel' },
    { field: 'program.name', header: 'Program' },
    { field: 'departurePort.name', header: 'Departure Port' },
    { field: 'departureDate', header: 'Departure Date' },
    { field: 'returnPort.name', header: 'Return Port' },
    { field: 'returnDate', header: 'Return Date' }
  ];

  private WcgopTrips: any[] = [];
  private WcgopDialogTrips: WcgopTrip[] = [];
  private selected: any = {};
  private bulkEditColumn: any = '';
  private bulkEditColumnPreviousValue: any = '';
  private bulkEditColumnNewValue: any = '';
  private rowSelected: any = [];
  private dialog: boolean = false;
  private tripDialogColumns: any = [];
  private mouseDownRow: any;
  private pagination = { rowsPerPage: 50 };
  private dialogPagination = { rowsPerPage: 10 };
  private tripDialogColumnNameSet = new Set();
  private deleteButtonDisabled = true;

  private mouseDown: boolean = false;
  private currentColumn: string = '';
  private currentRow: number = -1;
  private active: boolean = false;
  private rowSelectionType: string = 'click';

  private tripColumns = [
    {
      name: 'key',
      label: 'Trip ID',
      field: 'key',
      align: 'left',
      sortable: true
    },
    {
      name: 'tripStatus',
      label: 'Trip Status',
      field: 'tripStatus',
      align: 'left',
      sortable: true
    },
    {
      name: 'vessel',
      label: 'Vessel',
      field: 'vessel',
      align: 'left',
      sortable: true
    },
    {
      name: 'program',
      label: 'Program',
      field: 'program',
      align: 'left',
      sortable: true
    },
    {
      name: 'departurePort',
      label: 'Departure Port',
      field: 'departurePort',
      align: 'left',
      sortable: true
    },
    {
      name: 'departureDate',
      label: 'Departure Date',
      field: 'departureDate',
      align: 'left',
      sortable: true
    },
    {
      name: 'returnPort',
      label: 'Return Port',
      field: 'returnPort',
      align: 'left',
      sortable: true
    },
    {
      name: 'returnDate',
      label: 'Return Date',
      field: 'returnDate',
      align: 'left',
      sortable: true
    },
    {
      name: 'captain',
      label: 'Skipper',
      field: 'captain',
      align: 'left',
      sortable: true
    },
    {
      name: 'isPartialTrip',
      label: 'Partial Trip',
      field: 'isPartialTrip',
      align: 'left',
      sortable: true
    },
    {
      name: 'fishingDays',
      label: 'Fishing Days',
      field: 'fishingDays',
      align: 'left',
      sortable: true
    },
    {
      name: 'fishery',
      label: 'Fishery',
      field: 'fishery',
      align: 'left',
      sortable: true
    },
    {
      name: 'crewSize',
      label: 'Crew Size',
      field: 'crewSize',
      align: 'left',
      sortable: true
    },
    {
      name: 'firstReceiver',
      label: 'First Receiver',
      field: 'firstReceiver',
      align: 'left',
      sortable: true
    },
    {
      name: 'isFishProcessed',
      label: 'Fish Processed',
      field: 'isFishProcessed',
      align: 'left',
      sortable: true
    },
    {
      name: 'logbookNum',
      label: 'Logbook #',
      field: 'logbookNum',
      align: 'left',
      sortable: true
    },
    {
      name: 'logbookType',
      label: 'Logbook Type',
      field: 'logbookType',
      align: 'left',
      sortable: true
    },
    {
      name: 'observerLogbookNum',
      label: 'Observer Logbook',
      field: 'observerLogbookNum',
      align: 'left',
      sortable: true
    },
    {
      name: 'debriefer',
      label: 'Debriefer',
      field: 'debriefer',
      align: 'left',
      sortable: true
    },
    { name: 'brd', label: 'BRD', field: 'brd', align: 'left', sortable: true },
    {
      name: 'hlfc',
      label: 'HLFC',
      field: 'hlfc',
      align: 'left',
      sortable: true
    },
    {
      name: 'fishTickets',
      label: 'Fish Tickets',
      field: 'fishTickets',
      align: 'left',
      sortable: true
    },
    {
      name: 'certificates',
      label: 'Certificates',
      field: 'certificates',
      align: 'left',
      sortable: true
    },
    {
      name: 'waiver',
      label: 'Waiver',
      field: 'waiver',
      align: 'left',
      sortable: true
    },
    {
      name: 'intendedGearType',
      label: 'Intended Gear Type',
      field: 'intendedGearType',
      align: 'left',
      sortable: true
    }
  ];

  private async getTrips() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
      const options: ListOptions = {
        limit: 20
      };

      const trips = await masterDB.viewWithDocs<any>(
        'MainDocs',
        'all-trips',
        options
      );

      for (const row of trips.rows) {
        const trip = row.doc;
        trip.key = row.key;
        this.WcgopTrips.push(trip);

        for (const operationId of trip.operationIDs) {
          this.debriefer.WcgopOperationTripDict[operationId] = trip;
        }
      }
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.getTrips();
  }

  private formatDate(inputDate: any) {
    return date.formatDate(inputDate, 'MM/DD/YYYY');
  }

  private nullValueCheck(input: any, round: boolean) {
    if (input) {
      if (round) {
        return input.value.toFixed(2);
      } else {
        return input.value;
      }
    }

    return '';
  }

  private nullDescriptionCheck(input: any) {
    if (input != null) {
      return input.description;
    }

    return '';
  }

  private selectRow(index: any, value: any) {
    // console.log('selectRow with index=' + index + ' and value=' + value);
    if (this.selected.hasOwnProperty(index)) {
      this.selected[index].indexOf(value) === -1
        ? this.selected[index].push(value)
        : this.selected[index].splice(this.selected[index].indexOf(value), 1);
    } else {
      this.selected[index] = [];
      this.selected[index].push(value);
      this.selected = Object.assign({}, this.selected);
    }
  }

  private highlight(index: any, value: any) {
    // console.log('highlight index=' + index + ' column=' + value);

    if (this.mouseDown) {
      if (this.currentRow !== index) {
        this.selectRow(index, this.currentColumn);
      }
    }

    this.currentRow = index;
  }

  // keep track of the row index of the column on mouse down
  private selectMultipleRowsMousedown(index: any, value: any) {
    // console.log(
    //   'selectMultipleRowsMousedown index=' +
    //     index +
    //     ' value=' +
    //     value +
    //     ' mouseDownRow=' +
    //     this.mouseDownRow
    // );
    this.selected = [];
    this.mouseDown = true;
    this.currentColumn = value;
    this.selectRow(index, value);
    this.mouseDownRow = index;
  }
  // gets the actual value of the row ("index") and column "value"
  private getValue(index: any, value: any) {
    switch (value) {
      case 'tripStatus':
        return this.WcgopTrips[index][value].description;
      case 'vessel':
        return this.WcgopTrips[index][value].vesselName;
    }
  }

  // calculate the difference between the last row selected
  // and the current row and highlight each one separately
  private selectMultipleRowsMouseup(index: any, value: any) {
    // console.log(
    //   'selectMultipleRowsMouseup index=' +
    //     index +
    //     ' value=' +
    //     value +
    //     ' mouseDownRow=' +
    //     this.mouseDownRow
    // );
    this.mouseDown = false;
    this.bulkEditColumnPreviousValue = this.getValue(index, value);
    let multipleValues = false;

    for (const tripColumn of this.tripColumns) {
      if (tripColumn.name === value) {
        this.bulkEditColumn = tripColumn.label;
      }
    }
    // console.log(this.bulkEditColumnPreviousValue);

    if (this.mouseDownRow > index) {
      // console.log('mouseDownRow>index');
      // console.log(this.selected);
      multipleValues = true;
      for (let i = index; i <= this.mouseDownRow; i++) {
        // if(!multipleValues && this.bulkEditColumnPreviousValue!=this.getValue(index,value))
        if (!this.selected.hasOwnProperty(i)) {
          this.selectRow(i, this.currentColumn);
        }
      }
    } else if (this.mouseDownRow < index) {
      multipleValues = true;
      // console.log('mouseDownRow<index');
      // console.log(this.selected.hasOwnProperty(2));
      for (let i = this.mouseDownRow; i <= index; i++) {
        // if(!multipleValues && this.bulkEditColumnPreviousValue!=value)
        if (!this.selected.hasOwnProperty(i)) {
          console.log(this.selected.hasOwnProperty(i));
          console.log(i);
          this.selectRow(i, this.currentColumn);
        }
      }
    }
    // else
    //   this.selectRow(index,this.currentColumn);

    if (multipleValues) {
      this.bulkEditColumnPreviousValue = 'Multiple';
    }
    this.currentColumn = '';
  }

  private openEditDialog() {
    this.WcgopDialogTrips = [];
    this.tripDialogColumns = [];
    let key: any;
    let j = 0; // index of column that is editable
    this.dialog = true;

    // create a set containing the column names selected for edit
    if (this.selected) {
      // set first column to the key of the row selected
      this.tripDialogColumns[j] = this.tripColumns[j];

      for (key in this.selected) {
        if (this.selected.hasOwnProperty(key)) {
          this.WcgopDialogTrips[key] = this.WcgopTrips[key];

          for (const tripSelected of this.selected[key]) {
            this.tripDialogColumnNameSet.add(tripSelected);
          }
        }
      }

      // dynamically create an array of column headers to be edited
      for (const tripColumn of this.tripColumns) {
        if (this.tripDialogColumnNameSet.has(tripColumn.name)) {
          j++;
          this.tripDialogColumns[j] = tripColumn;
        }
      }
    }
  }

  private get computedTableClass() {
    return this.active ? ' myClass' : '';
  }

  private get computedNativeHover() {
    return this.rowSelectionType === 'hover' || this.rowSelectionType === 'both'
      ? 'mouseover'
      : null;
  }

  private get computedNativeClick() {
    return this.rowSelectionType === 'click' || this.rowSelectionType === 'both'
      ? 'click'
      : null;
  }

  private colSelector() {
    this.$nextTick(() => {
      this.active = false;
      const a = [].forEach.call(document.querySelectorAll('td'), (el: any) => {
        el.addEventListener('mousedown', (ev: any) => {
          this.active = true;
          ev.preventDefault();
          const b = [].forEach.call(
            document.querySelectorAll('.highlight'),
            (el2: any) => {
              el2.classList.remove('highlight');
            }
          );
          el.classList.add('highlight');
        });
      });

      const c = [].forEach.call(document.querySelectorAll('td'), (el: any) => {
        el.addEventListener('mousemove', (ev: any) => {
          if (this.active) {
            el.classList.add('highlight');
          }
        });
      });

      document.addEventListener('mouseup', (ev) => {
        this.active = false;
      });
    });
  }
  private mounted() {
    const tb: any = document.getElementsByClassName('q-table');
    this.$nextTick(() => {
      const g = tb[0].rows;
      console.log('tb', g);

      this.colSelector();
    });
  }

  private getSelectedString(numRows: number) {
    return numRows === 0
      ? ''
      : `${numRows} record${numRows > 1 ? 's' : ''} selected of ${
          this.WcgopTrips.length
        }`;
  }

  private isRowSelected(key: any) {
    console.log('isRowSelected');
  }

  // update selected row handler
  private onRowSelectUpdate(val: any[]) {
    this.deleteButtonDisabled = val.length === 0;
  }

  @Watch('pagination')
  private handler1(newVal: string, oldVal: string) {
    console.log('handler1', newVal, oldVal);
    this.colSelector();
  }

  @Watch('paginationController')
  private handler2(newVal: string, oldVal: string) {
    console.log('hanlder2', newVal, oldVal);
    this.colSelector();
  }
}
</script>

<style lang="stylus" scoped>
.grid-style-transition {
  transition: transform 0.3s;
}

.highlight {
  background-color: $secondary;
}

.myClass {
  tbody tr {
    &:hover {
      background: none;
    }
  }
}

.dragClass {
  tbody td.highlighted {
    background-color: #999;
  }
}
</style>
