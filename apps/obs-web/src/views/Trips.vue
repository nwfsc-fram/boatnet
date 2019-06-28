<template>
  <div class="q-pa-md q-gutter-md">

    <div class="centered-page-item" >
      <div v-if="vessel.activeVessel">
        <q-btn class="bg-primary text-white q-ma-md"  v-if="openTrips.length < 2" color="primary" @click="newTrip">New Trip</q-btn>
        <q-btn v-else color="blue-grey-2" class="q-ma-md" @click="alert = true">New Trip</q-btn>
      </div>
      <div v-else>
        <p>No active vessel, please set your active vessel in User Config.</p>
      </div>

      <q-select
      v-model="vessel.activeVessel"
      label="Set Active Vessel (staff role only)"
      dense
      stack-label
      use-input
      fill-input
      hide-selected
      @filter="vesselsFilterFn"
      :options="vessels"
      :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
      option-value="_id"
      ></q-select>

    </div>

  <div v-if="openTrips.length > 0" class="centered-page-item">Active Trips</div>
    <div class=" row items-start" >

      <q-card
      v-for="(trip, i) in openTrips"
      :key="i"
      style="margin: 10px"
      :class="computedTripClass(trip)"
      >
        <q-card-section>
          <div class="text-h6">
            <span v-if="trip.fishery">{{ trip.fishery.name }}</span>
            <div v-if="trip.isSelected" class="text-white" style="font-size: 32px; float: right" title="Trip is Selected">
            <q-icon name="check_circle" size="18px"></q-icon>
            <span class="text-h6">&nbsp;Trip Selected</span>
            </div>
          </div>
          <span v-if="trip.departureDate">{{ formatDate(trip.departureDate) }}</span> -
          <span v-if="trip.returnDate">{{ formatDate(trip.returnDate) }}</span>
          <div v-if="trip.observer">
            <sup class="text-white" style="float: right; text-align: right">
              observer: {{ trip.observer.firstName }} {{ trip.observer.lastName }}<br>
              mobile: {{ formatTel(trip.observer.cellPhone) }}
              </sup>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat @click="getTripDetails(trip)">Edit</q-btn>
          <q-btn flat @click="closeConfirm(trip)">Close</q-btn>
          <q-btn flat @click="cancelTrip(trip)">Cancel</q-btn>
        </q-card-actions>
    </q-card>
    </div>

    <div v-if="closedTrips.length > 0" class="centered-page-item">Closed Trips</div>
    <div class=" row items-start">

    <q-card v-for="(trip, i) in closedTrips" :key="i" class="my-card bg-blue-grey-4 text-white" style="margin: 10px">

      <q-card-section>
        <div class="text-h6">
          <span v-if="trip.fishery">{{ trip.fishery.name }}</span>
            <div v-if="trip.isSelected" class="text-white" style="font-size: 32px; float: right" title="Trip is Selected">
            <q-icon name="check_circle" size="18px"></q-icon>
            <span class="text-h6">&nbsp;Trip Selected</span>
            </div>
        </div>
          <span v-if="trip.departureDate">{{ formatDate(trip.departureDate) }}</span> -
          <span v-if="trip.returnDate">{{ formatDate(trip.returnDate) }}</span>
      <div class="text-white">
          <span style="text-transform: capitalize;" v-if="trip.closingReason">{{ trip.closingReason }}</span>
          <span v-if="trip.captainAffirmedDepartureDate && trip.captainAffirmedReturnDate"> - {{ formatDate(trip.captainAffirmedDepartureDate) }} - {{ formatDate(trip.captainAffirmedReturnDate) }} </span>
      </div>
      </q-card-section>
      <q-card-actions style="float:right">
        <q-btn flat @click="review(trip)">review</q-btn>
      </q-card-actions>

    </q-card>
  </div>

    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Only 2 active trips are permitted.  Please close a trip.</div>
          <q-btn color="primary" size="md" style="float: right" @click="alert = false">OK</q-btn>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="cancelAlert">
      <q-card>
        <q-card-section>
          <p>Are you sure?  A trip can not be un-cancelled. <br>(You may need to create it again)</p>
          <div style="float: right">
            <q-btn color="red" size="md" @click="cancelActiveTrip">yes, cancel trip</q-btn>
            &nbsp;
            <q-btn color="primary" size="md" @click="cancelAlert = false">no, keep trip</q-btn>
          </div>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="closeAlert">
      <q-card>
        <q-card-section>
          <div class=" q-pa-md">
            <strong>I affirm this trip was taken.</strong>
            <q-toggle
            v-model="taken"
            checked-icon="check"
            unchecked-icon="clear"
            color="green"
            />
          </div>

          <q-list>
          <div class="row items-start" v-if="activeTrip">
            <q-item>
              <q-item-section>
                <div>
                  <div class="text-subtitle2"> Affirmed Departure Date</div>
                  <q-date v-model="activeTrip.captainAffirmedDepartureDate" color="green" dark></q-date>
                </div>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <div>
                  <div class="text-subtitle2"> Affirmed Return Date</div>
                  <q-date v-model="activeTrip.captainAffirmedReturnDate" color="red" dark></q-date>
                </div>
              </q-item-section>
            </q-item>
          </div>
        </q-list>
        <br>
        <q-card-actions style="float: right"  class="text-primary">
          <q-btn color="primary" size="md" @click="closeAlert = false">cancel</q-btn>
            <q-btn color="red" size="md" @click="closeActiveTrip" :disabled="!taken">close trip</q-btn>
        </q-card-actions>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TripState, VesselState, UserState, WcgopAppState } from '../_store/types/types';

import moment from 'moment';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

import {
  WcgopTrip,
  WcgopTripTypeName,
  Port,
  PortTypeName,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  Vessel,
  VesselTypeName
} from '@boatnet/bn-models';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

@Component({
  pouch: {
    userTrips() { // Also declared in class
      return {
        database: pouchService.userDBName,
        selector: { type: 'wcgop-trip' },
        sort: [{ tripNum: 'desc' }]
        // limit: 5 // this.resultsPerPage,
      };
    }
  }
})
export default class Trips extends Vue {
  @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('appState') private appState!: WcgopAppState;
    @State('pouchState') private pouchState!: PouchDBState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

  private userTrips!: any;
  private vessels = [];
  private alert = false;
  private cancelAlert = false;
  private closeAlert = false;
  private activeTrip: any = null;
  private taken: boolean = false;

  constructor() {
      super();
  }

  public get userDBTrips() {
    // TODO: This seems to block the UI - handle asyn
    // console.log('Called userDBTrips');
    if (this.userTrips) {
      return this.userTrips;
    } else {
      return [];
    }
  }
  private get currentReadonlyDB(): string {
    if (!this.pouchState.credentials) {
      console.warn('WARNING: current RO db is undefined');
      return '';
    } else {
      return this.pouchState.credentials.dbInfo.lookupsDB;
    }
  }

  private get currentUserDB(): string {
    if (!this.pouchState.credentials) {
      console.warn('WARNING: current User db is undefined');
      return '';
    } else {
      return this.pouchState.credentials.dbInfo.userDB;
    }
  }

  private get lookupsDB() {
    // @ts-ignore
    return this[this.selectedDBName];
  }

    private get openTrips() {
      if (this.vessel.activeVessel) {
        return this.userDBTrips.filter(
          (trip: any) => {
            if (trip.vessel && trip.tripStatus && this.vessel.activeVessel) {
              const tripVesselReg = trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber;
              const activeVesselReg = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;
              return trip.tripStatus.description === 'open' &&
              tripVesselReg === activeVesselReg;
            } else {
              return [];
            }
            }
          );
      } else {
        return [];
      }
    }

    private get closedTrips() {
      if (this.vessel.activeVessel) {
        return this.userDBTrips.filter(
          (trip: any) => {
            if (trip.vessel && trip.tripStatus && this.vessel.activeVessel) {
              const tripVesselReg = trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber;
              const activeVesselReg = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;
              return trip.tripStatus.description !== 'open' &&
              tripVesselReg === activeVesselReg;
            } else {
              return [];
            }
          }
        );
      } else {
        return [];
      }
    }

    private vesselsFilterFn(val: string, update: any, abort: any) {
    update(
        async () => {
            try {
                const db = pouchService.db;
                const queryOptions = {
                limit: 5,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false,
                include_docs: true
                };

                const vessels = await db.query(
                    pouchService.lookupsDBName,
                    'optecs_trawl/all_vessel_names',
                    queryOptions
                    );
                this.vessels = vessels.rows.map((row: any) => row.doc);
            } catch (err) {
                this.error(err);
            }
        }
    );
    }




    // private get trips() {
    //     return this.$store.getters.trips;
    // }

    // private set trips(value) {
    //     this.$store.dispatch('updateTrips', value);
    // }

    // private get openTrips() {
    //   return this.$store.getters.openTrips;
    // }

    // private set openTrips(value) {
    //   this.$store.dispatch('updateTrips', value);
    // }

    // private get closedTrips() {
    //   return this.$store.getters.closedTrips;
    // }

    // private set closedTrips(value) {
    //   this.$store.dispatch('updateTrips', value);
    // }

    private created() {
      // this.$store.dispatch('updateActiveTrip', '');
    }

    private closeTrip(trip: any) {
      trip.tripStatus.description = 'closed';
      pouchService.db.put(pouchService.userDBName, trip);
      }

    // private reOpenTrip(trip: any) {
    //     if (this.openTrips.length < 2) {
    //       trip.tripStatus.description = 'open';
    //       pouchService.db.put(pouchService.userDBName, trip);
    //     } else {
    //       this.alert = true;
    //     }
    //   }

    private cancelTrip(trip: any) {
      this.activeTrip = trip;
      this.cancelAlert = true;
    }

    private closeConfirm(trip: any) {
      this.activeTrip = trip;
      Vue.set(this.activeTrip, 'captainAffirmedDepartureDate', trip.departureDate);
      Vue.set(this.activeTrip, 'captainAffirmedReturnDate', trip.returnDate);
      this.closeAlert = true;
    }

    private cancelActiveTrip() {
      this.activeTrip!.closingReason = 'cancelled';
      this.closeTrip(this.activeTrip);
      this.cancelAlert = false;
      this.closeAlert = false;
    }

    private closeActiveTrip() {
      this.activeTrip!.closingReason = 'taken';
      this.closeTrip(this.activeTrip);
      this.cancelAlert = false;
      this.closeAlert = false;
    }

    private review(trip: any) {
      this.trip.activeTrip = trip;
      this.trip.newTrip = false;
      this.trip.readOnly = true;
      console.log(this.trip.activeTrip);
      this.$router.push({path: '/trips/' + trip.tripNum});
    }

    private getTripDetails(trip: any) {
        // this.$store.dispatch('updateActiveTrip', trip);
        // this.$store.state.activeTrip = this.trips[i];
        this.trip.activeTrip = trip;
        this.trip.newTrip = false;
        this.trip.readOnly = false;
        console.log(this.trip.activeTrip);
        this.$router.push({path: '/trips/' + trip.tripNum});
      }

    private newTrip() {
      let newTripNum = 1;

      try {
        newTripNum = this.userDBTrips[0].tripNum + 1;

      } catch (err) {
        newTripNum = 1;
      }

      const newTrip: WcgopTrip = {
                            createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
                            createdDate: moment().format(),
                            type: 'wcgop-trip',
                            vessel: this.vessel.activeVessel!,
                            // permits: [],
                            // messages: [],
                            departureDate: moment().format(),
                            departurePort: this.user.activeUser!.port ? this.user.activeUser!.port : this.vessel.activeVessel!.homePort ? this.vessel.activeVessel!.homePort : {name: 'UNDEFINED'},
                            returnDate: moment().format(),
                            returnPort: {name: 'SAME AS START'},
                            isSelected: false,
                            fishery: {name: 'unknown'},
                            tripStatus: {
                              description: 'open'
                            }
                            };
      this.trip.activeTrip = newTrip;

      this.trip.newTrip = true;
      this.trip.readOnly = false;
      this.$router.push({path: '/trips/' + newTripNum});
      }

  private formatDate(date: any) {
    return moment(date).format('MMM Do');
  }

  private formatTel(telNum: any) {
    telNum = telNum.toString();
    return '(' + telNum.substring(0, 3) + ') ' + telNum.substring(3, 6) + '-' + telNum.substring(6, 10);
}

private computedTripClass(trip: WcgopTrip) {
  if (trip.isSelected) {
    return 'my-card bg-green text-white';
  } else {
    return 'my-card bg-primary text-white';
  }
}

}
</script>

<!--
<script>

import Vue from 'vue';
import TripDetails from './TripDetails.vue';

export default{
    data() {
      return {
        alert: false
      }
    },
    computed: {
        trips: {
          get() {
              return this.$store.getters.trips
          },
          set(value) {
              this.$store.dispatch('updateTrips', value)
          }
        },
        openTrips: {
          get() {
            return this.$store.getters.openTrips
          },
          set(value) {
            this.$store.dispatch('updateTrips', value)
          }
        },
        closedTrips: {
          get() {
            return this.$store.getters.closedTrips
          },
          set(value) {
              this.$store.dispatch('updateTrips', value)
          }
        }
    },
    created() {
      this.$store.dispatch('updateActiveTrip', '')
      console.log(this.$store.getters.trips)
    },
    methods: {
      closeTrip(trip) {
        trip.is_open = false;
      },
      reOpenTrip(trip) {
        if (this.openTrips.length < 2) {
          trip.is_open = true;
        } else {
          this.alert = true;
        }
      },
      getTripDetails(trip) {
        this.$store.dispatch('updateActiveTrip', trip)
        // this.$store.state.activeTrip = this.trips[i]
        this.$router.push({path: '/trips/'+ trip.trip_num})
      },
      newTrip() {
        const newTripNum = this.$store.state.trips.length + 1
        this.$store.state.trips.push({type: 'trip', trip_num: newTripNum, vessel: this.$store.state.activeVessel, permits: [], messages: [], start_port: this.$store.state.activeUser.homeport, end_port: 'same as start'})
        this.$store.dispatch('updateActiveTrip', this.$store.state.trips[this.$store.state.trips.length -1])
        console.log(this.$store.state.activeTrip)
        this.$router.push({path: '/trips/' + newTripNum})
      }
    }
};
</script>
-->

<style lang="stylus" scoped>
  .my-card
    width 100%
    max-width 450px
</style>


