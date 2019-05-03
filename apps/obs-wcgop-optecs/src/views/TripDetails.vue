<template>
  <span>
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>
    <q-page padding>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="start">
          <div class="text-h5 test-flexbox-row justify-center">Trip #{{tripNum}} Start</div>
          <div class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-5">
                <div class="column q-col-gutter-md">
                  <q-select
                    outlined
                    class="col-2"
                    v-model="currentTrip.vessel.vesselName"
                    label="Vessel Name/ Registration"
                    use-input
                    hide-selected
                    input-debounce="0"
                    :options="options"
                    @filter="filterFn"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">No results</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input
                    outlined
                    class="col-2"
                    v-model="captainName"
                    label="Skipper's Name"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  />
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.crewSize"
                    label="# of Crew"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.observerLogbookNum"
                    label="Observer Logbook #"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                  <q-input
                    outlined
                    label="Departure Date"
                    v-model="departureDateDisplay"
                    mask="date"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy>
                          <q-date v-model="departureDateDisplay"/>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-input
                    outlined
                    class="col-2"
                    label="Departure Time"
                    v-model="departureTime"
                    mask="##:##"
                    fill-mask
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                  <q-input
                    outlined
                    v-model="currentTrip.departurePort.name"
                    label="Departure Port"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  />
                </div>
              </div>
              <div class="col-5">
                <boatnet-licenses :certificates="certificate" @displayKeyboard="displayKeyboard"/>
              </div>
              <div class="col-1 self-center">
                <q-btn flat dense round @click="changeTab('end')" icon="chevron_right" size="4em"/>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="end">
          <div class="text-h5 test-flexbox-row justify-center">Trip #{{tripNum}} End</div>
          <div class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-1 self-center">
                <q-btn flat dense round @click="changeTab('start')" icon="chevron_left" size="3em"/>
              </div>
              <div class="col-5">
                <div class="column q-col-gutter-md">
                  <div class="col-2">
                    <div class="text-h8 col-3">Partial Trip</div>
                    <q-btn-toggle
                      class="col-auto"
                      v-model="currentTrip.isPartialTrip"
                      toggle-color="primary"
                      :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
                    />
                  </div>
                  <div class="col-2">
                    <div class="text-h8 col-3">Fish Processed During Trip</div>
                    <q-btn-toggle
                      class="col-auto"
                      v-model="currentTrip.isFishProcessed"
                      toggle-color="primary"
                      :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
                    />
                  </div>
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.logbookType"
                    label="Vessel Logbook Name"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  />
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.logbookNum"
                    label="Vessel Logbook Page #"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.returnPort.name"
                    label="Return Port"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  />
                  <q-input
                    outlined
                    label="Return Date"
                    v-model="returnDateDisplay"
                    mask="date"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy>
                          <q-date v-model="returnDateDisplay"/>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-input
                    outlined
                    class="col-2"
                    label="Return Time"
                    v-model="returnTime"
                    mask="##:##"
                    fill-mask
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                </div>
              </div>
              <div class="col-5">
                <div class="column q-col-gutter-md">
                  <q-input
                    outlined
                    class="col-2"
                    :value="firstReceiverName"
                    label="First Receiver"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  />
                  <div class="text-h6 col-2">Fish Tickets</div>
                  <!-- TODO this should be a component -->
                  <div class="row">
                    <q-input
                      outlined
                      class="col-12"
                      v-model="ph"
                      label="Fish Ticket"
                      @focus="displayKeyboard"
                      data-layout="numeric"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
      <div class="row justify-center">
        <q-option-group
          v-model="tab"
          inline
          :options="[
          { label: '', value: 'start' },
          { label: '', value: 'end' },
        ]"
        />
      </div>
    </q-page>
  </span>
</template>

<script lang="ts">
import { Point } from 'geojson';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import { date } from 'quasar';
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import { AlertState } from '../_store/types/types';
import { shortFormatDate } from '@boatnet/bn-util';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import {
  WcgopTrip,
  WcgopTripTypeName,
  Port,
  PortTypeName,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  Vessel,
  Person,
  PersonTypeName,
  VesselTypeName
} from '@boatnet/bn-models';

import { couchService } from '@boatnet/bn-couch';
import BoatnetLicenses from '@boatnet/bn-common';

Vue.component(BoatnetLicenses);

@Component
export default class Trips extends Vue {
  @Prop({ default: 'start' }) public startTab!: string;
  @Prop(Number) public tripNum!: number; // Passed by router
  public model: any = null;
  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  private shortFormat = shortFormatDate;

  private tab: string; // Current tab (start or end)
  private currentTrip: WcgopTrip;
  private ph = ''; // TEMP

  private options: string[] = [];

  // TODO modify this to load from DB
  private certificate: string[] = [''];
  private departureDate = Date.now();
  private departureDateDisplay = date.formatDate(this.departureDate, 'YYYY/MM/DD');
  private departureTime = '';

  private returnDate = Date.now();
  private returnDateDisplay = date.formatDate(this.returnDate, 'YYYY/MM/DD');
  private returnTime = '';

  constructor() {
    super();
    this.tab = this.startTab;
    const examplePort: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      name: 'Oxnard'
    };
    const examplePort2: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      name: 'Port Townsend'
    };
    const exampleContact: Person = {
      _id: 'asdf',
      type: PersonTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      firstName: 'Seadog',
      lastName: 'McGillicutty'
    };
    const exampleVessel: Vessel = {
      _id: 'asdf',
      type: VesselTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      vesselName: 'Pickle Pelican (CF1890HT)',
      coastGuardNumber: 'ABC123'
    };
    // TODO This is just an example trip
    this.currentTrip = {
      _id: '1',
      tripNum: this.tripNum,
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      fishery: { name: 'Catch Shares' },
      captain: exampleContact,
      crewSize: 25,
      isPartialTrip: false,
      observerLogbookNum: 123,
      departurePort: examplePort,
      departureDate: moment().format(),
      returnPort: examplePort2,
      returnDate: moment()
        .add(1, 'days')
        .format(),
      vessel: exampleVessel,
      firstReceivers: [
        {
          name: 'Crangon Seafoods'
        }
      ],
      // ... other data
      legacy: {
        tripId: 123
      }
    };
  }
  get captainName(): string | undefined {
    if (this.currentTrip.captain) {
      return (
        this.currentTrip.captain.firstName +
        ' ' +
        this.currentTrip.captain.lastName
      );
    }
  }
  get firstReceiverName(): string | undefined {
    if (
      this.currentTrip.firstReceivers &&
      this.currentTrip.firstReceivers.length
    ) {
      return this.currentTrip.firstReceivers[0].name;
    }
  }

  get vesselReg() {
    if (this.currentTrip.vessel) {
      return this.currentTrip.vessel.coastGuardNumber
        ? this.currentTrip.vessel.coastGuardNumber
        : this.currentTrip.vessel.stateRegulationNumber;
    }
  }

  private changeTab(tabName: string) {
    this.tab = tabName;
  }

  private displayKeyboard(event: any) {
    if (event) {
      this.$emit('displayKeyboard', event.target);
    }
  }

  // TODO move to shared util?
  private formatDate(dateStr: string): string {
    return moment(dateStr).format('MM/DD/YY hh:mm');
  }
  private async filterFn(val: string, update: any, abort: any) {
    // if (val.length < 2) {
    //   abort();
    //   return;
    // }
    update(async () => {
      try {
        const db = pouchService.db;
        const queryOptions: ListOptions = {
          limit: 5,
          start_key: val.toLowerCase(),
          inclusive_end: true,
          descending: false
        };

        const vessels = await db.query(
          pouchService.lookupsDBName,
          'optecs_trawl/all_vessel_names',
          queryOptions
        );
        this.options = vessels.rows.map((vessel: any) => vessel.value);
      } catch (err) {
        this.errorAlert(err);
      }
    });
  }
  private abortFilterFn() {
    // console.log('delayed filter aborted');
  }
  private async testCouch() {
    // This function is not called. Left here for example purposes.
    try {
      // Lack of documentation, refer to options in code:
      // https://github.com/nozzlegear/davenport/blob/master/index.ts
      const userDB: Client<any> = couchService.userDB;
      const roDB: Client<any> = couchService.lookupsDB;
      const masterDB: Client<any> = couchService.masterDB;
      // Example:
      // const singleDoc = await userDB.get<MyDocType>('489337588b5ff50b96779b7151001b7c');
      const userStuff = await userDB.listWithDocs();
      console.log(userStuff);
      const options: ListOptions = {
        limit: 10,
        start_key: 'f',
        end_key: 'x'
      };
      const vessels = await roDB.view<any>(
        'optecs_trawl',
        'all_vessel_names',
        options
      );
      for (const v of vessels.rows) {
        console.log(v.value);
      }
    } catch (err) {
      this.errorAlert(err);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.example-flexbox-row {
  flex-direction: row;
}
</style>
