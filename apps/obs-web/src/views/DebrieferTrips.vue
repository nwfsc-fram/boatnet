<template>
  <div>
    <div class="text-h6">Trips</div>
    Selection = {{selected}}
    <q-table
      :data="WcgopTrips"
      :columns="tripColumns"
      dense
      row-key="id"
      :pagination.sync="pagination"
      :visible-columns="visibleTripColumns"
    >
      <template v-slot:top="props">
        <div v-if="$q.screen.gt.xs" class="col">
          <q-select
            outlined
            v-model="visibleTripColumns"
            multiple
            :options="tripColumns"
            label="Visible Columns"
            style="width: 270px"
            option-label="label"
            option-value="name"
            emit-value
            :display-value="null"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                style="font-size: .5em"
                icon="fa fa-plus-circle"
                @click="addAll"
              />
              <q-btn
                round
                dense
                flat
                style="font-size: .5em"
                icon="fa fa-minus-circle"
                @click="removeAll"
              />
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label v-html="scope.opt.label"/>
                </q-item-section>
                <q-item-section avatar v-if="scope.selected">
                  <q-icon name="fa fa-check-circle"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="key" :props="props">{{ props.row.key }}</q-td>
          <q-td
            key="tripStatus"
            :props="props"
            @click.native="selectRow(props.row.__index,'tripStatus')"
            :class="selected.hasOwnProperty(props.row.__index) && selected[props.row.__index].indexOf('tripStatus')!=-1?'bg-grey-2':''"
          >{{ props.row.tripStatus.description }}</q-td>
          <q-td
            key="vessel"
            :props="props"
            @click.native="selectRow(props.row.__index,'vessel')"
            :class="selected.hasOwnProperty(props.row.__index) && selected[props.row.__index].indexOf('vessel')!=-1?'bg-grey-2':''"
          >{{ props.row.vessel.vesselName }}</q-td>
          <q-td key="program" :props="props">{{ props.row.program.name }}</q-td>
          <q-td key="departurePort" :props="props">{{ props.row.departurePort.name }}</q-td>
          <q-td key="departureDate" :props="props">{{ formatDate(props.row.departureDate) }}</q-td>
          <q-td key="returnPort" :props="props">{{ props.row.returnPort.name }}</q-td>
          <q-td key="returnDate" :props="props">{{ formatDate(props.row.returnDate) }}</q-td>
          <q-td key="captain" :props="props">{{ props.row.captain }}</q-td>
          <q-td key="isPartialTrip" :props="props">{{ props.row.isPartialTrip }}</q-td>
          <q-td key="fishingDays" :props="props">{{ props.row.fishingDays }}</q-td>
          <q-td
            key="fishery"
            :props="props"
          >{{ props.row.fishery ? props.row.fishery.description :'' }}</q-td>
          <q-td key="crewSize" :props="props">{{ props.row.crewSize }}</q-td>
          <q-td key="firstReceiver" :props="props">{{ props.row.firstReceiver }}</q-td>
          <q-td key="isFishProcessed" :props="props">{{ props.row.isFishProcessed }}</q-td>
          <q-td key="logbookNum" :props="props">{{ props.row.logbookNum }}</q-td>
          <q-td key="logbookType" :props="props">{{ props.row.logbookType }}</q-td>
          <q-td key="observerLogbookNum" :props="props">{{ props.row.observerLogbookNum }}</q-td>
          <q-td key="debriefer" :props="props">{{ props.row.debriefer }}</q-td>
          <q-td key="brd" :props="props">{{ props.row.brd }}</q-td>
          <q-td key="hlfc" :props="props">{{ props.row.hlfc }}</q-td>
          <q-td key="fishTickets" :props="props">{{ props.row.fishTickets }}</q-td>
          <q-td key="certificates" :props="props">{{ props.row.certificates }}</q-td>
          <q-td key="waiver" :props="props">{{ props.row.waiver }}</q-td>
          <q-td key="intendedGearType" :props="props">{{ props.row.intendedGearType }}</q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>


<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
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
import { date } from 'quasar';
import { convertToObject } from 'typescript';

@Component
export default class DebrieferTrips extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  private WcgopTrips: WcgopTrip[] = [];
  private selected: any = {};
  private pagination = { rowsPerPage: 50 };

  private visibleTripColumns = [
    'key',
    'tripStatus',
    'vessel',
    'program',
    'departurePort',
    'departureDate',
    'returnPort',
    'returnDate'
  ];

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

  private addAll() {
    this.visibleTripColumns = this.tripColumns.map(
      (tripColumns) => tripColumns.name
    );
  }

  private removeAll() {
    this.visibleTripColumns = [];
  }
}
</script>