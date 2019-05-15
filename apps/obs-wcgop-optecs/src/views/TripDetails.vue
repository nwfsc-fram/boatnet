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
                    fill-input
                    hide-selected
                    input-debounce="0"
                    :options="options"
                    option-value="label"
                    debounce="500"
                    @input="saveOnUpdate"
                    @filter="getVesselNames"
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
                    v-model="currentTrip.captainName"
                    label="Skipper's Name"
                    debounce="500"
                    @input="saveOnUpdate"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  />
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.crewSize"
                    label="# of Crew"
                    debounce="500"
                    @input="saveOnUpdate"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.logbookNum"
                    label="Observer Logbook #"
                    debounce="500"
                    @input="saveOnUpdate"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                  <boatnet-datetime
                    dateLabel="Departure Date"
                    timeLabel="Departure Time"
                    :value="currentTrip.departureDate"
                    @save="updateDepartureDate"
                    @error="handleError"
                    @displayKeyboard="displayKeyboard"
                  />
                  <q-select
                    outlined
                    class="col-2"
                    v-model="currentTrip.departurePort.name"
                    label="Departure Port"
                    use-input
                    hide-selected
                    input-debounce="0"
                    :options="options"
                    debounce="500"
                    @input="saveOnUpdate"
                    @filter="getPorts"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">No results</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="col-5">
                <boatnet-licenses
                  :certificates="certificate"
                  @displayKeyboard="displayKeyboard"
                  @error="handleError"
                />
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
                    debounce="500"
                    @input="saveOnUpdate"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  />
                  <q-input
                    outlined
                    class="col-2"
                    v-model="currentTrip.logbookNum"
                    label="Vessel Logbook Page #"
                    debounce="500"
                    @input="saveOnUpdate"
                    @focus="displayKeyboard"
                    data-layout="numeric"
                  />
                  <boatnet-datetime
                    dateLabel="Return Date"
                    timeLabel="Return Time"
                    :value="currentTrip.returnDate"
                    @save="updateReturnDate"
                    @error="handleError"
                    @displayKeyboard="displayKeyboard"
                  />
                  <q-select
                    outlined
                    class="col-2"
                    v-model="currentTrip.returnPort.name"
                    label="Return Port"
                    use-input
                    hide-selected
                    input-debounce="0"
                    :options="options"
                    debounce="500"
                    @input="saveOnUpdate"
                    @filter="getPorts"
                    @focus="displayKeyboard"
                    data-layout="normal"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">No results</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="col-5">
                <div class="column q-col-gutter-md">
                  <q-input
                    outlined
                    class="col-2"
                    :value="firstReceiverName"
                    label="First Receiver"
                    debounce="500"
                    @input="saveOnUpdate"
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
                      debounce="500"
                      @input="saveOnUpdate"
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
      <div class="row q-gutter-sm fixed-bottom q-pa-md justify-end">
        <q-btn color="primary" icon="play_arrow" label="Go to Hauls" @click="goToHauls"/>
      </div>
    </q-page>
  </span>
</template>

<script lang="ts">
import { Point } from 'geojson';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { AlertState } from '../_store/types/types';
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
import BoatnetDatetime from '@boatnet/bn-common';

Vue.component(BoatnetLicenses);
Vue.component(BoatnetDatetime);

@Component
export default class Trips extends Vue {
  @Prop({ default: 'start' }) public startTab!: string;
  @Prop(Number) public tripNum!: number; // Passed by router
  public model: any = null;
  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('saveTrip', { namespace: 'appState' })
  private saveTrip: any;
  @Getter('currentTrip', { namespace: 'appState' })
  private currentTrip!: WcgopTrip;

  private tab: string; // Current tab (start or end)
  private ph = ''; // TEMP

  private options: string[] = [];

  // TODO modify this to load from DB
  private certificate: string[] = [''];

  constructor() {
    super();
    this.tab = this.startTab;
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

  private handleError(errorMsg: string) {
    this.errorAlert(errorMsg);
  }

  private updateDepartureDate(datetime: string) {
    if (this.currentTrip.returnDate && moment(datetime).isAfter(moment(this.currentTrip.returnDate))) {
      this.errorAlert('Departure date must be before return date');
    } else {
      this.currentTrip.departureDate = datetime;
      this.saveOnUpdate();
    }
  }

  private updateReturnDate(datetime: string) {
    if (this.currentTrip.departureDate && moment(datetime).isBefore(moment(this.currentTrip.departureDate))) {
      this.errorAlert('Return date must be after departure date');
    } else {
      this.currentTrip.returnDate = datetime;
      this.saveOnUpdate();
    }
  }

  private saveOnUpdate() {
    this.saveTrip(this.currentTrip);
  }

  private goToHauls() {
    this.$router.push({ path: '/hauls/' });
  }

  private changeTab(tabName: string) {
    this.tab = tabName;
  }

  private displayKeyboard(event: any) {
    if (event) {
      this.$emit('displayKeyboard', event.target);
    }
  }

  private async getPorts(val: string, update: any, abort: any) {
    this.getLookupVals(val, update, abort, 'optecs_trawl/all_port_names');
  }

  private async getVesselNames(val: string, update: any, abort: any) {
    this.getLookupVals(val, update, abort, 'optecs_trawl/all_vessel_names');
  }

  private async getLookupVals(val: string, update: any, abort: any, lookupTable: string) {
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
          end_key: val.toLowerCase() + '{}',
          inclusive_end: true,
          descending: false
        };

        const vessels = await db.query(
          pouchService.lookupsDBName,
          lookupTable,
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
