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

        <div v-if="closedTrips.length > 0 && closedTrips.filter( (trip) => !trip._attachments && trip.closingReason !== 'cancelled').length > 0" style="background-color: #C62828; color: white; border-radius: 4px; padding: 10px; font-size: 14px">
          <span v-if="closedTrips.filter( (trip) => !trip._attachments && trip.closingReason !== 'cancelled').length === 1">
            WARNING: 1 closed trip is missing logbook image(s).  Please correct as soon as possible.
          </span>
          <span v-else>
            WARNING: {{ closedTrips.filter( (trip) => !trip._attachments && trip.closingReason !== 'cancelled').length }} closed trips are missing logbook image(s).  Please correct as soon as possible.
          </span>
        </div>

        <q-btn class="bg-primary text-white q-ma-xs" v-if="openTrips.length < 2 && !loading" color="primary" @click="newTrip">New Trip</q-btn>
        <q-btn v-else color="blue-grey-2" class="q-ma-xs" @click="maxTripsAlert = true">New Trip</q-btn>
        <q-btn class="bg-secondary text-white q-ma-md" color="grey-7" :to="'/log-trip'" label="log trip"></q-btn>
        <br>

        <q-btn
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode && userTrips.length > 0"
          @click="exportCsv"
          id="exportTrips"
          color="green-7"
        >
        Export Trips
        </q-btn>

      </div>
      <div v-else>
        <p>No active vessel</p>
      </div>

      <q-select
        v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode"
        v-model="vessel.activeVessel"
        label="Staff - Select ANY vessel"
        dense
        use-input
        fill-input
        hide-selected
        clearable
        debounce="500"
        @filter="vesselsFilterFn"
        :options="vessels"
        :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
        option-value="_id"
        @click.native="vessel.activeVessel = undefined"
      ></q-select>

      <q-select
        v-else
        v-model="vessel.activeVessel"
        label="Vessel"
        dense
        fill-input
        :options="authorizedVessels"
        :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
        option-value="_id"
      ></q-select>


    </div>

  <div v-if="openTrips.length > 0" class="centered-page-item">Active Trips</div>
    <div class="row items-start" >

      <q-card
      v-for="trip in openTrips"
      :key="openTrips.indexOf(trip)"
      :class="computedTripClass(trip)"
      >
        <q-card-section>
          <div  class="text-h6" style="font-size: 14px; line-height: 4px; margin-bottom: 10px">
            <span>
              <span v-if="trip.departureDate">{{ shortFormatDate(trip.departureDate) }} {{ formatDepartureTime(trip.departureDate) }} </span> -
              <span v-if="trip.returnDate">{{ shortFormatDate(trip.returnDate) }}</span>
            </span>
            <span style="float: right" v-if="trip.tripNum"><br>Trip #: {{ trip.tripNum }}</span>
          </div>

          <div class="text-h6">
            <span v-if="trip.fishery">{{ trip.fishery.description }}</span>
            <div v-if="trip.isSelected" class="text-white" style="font-size: 12px; line-height: 20px" title="Trip Is Selected">
              <q-icon name="person_add" size="20px"></q-icon>
              <span class="text-h6">&nbsp;Observer Required</span>
            </div>
            <div v-else class="text-white" style="font-size: 12px; line-height: 20px" title="Observer Not Required">
              <q-icon name="remove" size="20px"></q-icon>
              <span class="text-h6">&nbsp;Observer Not Required</span>
            </div>
          </div>
          <div v-if="trip.observer">
            <sup class="text-white" style="float: right; text-align: right">
              observer: {{ trip.observer.firstName }} {{ trip.observer.lastName }}<br>
              mobile: {{ formatTel(trip.observer.cellPhone) }}
              </sup>
          </div>
          <div v-if="trip.isWaived">
            Observer Coverage Waived
          </div>
          <div v-if="trip.maximizedRetention">MR</div>
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
                  <q-icon :name="selection.isSelected ? 'person_add' : 'remove'" size="20px"></q-icon>
                  <span  class="text-h6" >&nbsp;{{ selection.isSelected ? 'Observer Required' : 'Observer Not Required'}}</span>
                </div>
            </q-card-section>
            </q-card>
          </div>

    <div v-if="closedTrips.length > 0" class="centered-page-item">Closed Trips
      <q-btn :color="getBtnColor()" size="sm" @click="setTablePref()">{{ closedTripsTable ? 'View As Table' : 'View As Cards'}}</q-btn>

    </div>
    <div class="row items-start" v-if="closedTripsTable">

    <q-card v-for="(trip, i) in closedTrips" :key="i" :class="closedTripClass(trip)">

      <q-card-section>
          <div class="text-h6" style="font-size: 14px; line-height: 4px; margin-bottom: 10px">
            <span>
              <span v-if="trip.departureDate">{{ shortFormatDate(trip.departureDate) }} {{ formatDepartureTime(trip.departureDate) }}</span> -
              <span v-if="trip.returnDate">{{ shortFormatDate(trip.returnDate) }}</span>
            </span>
            <span style="float: right" v-if="trip.tripNum"><br>Trip #: {{ trip.tripNum }}</span>
          </div>
        <div class="text-h6">
          <span v-if="trip.fishery">{{ trip.fishery.description }}</span>
            <div v-if="trip.isSelected" class="text-white" style="font-size: 32px; float: right" title="Observer Required">
            <q-icon name="person_add" size="20px"></q-icon>
            <span class="text-h6">&nbsp;Observer Required</span>
            </div>
            <div v-else class="text-white" style="font-size: 32px; float: right" title="Observer Not Required">
            <q-icon name="remove" size="20px"></q-icon>
            <span class="text-h6">&nbsp;Observer Not Required</span>
            </div>
        </div>

      <div class="text-white">
          <span style="text-transform: capitalize;" v-if="trip.closingReason">{{ trip.closingReason }}</span>
          <span v-if="trip.captainAffirmedDepartureDate && trip.captainAffirmedReturnDate"> - {{ shortFormatDate(trip.captainAffirmedDepartureDate) }} - {{ shortFormatDate(trip.captainAffirmedReturnDate) }} </span>
      </div>
      </q-card-section>
      <div style="float: left; padding-left: 15px">
        <q-icon size="sm" v-if="trip._attachments" name="camera_alt" title="Has Logbook Image"></q-icon>
        <q-icon size="sm" v-else-if="!trip._attchments && trip.closingReason === 'taken'" name="error_outline" title="missing logbook capture"></q-icon>
      </div>
      <div style="float:right">
        <q-btn flat
          v-if="trip.closingReason !== 'cancelled' &&
          trip._attachments && isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) &&
          !user.captainMode"
          @click="keyLogbook(trip)"
        >
        Transcribe
        </q-btn>
        <q-btn flat @click="review(trip)">review</q-btn>
      </div>

    </q-card>
  </div>
  <div v-else>

    <q-table
      v-if="closedTrips.length > 0"
      :data="closedTrips"
      :columns="columns"
      :pagination.sync="pagination"
      :selected.sync="selected"
      row-key="_id"
      dense
      hide-bottom
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="actions" :props="props" v-if="props.row.closingReason !== 'cancelled'" style="cursor: pointer">
            <q-icon name="edit" color="primary" @click.native="review(props.row)" title="edit trip" style="font-weight: bold"></q-icon>
            &nbsp;
            <q-icon name="notes" color="primary" v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode && props.row._attachments" @click.native="keyLogbook(props.row)" title="key in logbook data" style="font-weight: bold"></q-icon>
          </q-td>
          <q-td v-else></q-td>
          <q-td key="_attachments" :props="props">
            <q-icon v-if="props.row._attachments" :color="getColor(props.row._attachments)" :name="hasAttachments(props.row)" title="Has Logbook Image" style="font-weight: bold"></q-icon>
            <q-icon v-if="!props.row._attachments && (props.row.closingReason !== 'cancelled')" :color="getColor(props.row._attachments)" :name="hasAttachments(props.row)" title="Logbook Image Missing" style="font-weight: bold"></q-icon>
          </q-td>
          <q-td key="tripNum" :props="props">{{ ![0,1].includes(props.row.tripNum) ? props.row.tripNum : '' }}</q-td>
          <q-td key="tripStatus" :props="props">{{ props.row.closingReason }}</q-td>
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
      <div style="text-align: center; background-color: white; height: 100%; width: 100%">
        <div style="padding: 3% 3% 9% 3%">
          <div style="float: left">
            <q-icon color="secondary" name="close" size="md" @click="clearValues" ></q-icon>
          </div>
          <div style="float: right">
            <q-btn v-if="activeTrip" color="red" size="md" @click="closeActiveTrip" title="confirm departure and return dates to close trip" >close trip</q-btn>
            &nbsp;
            <q-spinner-radio v-if="transferring" color="red" size="3em"/>
          </div>
          <br>
        </div>

          <file-uploader
            label="Logbook Capture"
            :trip="trip.activeTrip"
            submitAction="Add Image(s)"
          />

          <div v-if="trip.activeTrip">
            <div class="text-h6">
              planned trip date(s):
            </div>
            <div v-if="trip.activeTrip.isSingleDayTrip">
              single day trip: {{ formatFullDate(trip.activeTrip.returnDate) }}
            </div>
            <div v-else>
              start: {{ formatDateTime(trip.activeTrip.departureDate) }} - end: {{ formatFullDate(trip.activeTrip.returnDate) }}
            </div>
          </div>
          <div v-if="trip.activeTrip">
            <br>
            <div class="text-h6" v-if="trip.activeTrip.isSingleDayTrip && !tripDate">Select Actual Trip Date</div>
            <div class="text-h6" v-else-if="tripDate">Trip Date Selected</div>
            <div class="text-h6" v-else-if="!tripDates[0]">Select Actual Trip Start</div>
            <div class="text-h6" v-else-if="!tripDates[1]">Select Actual Trip End</div>
            <div class="text-h6" v-else>Trip Dates Selected</div>

            <pCalendar
              v-if="!trip.activeTrip.isSingleDayTrip"
              v-model="tripDates"
              :touchUI="false"
              :inline="true"
              :maxDate="maxDate"
              placeholder="start / end"
              selectionMode="range"
              :selectOtherMonths="true"
              onfocus="blur();"
              style="width: 100%; height: 330px">
            </pCalendar>

            <pCalendar
              v-if="trip.activeTrip.isSingleDayTrip"
              v-model="tripDate"
              :touchUI="false"
              :inline="true"
              :maxDate="maxDate"
              placeholder="start / end"
              selectionMode="single"
              :selectOtherMonths="true"
              onfocus="blur();"
              style="width: 100%; height: 330px">
            </pCalendar>

          <div style="padding: 3% 3% 9% 3%">
            <div style="float: right">
              <q-btn v-if="activeTrip" color="red" size="md" @click="closeActiveTrip" title="confirm departure and return dates to close trip" >close trip</q-btn>
              &nbsp;
              <q-spinner-radio v-if="transferring" color="red" size="3em"/>
            </div>
          </div>
            <br><br><br>
          </div>
        <br>

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

import FileUploader from '../components/FileUploader.vue';
Vue.component('file-uploader', FileUploader);

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

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

import { Notify } from 'quasar';
import { pouchService } from '@boatnet/bn-pouch/lib';

import * as jsonexport from 'jsonexport/dist';

import _ from 'lodash';

@Component
export default class Trips extends Vue {
  @State('trip') private trip!: TripState;
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;
  @State('appState') private appState!: WcgopAppState;

  @State('alert') private alert!: AlertState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('setClosedTripsTable', {namespace: 'user'}) private setClosedTripsTable: any;
  @Getter('closedTripsTable', {namespace: 'user'}) private closedTripsTable: any;

  private userTrips: any = [];
  private vessels: any[] = [];
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
  private tripDate: any = null;
  private minDate: any = new Date();
  private maxDate = new Date();
  private nextSelections: any = [];
  private authorizedVessels: Vessel[] = [];
  private tripsApiTrips: any[] = [];
  private file: any = null;
  private fileUrl: any = null;
  private transferring: boolean = false;
  private loading = true;
  private vesselNames: any[] = [];
  private cancel: boolean = false;
  private csv: any = 'initial';

  private pagination = {
    sortBy: 'departureDate',
    descending: true,
    rowsPerPage: 0,
    };

  private selected: any = [];

  private columns = [
    {name: 'actions', label: '', field: 'actions', required: false, align: 'left', sortable: true},
    {name: '_attachments', label: '', field: '_attachments', required: false, align: 'left', sortable: true},
    {name: 'tripNum', label: 'Trip Number', field: 'tripNum', required: false, align: 'left', sortable: true},
    {name: 'tripStatus', label: 'Status', field: 'closingReason', required: false, align: 'left', sortable: true},
    {name: 'departureDate', label: 'Departure Date / Time', field: 'departureDate', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b)},
    {name: 'returnDate', label: 'Return Date', field: 'returnDate', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b)},
    {name: 'departurePort', label: 'Departure Port', field: 'departurePort', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a.name).localeCompare(b.name)},
    {name: 'returnPort', label: 'Return Port', field: 'returnPort', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a.name).localeCompare(b.name)},
    {name: 'fishery', label: 'Fishery', field: 'fishery', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a.description).localeCompare(b.description)},
    {name: 'isSelected', label: 'Selected', field: 'isSelected', required: false, align: 'right', sortable: true},
  ];

  constructor() {
      super();
  }

    private async exportCsv() {
      try {
          const csv = await jsonexport(this.userTrips);
          this.csv = csv;
          this.saveFile();
      } catch (err) {
          console.error(err);
      }
    }

    private saveFile() {
      const data = this.csv;
      const blob = new Blob([data], {type: 'text/csv'});
      const e = document.createEvent('MouseEvents');
      const a = document.createElement('a');
      a.download = this.vessel.activeVessel.vesselName + ' (' + (this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber) + ') trips.csv';
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initEvent('click', true, false);
      a.dispatchEvent(e);
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
            const keyB = moment(b.departureDate);
            if (keyA < keyB) {
              return 1;
            }
            if (keyA > keyB) {
              return -1;
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
        if (moment(a.selectionDate).isAfter(b.selectionDate, 'second')) {
          return 1;
        } else if (moment(a.selectionDate).isBefore(b.selectionDate, 'second')) {
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
            savedSelections[fishery].sort(
              (a: any, b: any) => {
                return selectionSorter(a, b);
              }
            );

            const selectionObject = {
                  fishery,
                  isSelected: savedSelections[fishery][0].isSelected,
                  selectionDate: savedSelections[fishery][0].selectionDate
                  };
            this.nextSelections.push(selectionObject);
            // for (const selection of savedSelections[fishery]) {
            //   if (savedSelections[fishery].indexOf(selection) < 1) {
            //     const selectionObject = {
            //       fishery,
            //       isSelected: selection.isSelected,
            //       selectionDate: selection.selectionDate
            //       };
            //     this.nextSelections.push(selectionObject);
            //   }
            // }
          }
        }
      }
    }

    }

    private getMatchingVessels(ids: any[]) {
      const db = couchService.masterDB;
      const tempVessels: any = [];
      ids.splice(0, 100).forEach( async (id) => {
        try {
          const doc = await db.get(id);
          tempVessels.push(doc);
        } catch (err) {
          console.log(err);
        }
      });
      this.vessels = tempVessels;
    }

  private vesselsFilterFn(val: string, update: any, abort: any) {
    update(async () => {
      try {
        if (val === '') {
          this.vessels = this.vesselNames;
          return;
        } else {
          const masterDb = couchService.masterDB;
          const queryOptions: any = {
            inclusive_end: true,
            descending: false,
            include_docs: true,
            limit: 20,
            start_key: val.toLowerCase(),
            end_key: val.toLowerCase() + '\u9999'
          };

          const vessels = await masterDb.view(
            'obs_web',
            'all_vessel_names',
            queryOptions
          );
          this.vessels = vessels.rows.map((row: any) => row.doc);
        }
      } catch (err) {
        console.log(err);
      }
    });
  }

    private isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (this.userRoles.includes(role)) {
          return true;
        }
      }
      return false;
    }

    private hasAttachments(trip: any) {
      if (trip.closingReason !== 'cancelled') {
        if (trip._attachments) {
          return 'camera_alt';
        } else {
          return 'error_outline';
        }
      } else {
        return '';
      }
    }

    private getColor(attachments: any) {
      if (attachments) {
        return 'black';
      } else {
        return 'red';
      }
    }

    private async closeTrip(trip: any) {
      trip.tripStatus.description = 'closed';

      trip.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format(),
          property: 'tripStatus.description',
          newVal: 'closed',
          app: 'Observer Web'
        }
      );
      const masterDB: Client<any> = couchService.masterDB;
      this.transferring = true;
      return await masterDB.put(
        trip._id as string,
        trip,
        trip._rev as string
      ).then( () => {
        this.transferring = false;
        setTimeout( () => {this.storeOfflineData(); }, 1000);
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
      this.trip.activeTrip = trip;
      this.activeTrip = trip;
      this.cancelAlert = true;
    }

    private closeConfirm(trip: any) {
      this.trip.activeTrip = trip;
      if (!moment(trip.departureDate).isSameOrBefore(moment(), 'day')) { // trip hasn't started yet.
        // Dialog - warn trip must have started to be closed. did you mean cancel?
        this.tripNotStartedAlert = true;
        return;
      }

      this.activeTrip = trip;
      this.closeAlert = true;
      this.tripDates = [];
      this.tripDate = null;
    }

    private clearValues() {
      this.file = null;
      this.tripDate = null;
      this.tripDates = [];
      this.trip.activeTrip!.captainAffirmedDepartureDate = undefined;
      this.trip.activeTrip!.captainAffirmedReturnDate = undefined;
      this.closeAlert = false;
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
        if (!['Maximized Retention Trip - Not Selected', 'Maximized Retention chosen - selection removed'].includes(this.activeTrip.notes ) ) {
          vesselSelections[fisheryName].push({
                                isSelected: this.activeTrip.isSelected,
                                notes: this.activeTrip.notes,
                                selectionDate: this.activeTrip.selectionDate ? this.activeTrip.selectionDate : this.activeTrip.createdDate
                              });
        }
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
            this.$router.push({ path: '/trips/' });
          });
        }
      );
    }

    private async closeActiveTrip() {
      if (
        !this.trip.activeTrip!.captainAffirmedDepartureDate ||
        !this.trip.activeTrip!.captainAffirmedReturnDate ||
        this.trip.activeTrip!.captainAffirmedDepartureDate === 'Invalid date' ||
        this.trip.activeTrip!.captainAffirmedReturnDate === 'Invalid date'
      ) {
        Notify.create({
              message: '<b>Please select actual trip start and end dates</b>',
              position: 'center',
              color: 'primary',
              timeout: 3000,
              icon: 'warning',
              html: true,
              multiLine: true
          });
        return;
      }

      this.trip.activeTrip!.closingReason = 'taken';
      await this.closeTrip(this.trip.activeTrip).then(
        async () => {
          this.cancelAlert = false;
          this.closeAlert = false;
          this.file = null;
          this.closeAlert = false;
          await this.getNextSelections().then( () => {
            this.$router.push({ path: '/trips/' });
          });
        }
      );
    }

    private review(trip: any) {
      this.trip.activeTrip = trip;
      this.trip.newTrip = false;
      if (!this.isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) || this.user.captainMode) {
        this.trip.readOnly = true;
      }
      this.$router.push({path: '/trips/' + trip.tripNum});
    }

    private keyLogbook(trip: any) {
      this.$router.push({path: '/e-logbook/' + trip.tripNum});
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
                            returnPort: this.vessel.activeVessel.homePort ? this.vessel.activeVessel.homePort : '',
                            isSelected: false,
                            isWaived: false,
                            isSingleDayTrip: false,
                            fishery: {description: ''},
                            tripStatus: {
                              description: 'open'
                            },
                            maximizedRetention: null,
                            changeLog: [
                              {
                                updatedBy: authService.getCurrentUser()!.username,
                                updateDate: moment().format(),
                                property: 'tripStatus.description',
                                newVal: 'trip created',
                                app: 'Observer Web'
                              }
                            ]
                            };
      this.trip.activeTrip = newTrip;

      this.trip.newTrip = true;
      this.trip.readOnly = false;
      this.$router.push({path: '/trips/' + newTripNum});
      }

private computedTripClass(trip: WcgopTrip) {
  if (trip.isSelected) {
    return 'my-card bg-primary text-white';
  } else {
    return 'my-card bg-secondary text-white';
  }
}


private computedSelectionClass(selection: any) {
  if (selection.isSelected) {
    return 'my-card bg-primary text-white';
  } else {
    return 'my-card bg-secondary text-white';
  }
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
      this.loading = false;
    } catch (err) {
      console.log(err);
      Notify.create({
        message: 'OFFLINE MODE',
        position: 'center',
        color: 'red',
        timeout: 2000,
        icon: 'warning',
        html: true,
        multiLine: true
      });
    }
  }
}

private async storeOfflineData() {
  if (!this.isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) || this.user.captainMode) {
    const db = pouchService.db;
    let userTripsDoc: any = {};

    try {
      await db.query(
        'my_index/by_type', {
          key: 'user-trips',
          include_docs: true,
          limit: 1
        }
      ).then(
        (res: any) => {
        userTripsDoc = res.rows[0].doc;
        userTripsDoc.openTrips = this.openTrips;
        userTripsDoc.activeVessel = this.vessel.activeVessel.vesselName;
        userTripsDoc.nextSelections = this.nextSelections;
        userTripsDoc.storedDate = moment().format();
        }
      );

    } catch (err) {
      console.log(err);
      userTripsDoc = {
        type: 'user-trips',
        openTrips: this.openTrips,
        activeVessel: this.vessel.activeVessel.vesselName,
        nextSelections: this.nextSelections,
        storedDate: moment().format()
      };
    }

    await db.post(userTripsDoc).then(
      async () => {
        await db.query(
          'my_index/by_type', {
            limit: 10,
            key: 'user-trips',
            include_docs: true
          }
        ).then(
          (res: any) => {
            return;
          }
        );
      }
    );
  }
}

private async getVesselNames() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const masterDb = couchService.masterDB;
        const queryOptions: any = {
          inclusive_end: true,
          descending: false,
          include_docs: true,
          limit: 20,
          start_key: '',
          end_key: '' + '\u9999'
        };

        const vessels = await masterDb.view(
          'obs_web',
          'all_vessel_names',
          queryOptions
        );
        this.vesselNames = vessels.rows.map((row: any) => row.doc);

    } catch (err) {
        this.errorAlert(err);
    }
  }

private async getAuthorizedVessels() {
    if (this.isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !this.user.captainMode) {
      return;
    }

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

      const vesselQuery: any = await masterDB.view(
        'obs_web',
        'all_vessel_nums',
        vesselQueryOptions
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

  private closedTripClass(trip: any) {
    if (!trip._attachments && (trip.closingReason === 'taken' || trip.closingReason === 'missed trip')) {
      return 'my-card bg-red-9 text-white trip-card';
    } else {
      return 'my-card bg-grey-6 text-white trip-card';
    }
  }

  private setTablePref() {
    this.setClosedTripsTable(!this.closedTripsTable);
  }

  private getBtnColor() {
    if (this.closedTripsTable) {
      return 'primary';
    } else {
      return 'secondary';
    }
  }

  private shortFormatDate(date: any) {
      return moment(date).format('MMM Do');
  }

  private formatDepartureTime(date: any) {
      return moment(date).format('HH:mm');
  }

  private formatFullDate(date: any) {
      return moment(date).format('MM/DD/YYYY');
  }

  private formatDateTime(date: any) {
      return moment(date).format('MM/DD/YYYY, HH:mm');
  }

  private formatTel(telNum: any) {
      telNum = telNum.toString();
      return '(' + telNum.substring(0, 3) + ') ' + telNum.substring(3, 6) + '-' + telNum.substring(6, 10);
  }

  private async created() {
    // this.setActiveVessel();
    this.getVesselNames();
    this.getAuthorizedVessels();
    this.getVesselTrips();
    if ( authService.getCurrentUser() ) {
      this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
    }
    this.getNextSelections();
    setTimeout( () => {
      this.storeOfflineData();
     }, 1000);
  }

  @Watch('vessel.activeVessel')
  private async handler1(newVal: string, oldVal: string) {
    this.nextSelections = [];
    this.getVesselTrips();
    this.getNextSelections();
    setTimeout( () => {this.storeOfflineData(); }, 1000);
  }

  @Watch('tripDates')
  private handler2(newVal: string, oldVal: string) {
    if (newVal[0]) {
      this.trip.activeTrip!.captainAffirmedDepartureDate = moment(newVal[0]).format();
      if (!newVal[1]) {
        this.trip.activeTrip!.captainAffirmedDepartureDate = moment(newVal[0]).format();
      }
    }
    if (newVal[1]) {
      this.trip.activeTrip!.captainAffirmedReturnDate = moment(newVal[1]).format();
    }
  }

  @Watch('tripDate')
  private handler3(newVal: string, oldVal: string) {
    this.trip.activeTrip!.captainAffirmedDepartureDate = moment(newVal).format();
    this.trip.activeTrip!.captainAffirmedReturnDate = moment(newVal).format();
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

  .p-datepicker span.p-highlight
    background-color: #007EC6 !important

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

@media only screen and (max-width: 760px) {
  #exportTrips {
    display: none;
  }
}

@media screen and (max-height: 760px) {
  #exportTrips {
    display: none;
  }
}

</style>


