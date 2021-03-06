<template>
  <span>
    <q-banner
      v-show="!!alert.message"
      rounded
      inline-actions
      class="bg-red text-white"
    >
      {{ alert.message }}
      <template v-slot:action>
        <q-btn
          flat
          label="Dismiss"
          @click="clearAlert"
        />
      </template>
    </q-banner>
    <q-page :class="{ pushUp: lowInput }">
      <boatnet-tab-panel :size="2">
        <template v-slot:title1>
          <div class="text-h5 test-flexbox-row justify-center">Trip #{{ tripNum }} Start</div>
        </template>
        <template v-slot:content1>
          <div class="q-col-gutter-md row">
            <div
              class="col q-col-gutter-md"
              @click="getPos"
            >
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
                keyboard-type="compact"
                :options="options"
                dense
                @filter="getVesselNames"
                @save="saveOnUpdate"
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.captainName"
                label="Skipper's Name"
                keyboard-type="normal"
                dense
                @save="saveOnUpdate"
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.crewSize"
                label="# of Crew"
                keyboard-type="numeric"
                dense
                @save="saveOnUpdate"
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.logbookNum"
                label="Observer Logbook #"
                keyboard-type="numeric"
                dense
                @save="saveOnUpdate"
              />

            </div>

            <div class="col q-col-gutter-md">
              <boatnet-datetime
                date-label="Departure Date"
                time-label="Departure Time"
                :value.sync="currentTrip.departureDate"
                @save="saveOnUpdate"
                @error="handleError"
              />
              <boatnet-keyboard-select
                :value.sync="currentTrip.departurePort.name"
                label="Departure Port"
                keyboard-type="normal"
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
          <div class="text-h5 test-flexbox-row justify-center">Trip #{{ tripNum }} End</div>
        </template>
        <template v-slot:content2>
          <div class="q-col-gutter-md row">
            <div class="col q-col-gutter-md">

              <div class="row">

                <div class="col">
                  <div class="text-h8 col-3">Partial Trip</div>
                  <q-btn-toggle
                    v-model="currentTrip.isPartialTrip"
                    class="col-auto"
                    toggle-color="primary"
                    :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
                  />
                </div>

                <div class="col">
                  <div class="text-h8 col-3">Fish Processed During Trip</div>
                  <q-btn-toggle
                    v-model="currentTrip.isFishProcessed"
                    class="col-auto"
                    toggle-color="primary"
                    :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
                  />
                </div>
              </div>

              <boatnet-keyboard-input
                :value.sync="currentTrip.logbookType"
                label="Vessel Logbook Name"
                keyboard-type="normal"
                @save="saveOnUpdate"
              />
              <boatnet-keyboard-input
                :value.sync="currentTrip.logbookNum"
                label="Vessel Logbook Page #"
                keyboard-type="numeric"
                @save="saveOnUpdate"
              />
              <boatnet-datetime
                date-label="Return Date"
                time-label="Return Time"
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
                  keyboard-type="normal"
                  :options="options"
                  @filter="getPorts"
                  @save="saveOnUpdate"
                />
                <boatnet-keyboard-input
                  :value.sync="firstReceiverName"
                  label="First Receiver"
                  keyboard-type="normal"
                  @save="saveOnUpdate"
                />
                <div class="text-h6 col-2">Fish Tickets</div>
                <boatnet-fish-tickets
                  :fish-tickets.sync="currentTrip.fishTickets"
                  @save="saveOnUpdate"
                />
              </div>
            </div>
          </div>
        </template>
      </boatnet-tab-panel>
      <div class="row q-gutter-sm fixed-bottom q-pa-md justify-end">
        <q-btn
          color="primary"
          icon="play_arrow"
          label="Go to Hauls"
          @click="goToHauls"
        />
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
import { AlertState } from '@boatnet/bn-common';
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
  @Action('save', { namespace: 'tripsState' })
  private saveTrip: any;
  @Getter('currentTrip', { namespace: 'tripsState' })
  private currentTripState!: WcgopTrip;
  @Action('setCurrentTrip', { namespace: 'tripsState' })
  private setCurrentTrip: any;

  private currentTrip: WcgopTrip = {
    tripNum: this.tripNum,
    type: 'wcgop-trip',
    vessel: { vesselName: '' },
    departurePort: { name: '', pacfinPortCode: '', pacfinPortGroupCode: '' },
    returnPort: { name: '', pacfinPortCode: '', pacfinPortGroupCode: '' }
  };

  private ph = ''; // TEMP

  private options: string[] = [];
  private lowInput = false;

  constructor() {
    super();
  }

  get firstReceiverName(): string | undefined {
    if (
      this.currentTrip.firstReceivers &&
      this.currentTrip.firstReceivers.length
    ) {
      return this.currentTrip.firstReceivers[0].name;
    } else {
      return undefined;
    }
  }

  get vesselReg(): string | undefined {
    if (this.currentTrip.vessel) {
      return this.currentTrip.vessel.coastGuardNumber
        ? this.currentTrip.vessel.coastGuardNumber
        : this.currentTrip.vessel.stateRegulationNumber;
    } else {
      return undefined;
    }
  }

  private getPos() {
    const position: any = event!.target!;
    if (position.getBoundingClientRect().bottom > 200) {
      this.lowInput = true;
    } else {
      this.lowInput = false;
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
        this.errorAlert('TripId not found in database: ' + err.message);
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
          'Trip ' + this.currentTrip.tripNum + ' was not added to the database: ' + err.message
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
          /* eslint-disable @typescript-eslint/camelcase */
          start_key: val.toLowerCase(),
          end_key: val.toLowerCase() + '{}',
          inclusive_end: true,
          /* eslint-enable @typescript-eslint/camelcase */
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
        /* eslint-disable @typescript-eslint/camelcase */
        start_key: 'f',
        end_key: 'x'
        /* eslint-enable @typescript-eslint/camelcase */
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

.pushUp {
  position: relative;
  bottom: 200px;
}
</style>
