<template>
  <div class="q-pa-md">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>

    <q-spinner
      v-if="loading"
      color="primary"
      size="3em"
      style="position: absolute; top: 50%; left: 50%"
    >
    </q-spinner>

    <div class="centered-page-item" id="main">
      <div v-if="vessel.activeVessel">
        <q-btn class="bg-primary text-white q-ma-md"  v-if="openTrips.length < 2 && !loading" color="primary" @click="newTrip">New Trip</q-btn>
        <q-btn v-else color="blue-grey-2" class="q-ma-md" @click="maxTripsAlert = true">New Trip</q-btn>
      </div>
      <div v-else>
        <p>No active vessel</p>
      </div>

      <q-select
      v-model="vessel.activeVessel"
      label="Vessel"
      dense
      fill-input
      :options="authorizedVessels"
      :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
      option-value="_id"
      ></q-select>

      <q-select
      v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode"
      v-model="vessel.activeVessel"
      label="Staff - Select ANY vessel"
      dense
      use-input
      fill-input
      hide-selected
      @filter="vesselsFilterFn"
      :options="vessels"
      :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
      option-value="_id"
      @click.native="vessel.activeVessel = undefined"
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
          <div  class="text-h6" style="font-size: 14px; line-height: 4px; margin-bottom: 10px">
            <span>
              <span v-if="trip.departureDate">{{ formatDate(trip.departureDate) }}</span> -
              <span v-if="trip.returnDate">{{ formatDate(trip.returnDate) }}</span>
            </span>
            <span style="float: right" v-if="trip.tripNum"><br>Trip #: {{ trip.tripNum }}</span>
          </div>

          <div class="text-h6">
            <span v-if="trip.fishery">{{ trip.fishery.description }}</span>
            <div v-if="trip.isSelected" class="text-white" style="font-size: 12px; line-height: 20px" title="Trip Is Selected">
              <q-icon name="warning" size="20px"></q-icon>
              <span class="text-h6">&nbsp;Observer Required</span>
            </div>
            <div v-else class="text-white" style="font-size: 12px; line-height: 20px" title="Observer Not Required">
              <q-icon name="not_interested" size="20px"></q-icon>
              <span class="text-h6">&nbsp;Observer Not Required</span>
            </div>
          </div>
          <div v-if="trip.observer">
            <sup class="text-white" style="float: right; text-align: right">
              observer: {{ trip.observer.firstName }} {{ trip.observer.lastName }}<br>
              mobile: {{ formatTel(trip.observer.cellPhone) }}
              </sup>
          </div>
        </q-card-section>
        <div style="float: right">
            <q-btn flat @click="cancelTrip(trip)">Cancel</q-btn>
            <q-btn v-if="openTrips.indexOf(trip) === 0" flat @click="closeConfirm(trip)">Close</q-btn>
            <q-btn flat @click="getTripDetails(trip, openTrips.indexOf(trip))">Edit</q-btn>
        </div>
    </q-card>
    </div>

    <div v-if="nextSelections.length > 0" class="centered-page-item">Next Trip Selections</div>
          <div class="display: flex">
            <q-card
              v-for="selection in nextSelections"
              :key="nextSelections.indexOf(selection)"
              :class="computedSelectionClass(selection)"
            >
            <q-card-section>

              <div class="text-h6">
                <span>
                  {{ selection.fishery }}
                </span>
              </div>
                <div class="text-h6 text-white" style="font-size: 12px; line-height: 20px">
                  <q-icon :name="selection.isSelected ? 'warning' : 'not_interested'" size="20px"></q-icon>
                  <span  class="text-h6" >&nbsp;{{ selection.isSelected ? 'Observer Required' : 'Observer Not Required'}}</span>
                </div>
            </q-card-section>
            </q-card>
          </div>


    <div v-if="closedTrips.length > 0" class="centered-page-item">Closed Trips

    <q-toggle
      style="margin-left: 10px"
      v-model="closedTripsTable"
      checked-icon="check"
      unchecked-icon="clear"
      color="primary"
      left-label
      label="view as table"
    />
    </div>
    <div class="row items-start" v-if="!closedTripsTable">

    <q-card v-for="(trip, i) in closedTrips" :key="i" class="my-card bg-blue-grey-4 text-white trip-card">

      <q-card-section>
          <div class="text-h6" style="font-size: 14px; line-height: 4px; margin-bottom: 10px">
            <span>
              <span v-if="trip.departureDate">{{ formatDate(trip.departureDate) }}</span> -
              <span v-if="trip.returnDate">{{ formatDate(trip.returnDate) }}</span>
            </span>
            <span style="float: right" v-if="trip.tripNum"><br>Trip #: {{ trip.tripNum }}</span>
          </div>
        <div class="text-h6">
          <span v-if="trip.fishery">{{ trip.fishery.description }}</span>
            <div v-if="trip.isSelected" class="text-white" style="font-size: 32px; float: right" title="Observer Required">
            <q-icon name="warning" size="20px"></q-icon>
            <span class="text-h6">&nbsp;Observer Required</span>
            </div>
            <div v-else class="text-white" style="font-size: 32px; float: right" title="Observer Not Required">
            <q-icon name="not_interested" size="20px"></q-icon>
            <span class="text-h6">&nbsp;Observer Not Required</span>
            </div>
        </div>

      <div class="text-white">
          <span style="text-transform: capitalize;" v-if="trip.closingReason">{{ trip.closingReason }}</span>
          <span v-if="trip.captainAffirmedDepartureDate && trip.captainAffirmedReturnDate"> - {{ formatDate(trip.captainAffirmedDepartureDate) }} - {{ formatDate(trip.captainAffirmedReturnDate) }} </span>
      </div>
      </q-card-section>
      <div style="float:right">
        <q-btn flat @click="review(trip)">review</q-btn>
      </div>

    </q-card>
  </div>
  <div v-else>

    <q-table
      :data="closedTrips"
      :columns="columns"
      :pagination.sync="pagination"
      row-key="_id"
      dense
      binary-state-sort
      hide-bottom
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="tripNum" :props="props">{{ ![0,1].includes(props.row.tripNum) ? props.row.tripNum : '' }}</q-td>
          <q-td key="departureDate" :props="props">{{ formatDateTime(props.row.departureDate) }}</q-td>
          <q-td key="returnDate" :props="props">{{ formatFullDate(props.row.returnDate) }}</q-td>
          <q-td key="departurePort" :props="props">{{ props.row.departurePort.name }}</q-td>
          <q-td key="returnPort" :props="props">{{ props.row.returnPort.name }}</q-td>
          <q-td key="fishery" :props="props">{{ props.row.fishery.description }}</q-td>
          <q-td key="isSelected" :props="props">{{ props.row.isSelected ? 'YES':'NO' }}</q-td>
        </q-tr>
      </template>
    </q-table>

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
          <div class="text-h6">A later trip must be canceled before this trip can be canceled.</div>
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

          <label v-if="!file" class="cameraButton shadow-2 bg-primary text-white">Capture Logbook Image
              <input @change="handleImage($event)" type="file" accept="image/*;capture=camera" capture>
          </label>

          <div v-if="file" style="padding-left: 5%; padding-top: 5%">
              <div class="text-h6">Logbook Capture</div>
              <img :src="fileUrl" style="width: 95%">
          </div>

          <label v-if="file" class="cameraButton shadow-2 bg-primary text-white">Re-Capture Logbook Image
              <input @change="handleImage($event)" type="file" accept="image/*;capture=camera" capture>
          </label>

          <div>
            <div class="text-h6" style="padding-left: 5%">Actual Trip Dates:</div>
            <pCalendar
              v-model="tripDates"
              :touchUI="true"
              :maxDate="maxDate"
              selectionMode="range"
              onfocus="blur();"
              style="padding-left: 5%">
            </pCalendar>
            <br><br><br><br>
          </div>
        <br>
        <div class="text-primary" style="padding-left: 5%">
          <q-btn color="primary" size="md" @click="closeAlert = false; file = null">cancel</q-btn>
          &nbsp;
          <q-btn color="red" size="md" @click="closeActiveTrip">close trip</q-btn>
          &nbsp;
          <q-spinner-radio v-if="transferring" color="red" size="3em"/>
          <br><br>
        </div>
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

import request from 'request';
import moment from 'moment';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';
import { AuthState, authService } from '@boatnet/bn-auth';

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

import { Notify } from 'quasar';

@Component
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
  private nextSelections: any = [];
  private authorizedVessels: Vessel[] = [];
  private tripsApiTrips: any[] = [];
  private closedTripsTable: boolean = false;
  private file: any = null;
  private fileUrl: any = null;
  private transferring: boolean = false;
  private loading = false;

  private pagination = {
    sortBy: 'departureDate',
    descending: false,
    page: 1,
    rowsPerPage: 100,
    rowsNumber: 100
    };

  private columns = [
    {name: 'tripNum', label: 'Trip Number', field: 'tripNum', required: false, align: 'left', sortable: true},
    {name: 'departureDate', label: 'Departure Date / Time', field: 'departureDate', required: false, align: 'left', sortable: true},
    {name: 'returnDate', label: 'Return Date', field: 'returnDate', required: false, align: 'left', sortable: true},
    {name: 'departurePort', label: 'Departure Port', field: 'departurePort', required: false, align: 'left', sortable: true},
    {name: 'returnPort', label: 'Return Port', field: 'returnPort', required: false, align: 'left', sortable: true},
    {name: 'fishery', label: 'Fishery', field: 'fishery', required: false, align: 'left', sortable: true},
    {name: 'isSelected', label: 'Selected', field: 'isSelected', required: false, align: 'right', sortable: true},
  ];

  constructor() {
      super();
  }

  private handleImage(event: any) {
      this.file = event!.target!.files[0];
      this.fileUrl = URL.createObjectURL(this.file);
      console.log(this.file);
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

    private async getNextSelections() {
      if (this.vessel.activeVessel) {

      const selectionSorter = (a: any, b: any) => {
        if (moment(a.selectionDate).isBefore(b.selectionDate, 'second')) {
          return -1;
        } else if (moment(a.selectionDate).isAfter(b.selectionDate, 'second')) {
          return -1;
        } else {
          return 0;
        }
      };

      this.nextSelections = [];
      let savedSelections: any = {};

      const vesselId = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;

      const masterDb: Client<any> = couchService.masterDB;
      const queryOptions = {
        include_docs: true,
        key: vesselId
      };

      const vesselSelections: any = await masterDb.view<any>(
        'obs_web',
        'saved_selections',
        queryOptions
      );

      if (vesselSelections.rows[0]) {
        savedSelections = vesselSelections.rows[0].doc;
      }

      if (savedSelections) {
        for (const fishery of Object.keys(savedSelections).sort(
          (a: any, b: any) => {
            if (a > b) {
              return 1;
            } else if (a < b) {
              return -1;
            } else {
              return 0;
            }
          })
        ) {
          if (Array.isArray(savedSelections[fishery])) {
            for (const selection of savedSelections[fishery].sort(
              (a: any, b: any) => {
                return selectionSorter(a, b);
              }
            )) {
              if (savedSelections[fishery].indexOf(selection) < 1) {
                const selectionObject = {
                  fishery,
                  isSelected: selection.isSelected,
                  selectionDate: selection.selectionDate
                  };
                this.nextSelections.push(selectionObject);
              }
            }
          }
        }
      }
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
                  'obs_web/all_vessel_names',
                    queryOptions,
                    pouchService.lookupsDBName
                    );
                this.vessels = vessels.rows.map((row: any) => row.doc);
            } catch (err) {
                console.log(err);
            }

          }
    );
    }

    private isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (this.userRoles.includes(role)) {
          return true;
        }
      }
      return false;
    }

    private async closeTrip(trip: any) {
      trip.tripStatus.description = 'closed';
      if (!trip.changelog) { trip.changeLog = []; }

      trip.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format('MM/DD/YYYY HH:MM A'),
          change: 'trip closed'
        }
      );
      console.log(trip);
      const masterDB: Client<any> = couchService.masterDB;
      this.transferring = true;
      return await masterDB.put(
        trip._id as string,
        trip,
        trip._rev as string
      ).then( () => {
        this.transferring = false;
      });
    }

    private cancelTrip(trip: any) {
      for (const openTrip of this.openTrips) {
        if (openTrip._id !== trip._id && moment(trip.departureDate).isBefore(openTrip.departureDate, 'day')) {
          // if there is another open trip, see if its departure date is earlier than trip departure date
          // Dialog - warn earliest trip must be closed first
          this.earliestTripAlert = true;
          return;
        }
      }
      this.activeTrip = trip;
      this.cancelAlert = true;
    }

    private closeConfirm(trip: any) {
      if (!moment(trip.departureDate).isSameOrBefore(moment(), 'day')) { // trip hasn't started yet.
        // Dialog - warn trip must have started to be closed. did you mean cancel?
        this.tripNotStartedAlert = true;
        return;
      }

      this.activeTrip = trip;
      if (moment(this.activeTrip.departureDate).isAfter(moment(), 'day')) {
        Vue.set(this.activeTrip, 'captainAffirmedDepartureDate', new Date(moment().format()));
      } else {
        Vue.set(this.activeTrip, 'captainAffirmedDepartureDate', new Date(this.activeTrip.departureDate));
      }
      if (moment(this.activeTrip.returnDate).isAfter(moment(), 'day')) {
        Vue.set(this.activeTrip, 'captainAffirmedReturnDate', new Date(moment().format()));
      } else {
        Vue.set(this.activeTrip, 'captainAffirmedReturnDate', new Date(this.activeTrip.returnDate));
      }

      this.closeAlert = true;
      this.tripDates[0] = this.activeTrip.captainAffirmedDepartureDate;
      this.tripDates[1] = this.activeTrip.captainAffirmedReturnDate;
    }

    private async saveSelection() {
      const savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
        };

      // check to see if savedSelections exists, fetch it if it does.
      const vesselId = this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber;
      const fisheryName: any = this.trip.activeTrip!.fishery!.description ? this.trip.activeTrip!.fishery!.description : 'fish';

      const masterDb: Client<any> = couchService.masterDB;
      const queryOptions = {
        include_docs: true,
        key: vesselId
      };

      let vesselSelections: any = await masterDb.view<any>(
              'obs_web',
              'saved_selections',
              queryOptions
            );

      if (vesselSelections.rows.length > 0) {
        vesselSelections = vesselSelections.rows[0].doc;
      } else {
        vesselSelections = savedSelections;
      }

      vesselSelections.vesselId = vesselId;
      vesselSelections.updatedBy = authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined;
      vesselSelections.updatedDate = moment().format();

      if (!vesselSelections[fisheryName]) {
        vesselSelections[fisheryName] = [];
      }

      if (this.openTrips.indexOf(this.activeTrip) === 0 && this.openTrips.length > 1) {
        vesselSelections[fisheryName].push({
                              isSelected: this.openTrips[1].isSelected,
                              notes: this.openTrips[1].notes,
                              selectionDate: this.openTrips[1].selectionDate ? this.openTrips[1].selectionDate : this.openTrips[1].createdDate
                            });
        this.openTrips[1].isSelected = this.activeTrip.isSelected;
        await masterDb.post(this.openTrips[1]);
      } else {
        vesselSelections[fisheryName].push({
                              isSelected: this.activeTrip.isSelected,
                              notes: this.activeTrip.notes,
                              selectionDate: this.activeTrip.selectionDate ? this.activeTrip.selectionDate : this.activeTrip.createdDate
                            });
      }

      await masterDb.post(vesselSelections);

    }

    private async cancelActiveTrip() {
      this.activeTrip!.closingReason = 'cancelled';
      this.saveSelection().then(
        async () => {
          await this.closeTrip(this.activeTrip);
          this.cancelAlert = false;
          this.closeAlert = false;
          await this.getNextSelections().then( () => {
            location.reload();
          });
        }
      );
    }

    private async closeActiveTrip() {
      if (this.file) {
        const fileName = this.file.name + ' - ' + authService.getCurrentUser()!.username + ' - ' + moment().format();
        let result: any;
        const reader = new FileReader();
        reader.readAsDataURL(this.file);
        reader.onload = async () => {
          result = reader.result;
          this.activeTrip._attachments = {
                    [fileName] : {
                        content_type: this.file.type,
                        data: result.split(',')[1]
                    }
                };

          this.activeTrip!.closingReason = 'taken';
          await this.closeTrip(this.activeTrip).then(
            async () => {
              this.cancelAlert = false;
              this.closeAlert = false;
              this.file = null;
              this.closeAlert = false;
              await this.getNextSelections().then( () => {
              location.reload();
              });
            }
          );
        };
      } else {
          this.activeTrip!.closingReason = 'taken';
          await this.closeTrip(this.activeTrip).then(
            async () => {
              this.cancelAlert = false;
              this.closeAlert = false;
              this.file = null;
              this.closeAlert = false;
              await this.getNextSelections().then( () => {
              location.reload();
              });
            }
          );
      }

    }

    private review(trip: any) {
      this.trip.activeTrip = trip;
      this.trip.newTrip = false;
      this.trip.readOnly = true;
      this.$router.push({path: '/trips/' + trip.tripNum});
    }

    private getTripDetails(trip: any, index = null) {
        this.trip.activeTrip = trip;
        this.trip.newTrip = false;
        this.trip.readOnly = false;
        this.trip.index = index;
        this.$router.push({path: '/trips/' + trip.tripNum});
      }

    private newTrip() {
      let newTripNum = 1;
      if (this.openTrips.length > 0) {
        this.trip.index = 1;
      } else {
        this.trip.index = 0;
      }

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
                            type: 'ots-trip',
                            tripNum: newTripNum,
                            vessel: this.vessel.activeVessel!,
                            // permits: [],
                            // messages: [],
                            departureDate: '',
                            departurePort: this.vessel.activeVessel.homePort ? this.vessel.activeVessel.homePort : '',
                            returnDate: '',
                            returnPort: {name: 'SAME AS START', pacfinPortCode: '', pacfinPortGroupCode: '' },
                            isSelected: false,
                            fishery: {description: ''},
                            tripStatus: {
                              description: 'open'
                            },
                            maximizedRetention: null,
                            changeLog: [
                              {
                                updatedBy: authService.getCurrentUser()!.username,
                                updateDate: moment().format('MM/DD/YYYY HH:MM A'),
                                change: 'trip created'
                              }
                            ]
                            };
      this.trip.activeTrip = newTrip;

      this.trip.newTrip = true;
      this.trip.readOnly = false;
      this.$router.push({path: '/trips/' + newTripNum});
      }

  private formatDate(date: any) {
    return moment(date).format('MMM Do');
  }

  private formatFullDate(date: any) {
    return moment(date).format('MM/DD/YYYY');
  }

  private formatDateTime(date: any) {
    return moment(date).format('MM/DD/YYYY, HH:MM');
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


private computedSelectionClass(selection: any) {
  if (selection.isSelected) {
    return 'my-card bg-green text-white';
  } else {
    return 'my-card bg-primary text-white';
  }
}



private async getUserTrips() {
    const db = pouchService.db;
    const docs = await db.allDocs();
    const rows = docs.rows;

    this.userTrips = rows.filter( (row: any) => row.doc.type === 'ots-trip' );
    this.userTrips = this.userTrips.map( (trip: any) => trip.doc);
}

private async getVesselTrips() {
  if (this.vessel.activeVessel) {
    this.loading = true;
    const vesselId = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;
    const masterDB: Client<any> = couchService.masterDB;
    const queryOptions: any = {
            include_docs: true,
            reduce: false,
            key: vesselId
          };

    try {
      const vesselTrips = await masterDB.view<any>(
              'obs_web',
              'ots_trips_by_vesselId',
              queryOptions
            );

      this.userTrips = vesselTrips.rows.map( (trip: any) => trip.doc );

    } catch (err) {
      console.log(err);
      Notify.create({
          message: 'Internet Connection Required',
              position: 'center',
              color: 'red',
              timeout: 2000,
              icon: 'warning',
              html: true,
              multiLine: true
          });
    }
    this.loading = false;
  }
}

private async getAuthorizedVessels() {
    const db = pouchService.db;
    const masterDB: Client<any> = couchService.masterDB;

    const queryOptions = {
        key: 'vessel-permissions',
        reduce: false,
        include_docs: true
    };

    const permissionsQuery: any = await masterDB.view<any>(
      'obs_web',
      'all_doc_types',
      queryOptions
    );

    const permissionsDoc = permissionsQuery.rows[0].doc;

    const vesselPermissions = [];

    for (const vessel of permissionsDoc.vesselAuthorizations) {
      for (const person of vessel.authorizedPeople) {
        if (person === this.user.activeUserAlias._id) {
          vesselPermissions.push(vessel.vesselIdNum);
        }
      }
    }

    for (const vesselId of vesselPermissions) {
      const vesselQueryOptions = {
        key: vesselId,
        reduce: false,
        include_docs: true
      };

      const vesselQuery = await db.query(
        'obs_web/all_vessel_nums',
        vesselQueryOptions,
        pouchService.lookupsDBName
      );

      this.authorizedVessels.unshift(vesselQuery.rows[0].doc);
    }

    this.authorizedVessels.sort( (a: any, b: any) => {
      if (a.vesselName > b.vesselName) {
        return 1;
      } else if (a.vesselName < b.vesselName) {
        return -1;
      } else {
        return 0;
      }
    });
}

  private async created() {
    // this.setActiveVessel();
    // this.getUserTrips();
    this.getAuthorizedVessels();
    this.getVesselTrips();
    if ( authService.getCurrentUser() ) {
      this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
    }
    this.getNextSelections();
  }

  @Watch('vessel.activeVessel')
  private async handler3(newVal: string, oldVal: string) {
    this.nextSelections = [];
    // this.getUserTrips();
    this.getVesselTrips();
    this.getNextSelections();
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

}
</script>

<style lang="stylus">

  .left-pad
    padding-left: 10px

  .q-date--portrait-standard
    width: auto !important
    margin: 10px

  .p-datepicker
    border: none !important

</style>

<style scoped>

label.cameraButton {
  display: inline-block;
  margin: 1em;
  padding: 0.5em;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}

label.cameraButton input[accept*="camera"] {
  display: none;
}

</style>


