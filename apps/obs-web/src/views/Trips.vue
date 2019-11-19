<template>
  <div class="q-pa-md q-gutter-md">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>

    <div class="centered-page-item" >
      <div v-if="vessel.activeVessel">
        <q-btn class="bg-primary text-white q-ma-md"  v-if="openTrips.length < 2" color="primary" @click="newTrip">New Trip</q-btn>
        <q-btn v-else color="blue-grey-2" class="q-ma-md" @click="maxTripsAlert = true">New Trip</q-btn>
      </div>
      <div v-else>
        <p>No active vessel, please set your active vessel in User Config.</p>
      </div>

      <q-select
      v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode"
      v-model="vessel.activeVessel"
      label="Set Active Vessel (staff only)"
      dense
   
      use-input
      fill-input
      hide-selected
      @filter="vesselsFilterFn"
      :options="vessels"
      :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
      option-value="_id"
      @click.native="selectText"
      ></q-select>

    </div>

  <div v-if="openTrips.length > 0" class="centered-page-item">Active Trips</div>
    <div class=" row items-start" >

      <q-card
      v-for="trip in openTrips"
      :key="openTrips.indexOf(trip)"
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
          <q-btn flat @click="getTripDetails(trip, openTrips.indexOf(trip))">Edit</q-btn>
          <q-btn v-if="openTrips.indexOf(trip) === 0" flat @click="closeConfirm(trip)">Close</q-btn>
          <q-btn flat @click="cancelTrip(trip)">Cancel</q-btn>
        </q-card-actions>
    </q-card>
    </div>

    <div v-if="closedTrips.length > 0" class="centered-page-item">Closed Trips</div>
    <div class=" row items-start">

    <q-card v-for="(trip, i) in closedTrips" :key="i" class="my-card bg-blue-grey-4 text-white trip-card">

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

    <q-dialog v-model="maxTripsAlert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Only 2 active trips are permitted.  Please close a trip.</div>
          <q-btn color="primary" size="md" style="float: right" @click="maxTripsAlert = false">OK</q-btn>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="tripNotStartedAlert">
      <q-card>
        <q-card-section>
          <div class="text-h6">A trip can not be closed before it is scheduled to start.  Did you mean cancel?</div>
          <q-btn color="primary" size="md" style="float: right" @click="tripNotStartedAlert = false">OK</q-btn>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="earliestTripAlert">
      <q-card>
        <q-card-section>
          <div class="text-h6">An earlier trip must be closed before this trip can be closed.</div>
          <q-btn color="primary" size="md" style="float: right" @click="earliestTripAlert = false">OK</q-btn>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="cancelAlert">
      <q-card>
        <q-card-section>
          <p>Are you sure?  A trip can not be un-cancelled. (You may need to create it again)
          <br><br>Note: Cancelled trip selection will be applied to the next trip in the same fishery.</p>
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
      <div style="background-color: white">
          <div style="padding-left: 20px">
            <br>
            <strong class="text-subtitle2">I affirm this trip was taken.</strong>
            <q-toggle
            v-model="taken"
            checked-icon="check"
            unchecked-icon="clear"
            color="green"
            />
          </div>


            <pCalendar
              v-model="tripDates"
              :inline="true"
              :maxDate="maxDate"
              selectionMode="range"
              onfocus="blur();"
              style="padding: 5px">
            </pCalendar>

        <br>
        <div style="padding: 10px" class="text-primary float-right">
          <q-btn color="primary" size="md" @click="closeAlert = false">cancel</q-btn>
          &nbsp;
          <q-btn color="red" size="md" @click="closeActiveTrip" :disabled="!taken">close trip</q-btn>
        </div>
          <br><br>
      </div>
    </q-dialog>

  </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TripState, VesselState, UserState, WcgopAppState, AlertState } from '../_store/types/types';

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
  VesselTypeName,
  TripSelection
} from '@boatnet/bn-models';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

@Component
// ({
//   pouch: {
//     userTrips() { // Also declared in class
//       return {
//         database: pouchService.userDBName,
//         selector: { type: 'wcgop-trip' },
//         sort: [{ tripNum: 'desc' }]
//         // limit: 5 // this.resultsPerPage,
//       };
//     }
//   }
// })
export default class Trips extends Vue {
  @State('trip') private trip!: TripState;
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;
  @State('appState') private appState!: WcgopAppState;
  @State('pouchState') private pouchState!: PouchDBState;

  @State('alert') private alert!: AlertState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;

  private userTrips: any = [];
  private vessels = [];
  private maxTripsAlert = false;
  private cancelAlert = false;
  private closeAlert = false;
  private activeTrip: any = null;
  private taken: boolean = false;
  private userRoles: string[] = [];
  private tripNotStartedAlert: boolean = false;
  private earliestTripAlert: boolean = false;

  private existingTripStart: string = '0';
  private existingTripEnd: string = '0';
  private startYearMonth: string = moment().format('YYYY/MM');
  private endYearMonth: string = moment().format('YYYY/MM');
  private tripDates: any = [];
  private minDate: any = new Date();
  private maxDate = new Date();

  constructor() {
      super();
  }

  // public get userDBTrips() {
  //   // TODO: This seems to block the UI - handle asyn
  //   // console.log('Called userDBTrips');
  //   if (this.userTrips) {
  //     return this.userTrips;
  //   } else {
  //     return [];
  //   }
  // }
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
        console.log(this.vessel.activeVessel);
        return this.userTrips
        .filter(
          (trip: any) => {
            if (trip.vessel && trip.tripStatus && this.vessel.activeVessel) {

              const tripVesselReg = trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber;
              const activeVesselReg = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;
              return trip.tripStatus.description === 'open'
              &&
              tripVesselReg === activeVesselReg;
              }
            })
            .sort((a: any, b: any) => {
            const keyA = moment(a.departureDate);
            const keyB = moment(b.returnDate);
            if (keyA < keyB) {
              return -1;
            }
            if (keyA > keyB) {
              return 1;
            }
            return 0;
            });
      } else {
        return [];
      }
    }

    private get closedTrips() {
      if (this.vessel.activeVessel) {
        return this.userTrips.filter(
          (trip: any) => {
            if (trip.vessel && trip.tripStatus && this.vessel.activeVessel) {

              const tripVesselReg = trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber;
              const activeVesselReg = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;
              return trip.tripStatus.description !== 'open' &&
              tripVesselReg === activeVesselReg;
            }
          }
        ).sort((a: any, b: any) => {
            const keyA = moment(a.departureDate);
            const keyB = moment(b.returnDate);
            if (keyA < keyB) {
              return -1;
            }
            if (keyA > keyB) {
              return 1;
            }
            return 0;
          });
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
                // limit: 5,
                start_key: val.toLowerCase(),
                end_key: val.toLowerCase() + '\u9999' ,
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
                console.log(err);
            }

          }
    );
    }

    private selectText(event: any) {
      event.target.select();
    }

    private isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (this.userRoles.includes(role)) {
          return true;
        }
      }
      return false;
    }

    private closeTrip(trip: any) {
      trip.tripStatus.description = 'closed';
      pouchService.db.post(pouchService.userDBName, trip);
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
      if (!moment(trip.departureDate).isSameOrBefore(moment(), 'day')) { // trip hasn't started yet.
        // Dialog - warn trip must have started to be closed. did you mean cancel?
        this.tripNotStartedAlert = true;
        return;
      }

      for (const openTrip of this.openTrips) {
        if (openTrip._id !== trip._id && moment(openTrip.departureDate).isBefore(trip.departureDate, 'day')) {
          // if there is another open trip, see if its departure date is earlier than trip departure date
          // Dialog - warn earliest trip must be closed first
          this.earliestTripAlert = true;
          return;
        }
      }

      this.activeTrip = trip;
      Vue.set(this.activeTrip, 'captainAffirmedDepartureDate', new Date(trip.departureDate));
      Vue.set(this.activeTrip, 'captainAffirmedReturnDate', new Date(trip.returnDate));
      this.closeAlert = true;
      console.log(this.activeTrip.captainAffirmedDepartureDate);
      this.tripDates[0] = this.activeTrip.captainAffirmedDepartureDate;
      this.tripDates[1] = this.activeTrip.captainAffirmedReturnDate;
    }

    private async cancelActiveTrip() {
      this.activeTrip!.closingReason = 'cancelled';
      let savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
        };

      // check to see if savedSelections exists, fetch it if it does.
      const db = pouchService.db;
      const docs = await db.allDocs(pouchService.userDBName);

      for (const row of docs.rows) {
        if (row.doc.type === 'saved-selections') {
          savedSelections = row.doc;
          savedSelections.updatedBy = authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined;
          savedSelections.updatedDate = moment().format();
        }
      }

      if (!savedSelections[this.activeTrip.fishery.name]) {
        savedSelections[this.activeTrip.fishery.name] = [];
      }

      if (this.openTrips.indexOf(this.activeTrip) === 0 && this.openTrips.length > 1) {
        savedSelections[this.activeTrip.fishery.name].push({
                              vesselName: this.activeTrip.vessel.vesselName,
                              isSelected: this.openTrips[1].isSelected,
                              notes: this.openTrips[1].notes,
                              selectionDate: this.openTrips[1].createdDate
                            });
        this.openTrips[1].isSelected = this.activeTrip.isSelected;
        pouchService.db.post(pouchService.userDBName, this.openTrips[1]);
      } else {
        savedSelections[this.activeTrip.fishery.name].push({
                              vesselName: this.activeTrip.vessel.vesselName,
                              isSelected: this.activeTrip.isSelected,
                              notes: this.activeTrip.notes,
                              selectionDate: this.activeTrip.createdDate
                            });
      }

      pouchService.db.post(pouchService.userDBName, savedSelections);

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

    private getTripDetails(trip: any, index = null) {
        // this.$store.dispatch('updateActiveTrip', trip);
        // this.$store.state.activeTrip = this.trips[i];
        this.trip.activeTrip = trip;
        this.trip.newTrip = false;
        this.trip.readOnly = false;
        this.trip.index = index;
        this.$router.push({path: '/trips/' + trip.tripNum});
      }

    private newTrip() {
      let newTripNum = 1;

      try {
        for (const userTrip of this.userTrips) {
          if (userTrip.tripnum > newTripNum) {
            newTripNum = userTrip.tripNum + 1;
          }
        }
      } catch (err) {
        newTripNum = 1;
      }

      const newTrip: WcgopTrip = {
                            createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
                            createdDate: moment().format(),
                            type: 'wcgop-trip',
                            tripNum: newTripNum,
                            vessel: this.vessel.activeVessel!,
                            // permits: [],
                            // messages: [],
                            departureDate: '',
                            departurePort: this.user.activeUser!.port ? this.user.activeUser!.port : this.vessel.activeVessel!.homePort ? this.vessel.activeVessel!.homePort : {name: ''},
                            returnDate: '',
                            returnPort: {name: 'SAME AS START'},
                            isSelected: false,
                            fishery: {name: ''},
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
    return 'trip-card my-card bg-green text-white';
  } else {
    return 'trip-card my-card bg-primary text-white';
  }
}

private setActiveVessel() {
  if (!this.vessel.activeVessel) {
    if (this.user.activeUser &&  this.user.activeUser.activeVessel) {
      this.vessel.activeVessel = this.user.activeUser.activeVessel;
    }
  }
}

// @Watch('departureDate')
// private handler1(newVal: string, oldVal: string) {
//   this.endYearMonth = moment(newVal).format('YYYY/MM');
//   if (moment(newVal) < moment(this.existingTripStart) || moment(newVal) > moment(this.returnDate) ) {
//     this.returnDate = newVal;
//   }
//   console.log(this.returnDate);
//   if (this.returnDate === 'Invalid date') {
//     Vue.set(this, 'returnDate', newVal);
//     }
// }

@Watch('vessel.activeVessel')
private handler3(newVal: string, oldVal: string) {
  this.getUserTrips();
}

@Watch('tripDates')
private handler2(newVal: string, oldVal: string) {
  if (newVal[0]) {
    this.activeTrip!.captainAffirmedDepartureDate = JSON.parse(JSON.stringify(newVal[0]));
  }
  if (newVal[1]) {
    this.activeTrip!.captainAffirmedReturnDate = JSON.parse(JSON.stringify(newVal[1]));
  }
}

private async getUserTrips() {
    const db = pouchService.db;
    const docs = await db.allDocs(pouchService.userDBName);
    const rows = docs.rows;

    this.userTrips = rows.filter( (row: any) => row.doc.type === 'wcgop-trip' );
    this.userTrips = this.userTrips.map( (trip: any) => trip.doc);
    console.log(this.userTrips);
}

private created() {
  this.setActiveVessel();
  this.getUserTrips();
  if ( authService.getCurrentUser() ) {
    this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
  }
}

}
</script>

<style lang="stylus">
  .my-card
    width 100%
    max-width 450px

  .left-pad
    padding-left: 10px

  .q-date--portrait-standard
    width: auto !important
    margin: 10px

  .p-datepicker
    border: none !important

</style>


