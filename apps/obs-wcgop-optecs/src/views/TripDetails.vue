<template>
  <span>
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>
    <q-page>
      <boatnet-tab-panel :size="2">
        <template v-slot:title1>
          <div class="text-h5 test-flexbox-row justify-center">Trip #{{tripNum}} Start</div>
        </template>
        <template v-slot:content1>
          <div class="q-col-gutter-md row">
            <div class="col q-col-gutter-md">
              <boatnet-button-toggle
                title="Gear Type:"
                :value.sync="currentTrip.gearType"
                :options="[
                {label: 'Trawl', value: 'trawl'},
                {label: 'Fixed Gear', value: 'fixed'}
                ]"
                @save="saveOnUpdate"
              />
             <boatnet-keyboard-select
                :value.sync="currentTrip.vessel.vesselName"
                label="Vessel Name/ Registration"
                keyboardType="compact"
                :options="options"
                @filter="getVesselNames"
                @save="saveOnUpdate"
                dense
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.captainName"
                label="Skipper's Name"
                keyboardType="normal"
                @save="saveOnUpdate"
                dense
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.crewSize"
                label="# of Crew"
                keyboardType="numeric"
                @save="saveOnUpdate"
                dense
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.logbookNum"
                label="Observer Logbook #"
                keyboardType="numeric"
                @save="saveOnUpdate"
                dense
              />
            </div>
            <div class="col q-col-gutter-md">
              <boatnet-datetime
                dateLabel="Departure Date"
                timeLabel="Departure Time"
                :value.sync="currentTrip.departureDate"
                @save="saveOnUpdate"
                @error="handleError"
              />
              <boatnet-keyboard-select
                :value.sync="currentTrip.departurePort.name"
                label="Departure Port"
                keyboardType="normal"
                :options="options"
                @filter="getPorts"
                @save="saveOnUpdate"
              />
              <boatnet-licenses
                :certificates.sync="currentTrip.certificates"
                @error="handleError"
                @save="saveOnUpdate"
              />
            </div>
          </div>
        </template>

        <template v-slot:title2>
          <div class="text-h5 test-flexbox-row justify-center">Trip #{{tripNum}} End</div>
        </template>
        <template v-slot:content2>
          <div class="q-col-gutter-md row">
            <div class="col q-col-gutter-md">

              <div class="row">

              <div class="col">
                <div class="text-h8 col-3">Partial Trip</div>
                <q-btn-toggle
                  class="col-auto"
                  v-model="currentTrip.isPartialTrip"
                  toggle-color="primary"
                  :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
                />
              </div>

              <div class="col">
                <div class="text-h8 col-3">Fish Processed During Trip</div>
                <q-btn-toggle
                  class="col-auto"
                  v-model="currentTrip.isFishProcessed"
                  toggle-color="primary"
                  :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
                />
              </div>
              </div>

              <boatnet-keyboard-input
                :value.sync="currentTrip.logbookType"
                label="Vessel Logbook Name"
                keyboardType="normal"
                @save="saveOnUpdate"
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.logbookNum"
                label="Vessel Logbook Page #"
                keyboardType="numeric"
                @save="saveOnUpdate"
              />
              <boatnet-datetime
                dateLabel="Return Date"
                timeLabel="Return Time"
                :value.sync="currentTrip.returnDate"
                @save="saveOnUpdate"
                @error="handleError"
              />
            </div>
            <div class="col q-col-gutter-md">
              <div class="column q-col-gutter-md">
                <boatnet-keyboard-select
                  :value.sync="currentTrip.returnPort.name"
                  label="Return Port"
                  keyboardType="normal"
                  :options="options"
                  @filter="getPorts"
                  @save="saveOnUpdate"
                />
                <boatnet-keyboard-input
                  :value.sync="firstReceiverName"
                  label="First Receiver"
                  keyboardType="normal"
                  @save="saveOnUpdate"
                />
                <div class="text-h6 col-2">Fish Tickets</div>
                <boatnet-fish-tickets
                  :fishTickets.sync="currentTrip.fishTickets"
                  @save="saveOnUpdate"
                />
              </div>
            </div>
          </div>
        </template>
      </boatnet-tab-panel>
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
import { pouchService } from '@boatnet/bn-pouch';
import {
  WcgopTrip,
  WcgopTripTypeName,
  WcgopFishTicket,
  Port,
  PortTypeName,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  Vessel,
  Person,
  PersonTypeName,
  VesselTypeName,
  Certificate
} from '@boatnet/bn-models';

import { couchService } from '@boatnet/bn-couch';
import BoatnetLicenses from '@boatnet/bn-common';
import BoatnetDatetime from '@boatnet/bn-common';
import BoatnetFishTickets from '@boatnet/bn-common';

Vue.component(BoatnetLicenses);
Vue.component(BoatnetDatetime);
Vue.component(BoatnetFishTickets);

@Component
export default class Trips extends Vue {
  @Prop(Number) public tripNum!: number; // Passed by router
  public model: any = null;
  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('save', { namespace: 'appState' })
  private saveTrip: any;
  @Getter('currentTrip', { namespace: 'appState' })
  private currentTripState!: WcgopTrip;
  @Action('setCurrentTrip', { namespace: 'appState' })
  private setCurrentTrip: any;

  private currentTrip: WcgopTrip = {
    tripNum: this.tripNum,
    type: 'wcgop-trip',
    vessel: { vesselName: '' },
    departurePort: { name: '' },
    returnPort: { name: '' }
  };

  private ph = ''; // TEMP

  private options: string[] = [];

  constructor() {
    super();
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

  private async created() {
    if (this.currentTripState._id) {
      try {
        this.currentTrip = await pouchService.db.get(
          pouchService.userDBName,
          this.currentTripState._id
        );
      } catch (err) {
        this.errorAlert('TripId not found in database');
      }
    } else {
      try {
        await pouchService.db
          .post(pouchService.userDBName, this.currentTrip)
          .then((response: any) => {
            this.currentTrip._id = response.id;
            this.currentTrip._rev = response.rev;
          });
      } catch (err) {
        this.errorAlert(
          'Trip ' + this.currentTrip.tripNum + ' was not added to the database'
        );
      }
    }
  }

  private handleError(errorMsg: string) {
    this.errorAlert(errorMsg);
  }

  private saveOnUpdate() {
    this.setCurrentTrip(this.currentTrip);
    this.saveTrip(this.currentTrip);
  }

  private goToHauls() {
    this.$router.push({ path: '/hauls/' });
  }

  private async getPorts(val: string, update: any, abort: any) {
    this.getLookupVals(val, update, abort, 'optecs_trawl/all_port_names');
  }

  private async getVesselNames(val: string, update: any, abort: any) {
    this.getLookupVals(val, update, abort, 'optecs_trawl/all_vessel_names');
  }

  private async getLookupVals(
    val: string,
    update: any,
    abort: any,
    lookupTable: string
  ) {
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
