<template>
  <div>
      <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
          <q-btn flat label="Dismiss" @click="clearAlert"/>
        </template>
      </q-banner>

  <div :disabled="trip.readOnly">

        <div style="font-weight: bold; margin: 15px 15px 0">
          <div v-if="trip.activeTrip.tripNum"> Trip #: {{ trip.activeTrip.tripNum }}</div>

          <div v-if="trip.activeTrip.fishery.description"> Fishery: {{ trip.activeTrip.fishery.description }}</div>

          <div v-if="trip.activeTrip.isSelected" class="text-green" style="font-size: 22px">
          <q-icon
            name="warning"
          ></q-icon>
            Trip Selected
          </div>

          <div v-if="trip.activeTrip._id && !trip.activeTrip.isSelected" class="text-primary" style="font-size: 22px">
          <q-icon
            name="not_interested"
          ></q-icon>
            Observer Not Required
          </div>

        </div>

        <div>

          <div class="trips-el-height">
            <q-toggle
              v-model="trip.activeTrip.isSingleDayTrip"
              color="primary"
              label="Single Day Trip"
              :disable="trip.readOnly"
              @input="updateDates"
              style="font-weight: bold"
            ></q-toggle>
          </div>

          <div class="row items-start">
            <div class="trips-el-height">
              <span v-if="!trip.activeTrip.isSingleDayTrip" class="date-label">Departure Date</span>
                <pCalendar
                  :disabled="trip.readOnly"
                  v-if="!trip.activeTrip.isSingleDayTrip"
                  v-model="tripDates[0]"
                  :minDate="minDate"
                  :maxDate="maxDate"
                  :disabledDates="invalidDates"
                  :inline="false"
                  :touchUI="isMobile"
                  placeholder="enter date"
                  selectionMode="single"
                  :selectOtherMonths="true"
                  onfocus="blur();"
                  style="width: 150px"
                  @input="resetDepartureTime"
                  >
                </pCalendar>
            </div>

            <div class="trips-el-height">
              <span v-if="trip.activeTrip.isSingleDayTrip" class="date-label">Trip Date</span>
              <pCalendar
                :disabled="trip.readOnly"
                v-if="trip.activeTrip.isSingleDayTrip"
                v-model="tripDate"
                :minDate="minDate"
                :maxDate="maxDate"
                :disabledDates="invalidDates"
                :inline="false"
                :touchUI="isMobile"
                placeholder="enter date"
                selectionMode="single"
                :selectOtherMonths="true"
                onfocus="blur();"
                style="width: 150px"
                @input="resetDepartureTime"
                >
              </pCalendar>
            </div>

            <div class="trips-el-height" style="margin: 0 15px ; font-weight: bold">Departure Time (24H)
              <timepicker
                :disabled="trip.readOnly"
                manual-input
                hide-clear-button
                close-on-complete
                v-model="departureTime"
                lazy
                :hour-range="getValidHours"
                hide-disabled-hours
                @input="updateDepartureDate">
              </timepicker>
            </div>

            <div class="trips-el-height">
              <span v-if="!trip.activeTrip.isSingleDayTrip" class="date-label">Return Date</span>
              <pCalendar
                :disabled="trip.readOnly"
                v-if="!trip.activeTrip.isSingleDayTrip"
                v-model="tripDates[1]"
                :minDate="minDate"
                :maxDate="maxDate"
                :disabledDates="invalidDates"
                :inline="false"
                :touchUI="isMobile"
                placeholder="enter date"
                selectionMode="single"
                :selectOtherMonths="true"
                onfocus="blur();"
                style="width: 150px"
                >
              </pCalendar>
            </div>
          </div>

        </div>

      <div class="q-pa-md">

        <q-select
          label="Start Port"
          v-model="trip.activeTrip.departurePort"
          :options="ports"
          @filter="startPortsFilterFn"
          :option-label="opt => opt.name"
          option-value="_id"
          dense
          fill-input
          stack-label
          :readonly="trip.readOnly"
          use-input
          hide-selected
          clearable
        ></q-select>

        <q-select
          v-model="trip.activeTrip.returnPort"
          dense
          label="End Port"
          @filter="endPortsFilterFn"
          fill-input
          stack-label
          :option-label="opt => opt.name"
          option-value="_id"
          :options="ports"
          :readonly="trip.readOnly"
          use-input
          hide-selected
          clearable
        ></q-select>

        <q-select
          v-model="trip.activeTrip.fishery"
          dense
          label="Fishery"
          fill-input
          stack-label
          :rules="[val => !!val || 'Field is required']"
          :option-label="opt => opt.description"
          option-value="_id"
          :options="fisheryOptions"
          :readonly="trip.readOnly || !this.trip.newTrip"
          style="padding-bottom: 5px"
        ></q-select>

        <p style="margin: 0">
          <strong :disabled="trip.readOnly">Permits</strong>
        </p>

        <q-select
          v-model="trip.activeTrip.permits"
          dense
          bg-color="white"
          color="primary"
          multiple
          use-chips
          stack-label
          :option-label="opt => opt.permitNumber"
          option-value="permitNumber"
          :options="getVesselPermits"
          :readonly="trip.readOnly"
        >
          <template v-slot:selected-item="scope">
            <q-chip
              removable
              dense
              @remove="scope.removeAtIndex(scope.index)"
              :tabindex="scope.tabindex"
              color="primary"
              text-color="white"
            >
              <q-avatar color="primary" text-color="white" icon="local_offer"/>
              <span v-if="scope.opt.label">{{ scope.opt.label }}</span>
              <span v-else>{{ scope.opt.permitNumber }}</span>
            </q-chip>
          </template>
        </q-select>

        <div v-if="trip.activeTrip.fishery.description === 'Electronic Monitoring EFP'">
          <strong :disabled="trip.readOnly">Will this trip be maximized retention?</strong>
          <q-btn-toggle
          v-model="trip.activeTrip.maximizedRetention"
          toggle-color="primary"
          :disable="trip.readOnly"
          :options="[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
              {label: 'Don\'t know', value: null}
            ]"
          >
          </q-btn-toggle>
        </div>

        <div v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode">
          <strong :disable="trip.readOnly">Coverage Waived? (Staff Only)</strong><br>
          <q-btn-toggle
          v-model="trip.activeTrip.isWaived"
          toggle-color="primary"
          :disable="trip.readOnly"
          :options="[
            {label: 'Yes', value: true},
            {label: 'No', value: false}
          ]"></q-btn-toggle>
        </div>

    <q-dialog v-model="missingRequired">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              You must specify a fishery.
            </div>
            <q-btn style="float: right" color="primary" @click="missingRequired = false" label="ok"/>
            <br><br>
          </q-card-section>
        </q-card>
    </q-dialog>

    <q-dialog v-model="daysWarn">
      <q-card>
        <q-card-section>
        <div class="text-h6">
          Trip start time is less than 48 hours from now! If selected for observer coverage an observer will be provided ASAP but trip may be delayed up to 48 hours.
        </div>
        </q-card-section>
        <q-card-section class="float-right">
          <q-btn color="primary" @click="daysWarn = false" label="OK"/>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
      </div>

          <div v-if="trip.activeTrip.tripStatus.description === 'closed'" style="text-align: center">
            <file-uploader
              label="Logbook Capture"
              :trip="trip.activeTrip"
              submitAction="Add Image(s)"
            />
          </div>

      <div v-if="trip.newTrip" align="right" class="text-primary" style="padding-right: 10px">
        <q-btn label="Cancel" @click="goToTrips"/>
        &nbsp;
        <q-btn label="Create Trip" color="primary" @click="createTrip" :disable="disableCreate"/>
        <q-spinner-radio v-if="transferring" color="primary" size="3em"/>
        <br>&nbsp;
      </div>
      <div v-if="!trip.newTrip" align="right" class="text-primary" style="padding-right: 10px">
        <q-btn label="Cancel Edit" @click="goToTrips"></q-btn>
        &nbsp;
        <q-btn label="Update Trip" color="primary" @click="updateTrip"></q-btn>
        <q-spinner-radio v-if="transferring" color="primary" size="3em"/>
        <br>&nbsp;
      </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  AlertState, GeneralState, PermitState,
  TripState, UserState, VesselState
} from '../_store/types/types';

import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService, auth } from '@boatnet/bn-auth';

import {
  Fishery, LocationEvent, OTSTarget, Permit, Port,
  PortTypeName, TripSelection, Vessel, VesselTypeName,
  WcgopOperation, WcgopOperationTypeName,
  WcgopTrip, WcgopTripTypeName
} from '@boatnet/bn-models';

import { newTripsApiTrip, updateTripsApiTrip, emailCoordinators } from '@boatnet/bn-common';

// import { username, password } from '../config/secrets'

import FileUploader from '../components/FileUploader.vue';
Vue.component('file-uploader', FileUploader);

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

import Timeselector from 'vue-timeselector';
Vue.component('timeselector', Timeselector);

import VueTimepicker from 'vue2-timepicker';
Vue.component('timepicker', VueTimepicker);

import { date, Notify } from 'quasar';
import request from 'request';
import moment from 'moment';
import _ from 'lodash';

@Component
export default class TripDetails extends Vue {
  @State('trip') private trip!: TripState;
  @State('permit') private permit!: PermitState;
  @State('user') private user!: UserState;
  @State('general') private general!: GeneralState;
  @State('vessel') private vessel!: VesselState;

  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private prompt = false;

  private portOptions: string[] = [];
  private fisheryOptions: Fishery[] = [];
  private permits: Permit[] = [];
  private otsTargets: OTSTarget[] = [];
  private ports: any[] = [];
  private userTrips!: any;
  private latestReturnDate = 0;
  private missingRequired = false;

  private existingTripStart: string = '0';
  private existingTripEnd: string = '0';
  private startYearMonth: string = moment().format('YYYY/MM');
  private endYearMonth: string = moment().format('YYYY/MM');
  private tripDates: any = [];
  private tripDate: any = null;
  private invalidDates: any[] = [];
  private minDate: any = null;
  private maxDate: any = null;
  private daysWarn: boolean = false;
  private emRoster: any = {};
  private maximizedRetention: any = null;
  private tripsApiTrips: any = [];
  private tripsApiNum: number = 0;
  private file: any = null;
  private fileUrl: any = null;
  private transferring: boolean = false;
  private newImage: boolean = false;
  private departureTime: any = null;
  private disableCreate: boolean = false;
  private userRoles: string[] = [];
  private savedMaxRetention: any = null;
  private departureTimeEntered: boolean = false;
  private oldTrip: any = null;

  constructor() {
    super();
  }

  private isAuthorized(authorizedRoles: string[]) {
    for (const role of authorizedRoles) {
      if (this.userRoles.includes(role)) {
        return true;
      }
    }
    return false;
  }

  private getDate(myDate: string) {
    return moment(myDate).format();
  }

  private async getFisheryOptions() {
    const masterDb = couchService.masterDB;
    const queryOptions = {
      reduce: false,
      include_docs: true,
      key: 'fishery'
    };

    const fisheries = await masterDb.view(
      'obs_web',
      'all_doc_types',
      queryOptions,
    );

    this.fisheryOptions = fisheries.rows.map((row: any) => row.doc);
    this.fisheryOptions = this.fisheryOptions.filter((option: any) => option.description === 'Electronic Monitoring EFP'); // only EM EFP

    // this.fisheryOptions.sort( (a: any, b: any) => {
    //   if (a.description > b.description) {
    //     return 1;
    //   } else if (a.description < b.description) {
    //     return -1;
    //   } else {
    //     return 0;
    //   }
    // });

    this.trip.activeTrip!.fishery = this.fisheryOptions[0];  // set to EM EFP
  }

  private permitsFilterFn(val: string, update: any, abort: any) {

    if (val === '') {
      update(() => {
        this.permit.permits = this.permit.permits;
      });
      return;
    }
    update(() => {
      const searchString = val.toLowerCase();
      this.permit.permits = this.permit.permits.filter((permit) =>
        permit.permitNumber
          ? permit.permitNumber
              .toLowerCase()
              .indexOf(searchString.toLowerCase()) > -1
          : false
      );
    });
  }

  private startPortsFilterFn(val: string, update: any, abort: any) {
    update(async () => {
      try {
        const masterDb = couchService.masterDB;
        const queryOptions = {
          // limit: 5,
          start_key: val.toLowerCase(),
          end_key: val.toLowerCase() + '\u9999',
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const ports = await masterDb.view(
          'obs_web',
          'all_port_names',
          queryOptions,
        );
        this.ports = ports.rows.map((row: any) => row.doc);
      } catch (err) {
        console.log(err);
      }
    });
  }

  private endPortsFilterFn(val: string, update: any, abort: any) {
    update(async () => {
      try {
        const masterDb = couchService.masterDB;
        const queryOptions = {
          // limit: 5,
          start_key: val.toLowerCase(),
          end_key: val.toLowerCase() + '\u9999',
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const ports = await masterDb.view(
          'obs_web',
          'all_port_names',
          queryOptions
        );
        this.ports = ports.rows.map((row: any) => row.doc);
      } catch (err) {
        console.log(err);
      }
    });
  }

  private getStatus(otsTarget: OTSTarget) {
    if (
      moment(otsTarget.effectiveDate) <= moment() &&
      moment() <= moment(otsTarget.expirationDate) &&
      otsTarget.status !== 'Inactive'
    ) {
      return 'Active';
    } else {
      return 'Inactive';
    }
  }

  private async getEmRoster() {
    const masterDb = couchService.masterDB;
    const queryOptions = {
      key: 'emefp',
      inclusive_end: true,
      reduce: false,
      include_docs: true
    };

    const EMEfpRoster = await masterDb.view(
      'obs_web',
      'all_doc_types',
      queryOptions
    );

    for (const row of EMEfpRoster.rows) {
      this.emRoster[row.doc.vesselCGNumber] = row.doc.lePermit;
    }

  }

  private get getVesselPermits() {
    const vesselId = this.vessel.activeVessel!.coastGuardNumber ?
                      this.vessel.activeVessel!.coastGuardNumber : this.vessel.activeVessel!.stateRegulationNumber ?
                      this.vessel.activeVessel!.stateRegulationNumber : '';
    const vesselPermits = this.permit.vesselPermits[vesselId];
    return vesselPermits;
  }

  private async handleSavedSelections() {
      const savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
      };
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

      if (!this.trip.activeTrip!.maximizedRetention) {
        // first check whether there is a stored selection for the vessel and fishery
        // apply selection to new trip
        let tripSelection: any = null;
        if (vesselSelections[fisheryName] && vesselSelections[fisheryName].length > 0) {
          if (vesselSelections[fisheryName].length > 1) {
            vesselSelections[fisheryName].sort( (a: any, b: any) => {
              if (moment(a.selectionDate).isAfter(b.selectionDate, 'second')) {
                return 1;
              } else if (moment(a.selectionDate).isBefore(b.selectionDate, 'second')) {
                return -1;
              } else {
                return 0;
              }
            });

            tripSelection = vesselSelections[fisheryName].shift();
            // vesselSelections[fisheryName].splice(vesselSelections[fisheryName].indexOf(tripSelection), 1);

            // const sel1 = vesselSelections[fisheryName][0].selectionDate;
            // const sel2 = vesselSelections[fisheryName][1].selectionDate;
            // if (moment(sel1).isBefore(sel2, 'second')) {
            //   tripSelection = vesselSelections[fisheryName].shift();
            // } else {
            //   tripSelection = vesselSelections[fisheryName].pop();
            // }
          } else {
            tripSelection = vesselSelections[fisheryName].pop();
            // vesselSelections[fisheryName].splice(vesselSelections[fisheryName].indexOf(tripSelection), 1);
          }
          // no longer need to save here as a selection is added later
          // if (vesselSelections._id) {
          //   await masterDb.put(
          //     vesselSelections._id,
          //     vesselSelections,
          //     vesselSelections._rev
          //   );
          // } else {
          //   await masterDb.post(vesselSelections);
          // }

          this.trip.activeTrip!.isSelected = tripSelection.isSelected;
          this.trip.activeTrip!.notes = tripSelection.notes;
          this.trip.activeTrip!.selectionDate = tripSelection.selectionDate;

        } else {
          const activeOTSTarget: any = this.getActiveOtsTarget();

          const randomNum = Math.floor(Math.random() * 100);

          if (activeOTSTarget && activeOTSTarget.setRate && this.trip.activeTrip) {
            if (randomNum < activeOTSTarget.setRate) {
              this.trip.activeTrip.isSelected = true;
              this.trip.activeTrip.notes =
                'Trip selected using Target Type: ' +
                activeOTSTarget.targetType +
                ', with set rate of ' +
                activeOTSTarget.setRate +
                ' (randomly generated number: ' +
                randomNum +
                ' was less than set rate: ' +
                activeOTSTarget.setRate +
                ')';
            } else {
              this.trip.activeTrip.isSelected = false;
              this.trip.activeTrip.notes =
                'Trip NOT selected using Target Type: ' +
                activeOTSTarget.targetType +
                ', with set rate of ' +
                activeOTSTarget.setRate +
                ' (randomly generated number: ' +
                randomNum +
                ' was NOT less than set rate: ' +
                activeOTSTarget.setRate +
                ')';
            }
          }

        }

      } else {
        this.trip.activeTrip!.isSelected = false;
        this.trip.activeTrip!.notes = 'Maximized Retention Trip - Not Selected';
      }

      if (!vesselSelections[fisheryName]) {
        vesselSelections[fisheryName] = [];
      }

      if (!vesselSelections[fisheryName] || vesselSelections[fisheryName].length < 1) {

        const activeOTSTarget: any = await this.getActiveOtsTarget();
        const randomNum = Math.floor(Math.random() * 100);

        const newSelection: any = {
          selectionDate: moment().format(),
          isSelected: false
          };

        if (activeOTSTarget) {
          if (randomNum < activeOTSTarget.setRate) {
            newSelection.isSelected = true;
            newSelection.notes = 'Trip selected using Target Type: ' +
                activeOTSTarget.targetType +
                ', with set rate of ' +
                activeOTSTarget.setRate +
                ' (randomly generated number: ' +
                randomNum +
                ' was less than set rate: ' +
                activeOTSTarget.setRate +
                ')';
          } else {
            newSelection.isSelected = false;
            newSelection.notes = 'Trip NOT selected using Target Type: ' +
                activeOTSTarget.targetType +
                ', with set rate of ' +
                activeOTSTarget.setRate +
                ' (randomly generated number: ' +
                randomNum +
                ' was NOT less than set rate: ' +
                activeOTSTarget.setRate +
                ')';
          }
        }
        vesselSelections[fisheryName].push(newSelection);
      }

      if (vesselSelections._id) {
        await masterDb.put(
          vesselSelections._id,
          vesselSelections,
          vesselSelections._rev
        );
      } else {
        await masterDb.post(vesselSelections);
      }

  }

  private async createTrip() {

    // REQIRES A START AND END DATE
    if (!this.trip.activeTrip!.departureDate || !this.trip.activeTrip!.returnDate) {
      Notify.create({
        message: '<b>A trip must have a start and end date</b>',
            position: 'center',
            color: 'primary',
            timeout: 2000,
            icon: 'warning',
            html: true,
            multiLine: true
        });
      return;
    }

    // REQUIRES A DEPARTURE TIME
    if (!this.departureTimeEntered) {
      Notify.create({
        message: '<b>A trip must have a departure time.</b>',
        position: 'center',
        color: 'primary',
        timeout: 2000,
        icon: 'warning',
        html: true,
        multiLine: true
      });
      return;
    }

    if (!this.trip.activeTrip!.departurePort || !this.trip.activeTrip!.returnPort) {
      Notify.create({
        message: '<b>A trip must have a departure and return port.</b>',
        position: 'center',
        color: 'primary',
        timeout: 2000,
        icon: 'warning',
        html: true,
        multiLine: true
      });
      return;
    }

    // REQUIRES A FISHERY!
    if (this.trip.activeTrip!.fishery!.description !== '') {
      this.disableCreate = true;

      this.handleSavedSelections().then( async () => {
        const newApiTrip = {
          vesselId: this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber,
          vesselName: this.trip.activeTrip!.vessel!.vesselName,
          departurePort: this.trip.activeTrip!.departurePort!.code ? this.trip.activeTrip!.departurePort!.code : this.trip.activeTrip!.departurePort!.name,
          departureDate: this.trip.activeTrip!.departureDate,
          returnPort: this.trip.activeTrip!.returnPort!.code ? this.trip.activeTrip!.returnPort!.code : this.trip.activeTrip!.departurePort!.name,
          returnDate: this.trip.activeTrip!.returnDate,
          permits: this.trip.activeTrip!.permits ? this.trip.activeTrip!.permits.map((permit: any) => permit.permitNumber ) : [],
          fishery: this.trip.activeTrip!.fishery!.description,
          createdBy: this.trip.activeTrip!.createdBy,
          createdDate: this.trip.activeTrip!.createdDate
        };

        this.trip.activeTrip!.vesselId = this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber;

        try {
          await newTripsApiTrip(newApiTrip).then( (res: any) => this.tripsApiNum = res.tripNum);
          this.trip.activeTrip!.tripNum = this.tripsApiNum;
        } catch (err) {
          // Notify.create({
          //   message: 'Could not get a tripID - Trip ID is required to create a trip.  TripsAPI responded with ' + err,
          //   position: 'top',
          //   color: 'red',
          //   timeout: 7000,
          //   multiLine: true
          // });
          // return;
          console.log(err);
        }

        const masterDB: Client<any> = couchService.masterDB;
        await masterDB.post(this.trip.activeTrip).then( () => {
          Notify.create({
            message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>Your trip notification has been submitted!<br></div><div class=text-h6"><br>If an Observer is required, the Observer Program will be in touch before the trip.<br>&nbsp;<br>&nbsp;</div>',
              position: 'top',
              color: 'primary',
              timeout: 7000,
              html: true,
              multiLine: true
          });
          if (this.trip.activeTrip!.isSelected) {
            emailCoordinators(this.trip.activeTrip, 'NEW');
          }
          this.$router.push({ path: '/trips/' });
        });
      });


    } else {
      this.missingRequired = true;
    }
  }

  private getActiveOtsTarget() {
    let activeOTSTarget;
    const fisheryName: string = this.trip.activeTrip!.fishery!.description!;
    for (const otsTarget of this.otsTargets) {
      if (this.trip.activeTrip && this.trip.activeTrip.fishery) {
        if (
          this.getStatus(otsTarget) === 'Active' &&
          otsTarget.targetType === 'Fishery Wide' &&
          otsTarget.fishery === fisheryName
        ) {
          activeOTSTarget = otsTarget;
        }
      }
    }
    for (const otsTarget of this.otsTargets) {
      if (
        this.getStatus(otsTarget) === 'Active' &&
        otsTarget.targetVessel &&
        this.trip.activeTrip &&
        this.trip.activeTrip.vessel &&
        this.trip.activeTrip.fishery
      ) {
        const otsVesselId = otsTarget.targetVessel.coastGuardNumber
          ? otsTarget.targetVessel.coastGuardNumber
          : otsTarget.targetVessel.stateRegulationNumber;
        const tripVesselId = this.trip.activeTrip.vessel.coastGuardNumber
          ? this.trip.activeTrip.vessel.coastGuardNumber
          : this.trip.activeTrip.vessel.stateRegulationNumber;
        if (
          otsTarget.targetType === 'Vessel' &&
          otsTarget.fishery === this.trip.activeTrip.fishery.description &&
          otsVesselId === tripVesselId
        ) {
          activeOTSTarget = otsTarget;
        }
      }
    }
    return activeOTSTarget;
  }

  private goToTrips() {
    this.$router.push({ path: '/trips/' });
  }

  get departureDate(): Date | undefined {
    if (this.trip.activeTrip) {
      return new Date(moment(this.trip.activeTrip.departureDate).format());
    }
  }

  set departureDate(value) {
    if (this.trip.activeTrip) {
      this.trip.activeTrip.departureDate = moment(this.tripDates[0]).format();
    }
  }

  // get departureTime(): Date | undefined {
  //   if (this.trip.activeTrip) {
  //     return new Date(moment(this.trip.activeTrip.departureDate).format());
  //   }
  // }

  // set departureTime(value) {
  //   if (this.trip.activeTrip) {
  //     this.trip.activeTrip.departureDate = moment(value).format();
  //   }
  // }

  private setDepartureTime() {
    if (this.trip.activeTrip && this.trip.activeTrip.departureDate) {
      this.departureTime = {
        HH: moment(this.trip.activeTrip.departureDate).format('HH'),
        mm: moment(this.trip.activeTrip.departureDate).format('mm')
      };
    }
  }

  private updateDepartureDate() {
    if (this.departureTime) {
      this.trip.activeTrip!.departureDate = moment(this.trip.activeTrip!.departureDate).minute(this.departureTime.mm).hour(this.departureTime.HH).second(0).format();
      this.departureTimeEntered = true;

      if (moment(this.trip.activeTrip!.departureDate).diff(moment(), 'hours') < 48  && (!this.isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) || this.user.captainMode)) {
        this.daysWarn = true;
      }
    }
  }

  get returnDate(): Date | undefined {
    if (this.trip.activeTrip) {
      return new Date(moment(this.trip.activeTrip.returnDate).format());
    }
  }

  set returnDate(value) {
    if (this.trip.activeTrip) {
      this.trip.activeTrip.returnDate = moment(this.tripDates[1]).format();
    }
  }

  private async getMaxDate() {
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
      const openTrips: any = vesselTrips.rows.filter( (row: any) => row.doc.tripStatus.description === 'open');


      if (this.trip.index === 0 && !this.trip.newTrip) {
        for (const row of openTrips) {
          if ( row.doc.type === 'ots-trip' && row.doc.vessel.vesselName === this.trip.activeTrip!.vessel!.vesselName && row.doc._id !== this.trip.activeTrip!._id) {
            if (row.doc.tripStatus.description === 'open') {
              this.maxDate = new Date(moment(row.doc.departureDate).format());
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
}

private async getMinDate() {
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
      const openTrips: any = vesselTrips.rows.filter( (row: any) => row.doc.tripStatus.description === 'open');

      if (this.trip.index === 1) {
        for (const row of openTrips) {
          if ( row.doc.type === 'ots-trip' &&
                (row.doc.vessel.coastGuardNumber ? row.doc.vessel.coastGuardNumber : row.doc.vessel.stateRegulationNumber) === vesselId &&
                row.doc._id !== this.trip.activeTrip!._id
              ) {
                  this.minDate = new Date(moment(row.doc.returnDate).format());
                  if (moment(this.minDate).isSameOrBefore(moment()) ) {
                    this.minDate = new Date();
                  }
                }
        }
      } else if (this.trip.newTrip) {
        this.minDate = new Date();
      } else {
        this.minDate = new Date();
      }
    } catch (err) {
      console.log(err);
    }
}

  private async getBookedDates() {
    if (!this.isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) || this.user.captainMode) {
      this.trip.readOnly = true;
    } else {
      this.trip.readOnly = false;
    }
    const vesselId = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;
    const masterDB: Client<any> = couchService.masterDB;
    const queryOptions: any = {
            include_docs: true,
            reduce: false,
            key: vesselId
          };
    let i = 0;

    try {
      const vesselTrips = await masterDB.view<any>(
              'obs_web',
              'ots_trips_by_vesselId',
              queryOptions
            );
      const openTrips: any = vesselTrips.rows.filter( (row: any) => row.doc.tripStatus.description === 'open');
      for (const row of openTrips) {
        if ( row.doc.type === 'ots-trip' && row.doc.vessel.vesselName === this.trip.activeTrip!.vessel!.vesselName && row.doc._id !== this.trip.activeTrip!._id) {
          if (row.doc.tripStatus.description === 'open') {
            {
              this.existingTripStart = row.doc.departureDate;
              this.existingTripEnd = row.doc.returnDate;
              const days = moment(moment(row.doc.returnDate).format('YYYY-MM-DD')).diff(moment(row.doc.departureDate).format('YYYY-MM-DD'), 'days');
              for (i = 1; i < days; i++) {
                  const invalidDay: any = moment(JSON.parse(JSON.stringify(row.doc.departureDate)));
                  invalidDay.add(i, 'days');
                  this.invalidDates.push(new Date(invalidDay.format()));
              }
            }
          }
          if (row.doc.tripStatus.description === 'closed' && row.doc.closingReason === 'Taken') {
            const closedTripStart = row.doc.captainAffirmedDepartureDate;
            const closedTripEnd = row.doc.captainAffirmedReturnDate;
            const days = moment(row.doc.captainAffirmedReturnDate).diff(row.doc.captainAffirmedDepartureDate, 'days');
            for (i = 0; i <= days; i++) {
              const invalidDay: any = moment(JSON.parse(JSON.stringify(row.doc.captainAffirmedDepartureDate)));
              invalidDay.add(i, 'days');
              this.invalidDates.push(new Date(invalidDay.format()));
            }
          }
        }
      }

    } catch (err) {
      console.log(err);
      this.trip.readOnly = false;
    }
    if (this.trip.activeTrip!.tripStatus!.description === 'open') {
      this.trip.readOnly = false;
    }
  }

  private startDateOptionsFn(val: string) {
    if (this.trip.newTrip) {
      return moment(val) >= moment() &&
      (moment(val) < moment(this.existingTripStart) || moment(val) > moment(this.existingTripEnd));
    } else {
      return true;
    }
  }

  private returnDateOptionsFn(val: string) {
    if (this.trip.activeTrip && this.trip.activeTrip.departureDate) {
      if (moment(this.trip.activeTrip.departureDate) < moment(this.existingTripEnd)) {
        return moment(val) >= moment(this.trip.activeTrip.departureDate) &&
        moment(val) < moment(this.existingTripStart);
      } else {
        return moment(val) >= moment(this.trip.activeTrip.departureDate) &&
        moment(val) > moment(this.existingTripEnd);
      }
    } else {
      return moment(val) >= moment() &&
      (moment(val) < moment(this.existingTripStart) || moment(val) > moment(this.existingTripEnd));
    }
  }

  private async updateTrip() {

    // REQIRES A START AND END DATE
    if (!this.trip.activeTrip!.departureDate || !this.trip.activeTrip!.returnDate) {
      Notify.create({
        message: '<b>A trip must have a start and end date</b>',
            position: 'center',
            color: 'primary',
            timeout: 2000,
            icon: 'warning',
            html: true,
            multiLine: true
        });
      return;
    }

    // REQUIRES A DEPARTURE TIME
    if (!this.departureTimeEntered) {
      Notify.create({
        message: '<b>A trip must have a departure time.</b>',
        position: 'center',
        color: 'primary',
        timeout: 2000,
        icon: 'warning',
        html: true,
        multiLine: true
      });
      return;
    }

    this.transferring = true;
    this.trip.activeTrip!.updatedBy = authService.getCurrentUser()!.username;
    this.trip.activeTrip!.updatedDate = moment().format();

    if (this.trip.activeTrip!.tripNum === 0 || this.trip.activeTrip!.tripNum === 1) {
      try {
        const newApiTrip = {
          vesselId: this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber,
          vesselName: this.trip.activeTrip!.vessel!.vesselName,
          departurePort: this.trip.activeTrip!.departurePort!.code ? this.trip.activeTrip!.departurePort!.code : this.trip.activeTrip!.departurePort!.name,
          departureDate: this.trip.activeTrip!.departureDate,
          returnPort: this.trip.activeTrip!.returnPort!.code ? this.trip.activeTrip!.returnPort!.code : this.trip.activeTrip!.departurePort!.name,
          returnDate: this.trip.activeTrip!.returnDate,
          permits: this.trip.activeTrip!.permits ? this.trip.activeTrip!.permits.map((permit: any) => permit.permitNumber ) : [],
          fishery: this.trip.activeTrip!.fishery!.description,
          createdBy: this.trip.activeTrip!.createdBy,
          createdDate: this.trip.activeTrip!.createdDate
        };

        this.trip.activeTrip!.vesselId = this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber;

        await newTripsApiTrip(newApiTrip).then( (res: any) => this.tripsApiNum = res.tripNum);
        this.trip.activeTrip!.tripNum = this.tripsApiNum;

      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await updateTripsApiTrip(this.trip.activeTrip);
        console.log('tripsApi trip updated');
      } catch (err) {
          console.log(err);
      }
    }

    const masterDB: Client<any> = couchService.masterDB;
    if (this.trip.activeTrip!.isSelected && this.trip.activeTrip!.maximizedRetention) {

      this.saveSelection().then(
        async () => {
          this.trip.activeTrip!.isSelected = false;
          this.trip.activeTrip!.notes = 'Maximized Retention chosen - selection removed';
          await masterDB.put(
            this.trip.activeTrip!._id as string,
            this.trip.activeTrip,
            this.trip.activeTrip!._rev as string).then( () => this.$router.push({ path: '/trips' }));
        }
      );

    } else if (this.savedMaxRetention === true && !this.trip.activeTrip!.maximizedRetention) {
      this.handleSavedSelections().then(async () => {
        await masterDB.put(
          this.trip.activeTrip!._id as string,
          this.trip.activeTrip,
          this.trip.activeTrip!._rev as string
          ).then( async () => {
            this.transferring = false;
            Notify.create({
              message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>Your trip notification has been updated!<br></div><div class=text-h6"><br>If an Observer is required, the Observer Program will be in touch before the trip.<br>&nbsp;<br>&nbsp;</div>',
              position: 'top',
              color: 'primary',
              timeout: 7000,
              html: true,
              multiLine: true
            });
            this.$router.push({ path: '/trips' });
          });
      });
    } else {
      await masterDB.put(
        this.trip.activeTrip!._id as string,
        this.trip.activeTrip,
        this.trip.activeTrip!._rev as string
        ).then( async () => {
            this.transferring = false;
            if (this.trip.activeTrip!.tripStatus!.description === 'open') {
              Notify.create({
                message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>Your trip notification has been updated!<br></div><div class=text-h6"><br>If an Observer is required, the Observer Program will be in touch before the trip.<br>&nbsp;<br>&nbsp;</div>',
                position: 'top',
                color: 'primary',
                timeout: 7000,
                html: true,
                multiLine: true
              });
            } else {
              Notify.create({
                message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>Your trip has been updated!<br></div>',
                position: 'top',
                color: 'primary',
                timeout: 7000,
                html: true,
                multiLine: true
              });
            }
            if (this.trip.activeTrip!.isSelected) {
              emailCoordinators(this.trip.activeTrip, 'UPDATE');
            }
            this.$router.push({ path: '/trips' });
            });
    }

  }

    private async saveSelection() {
      const savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
        };

      // check to see if savedSelections exists, fetch it if it does.
      const vesselId = this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber;
      const fisheryName: any = this.trip.activeTrip!.fishery!.description ? this.trip.activeTrip!.fishery!.description : '';

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

      vesselSelections[fisheryName].push({
            isSelected: this.trip.activeTrip!.isSelected,
            notes: this.trip.activeTrip!.notes ? this.trip.activeTrip!.notes : 'fish',
            selectionDate: this.trip.activeTrip!.selectionDate ? this.trip.activeTrip!.selectionDate : this.trip.activeTrip!.createdDate
      });


      if (vesselSelections._id) {
        await masterDb.put(
          vesselSelections._id,
          vesselSelections,
          vesselSelections._rev
        );
      } else {
        await masterDb.post(vesselSelections);
      }

  }

  private goBack() {
    if (this.newImage) {
      const fileName = this.file.name + ' - ' + authService.getCurrentUser()!.username + ' - ' + moment().format();
      let result: any;
      const reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = async () => {
        result = reader.result;
        this.trip.activeTrip!._attachments = {
                  [fileName] : {
                      content_type: this.file.type,
                      data: result.split(',')[1]
                  }
              };
        this.trip.activeTrip!.changeLog!.unshift(
          {
            updatedBy: authService.getCurrentUser()!.username,
            updateDate: moment().format(),
            property: '_attachments',
            newVal: 'added/updated logbook capture',
            app: 'Observer Web'
          }
        );
        const masterDB: Client<any> = couchService.masterDB;
        this.transferring = true;
        return await masterDB.put(
          this.trip.activeTrip!._id as string,
          this.trip.activeTrip!,
          this.trip.activeTrip!._rev as string
        ).then( () => {
          this.transferring = false;
          this.$router.push({ path: '/trips' });
        });
    };
    } else {
      this.trip.readOnly = false;
      this.$router.push({ path: '/trips' });
    }
  }

  private async getOtsTargets() {
    const masterDb = couchService.masterDB;
    const queryOptions = {
      include_docs: true,
      reduce: false,
      key: 'ots-target'
    };
    try {
      const otsTargets = await masterDb.view(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      this.otsTargets = otsTargets.rows.map((row: any) => row.doc);
    } catch (err) {
      console.log(err);
    }
  }

  private async getPorts() {
        const masterDb = couchService.masterDB;
        const queryOptions = {
          start_key: '',
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const ports = await masterDb.view(
          'obs_web',
          'all_port_names',
          queryOptions
        );
        this.ports = ports.rows.map((row: any) => row.doc);
  }

  private updateDates() {
    if (this.trip.activeTrip!.isSingleDayTrip) {
      if (this.trip.activeTrip!.returnDate) {
        this.tripDate = new Date(this.trip.activeTrip!.returnDate);
      }
    } else {
      if (this.trip.activeTrip!.departureDate) {
        this.tripDates[0] = new Date(this.trip.activeTrip!.departureDate);
      }
      if (this.trip.activeTrip!.returnDate) {
        this.tripDates[1] = new Date(this.trip.activeTrip!.returnDate);
      }
    }
  }

  private get isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true;
    } else {
      return false;
    }
  }

  private get getValidHours() {
    if (this.existingTripEnd &&
        moment(this.existingTripEnd).isSame(this.trip.activeTrip!.departureDate, 'day') &&
        moment(this.existingTripStart).isSame(this.trip.activeTrip!.departureDate, 'day')) {
      return [[parseInt(moment(this.existingTripStart).format('HH'), 10) + 1, 23]];
    } else {
      return [[0, 23]];
    }
  }

  private resetDepartureTime() {
    this.departureTime = {
        mm: '00',
        HH: '00'
      };
    this.departureTimeEntered = false;
  }

  private async created() {
    this.getEmRoster().then( () => {
      let emPermit = null;
      const permitNum = this.emRoster[this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber];
      for (const permit of this.permit.permits) {
        if (permit.permitNumber === permitNum) {
          emPermit = permit;
        }
      }
      if (emPermit) {
        Vue.set(this.trip.activeTrip!, 'permits', [emPermit]);
      }

    });
    if ( authService.getCurrentUser() ) {
      this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
    }
    this.getMaxDate();
    this.getMinDate();
    this.getOtsTargets();
    // this.getLatestDepartureDate();
    this.getBookedDates();
    this.getPorts();
    this.getFisheryOptions();
    this.setDepartureTime();
    this.updateDates();
    if (this.trip.activeTrip!.departureDate) {
      this.departureTimeEntered = true;
    }
    this.savedMaxRetention = this.trip.activeTrip!.maximizedRetention;
  }

  @Watch('trip.activeTrip.isSingleDayTrip')
  private handler11(newVal: boolean, oldVal: boolean) {
      this.departureTimeEntered = false;
      this.departureTime = {
        mm: '00',
        HH: '00'
      };
  }

  @Watch('tripDates')
  private handler2(newVal: string, oldVal: string) {

    if (this.tripDates[0]) {
      this.trip.activeTrip!.departureDate = moment(newVal[0]).format();

      // if start date is after current end date
      if (this.trip.activeTrip!.returnDate && moment(this.tripDates[0]).isAfter(moment(this.trip.activeTrip!.returnDate))) {
        this.trip.activeTrip!.returnDate = undefined;
        this.tripDates[1] = undefined;
      }
    }

    if (this.tripDates[1]) {
      // if end date is before current start date
      if (this.trip.activeTrip!.departureDate && moment(this.tripDates[1]).isBefore(moment(this.trip.activeTrip!.departureDate))) {
        this.trip.activeTrip!.departureDate = moment(this.tripDates[1]).format();
        this.tripDates[0] = this.tripDates[1];
        this.resetDepartureTime();
      }

      this.trip.activeTrip!.returnDate = moment(this.tripDates[1]).format();
    }

    if (this.departureTime) {
      this.trip.activeTrip!.departureDate = moment(this.trip.activeTrip!.departureDate).minute(this.departureTime.mm).hour(this.departureTime.HH).second(0).format();
    }

  }

  @Watch('tripDate')
  private handler9(newVal: any, oldVal: any) {
    if (oldVal) {
      this.departureTimeEntered = false;
      this.departureTime = {
        mm: '00',
        HH: '00'
      };
    }
    this.trip.activeTrip!.departureDate = moment(newVal).format();
    this.trip.activeTrip!.returnDate = moment(newVal).format();

    if (this.departureTime) {
      this.trip.activeTrip!.departureDate = moment(this.trip.activeTrip!.departureDate).minute(this.departureTime.mm).hour(this.departureTime.HH).second(0).format();
    }

  }

  @Watch('trip.activeTrip.departurePort', {deep: true})
  private handler3(newVal: any, oldVal: any) {
    if (this.trip.activeTrip) {
      this.trip.activeTrip.returnPort = this.trip.activeTrip!.departurePort;
    }
  }

  @Watch('trip.activeTrip', {deep: true})
  private handler77(newVal: any, oldVal: any) {
    if ( !this.trip.newTrip ) { // only logging changes to existing trips
      if ( !this.trip.activeTrip!.changeLog ) { this.trip.activeTrip!.changeLog = []; }
      try {
        let oldValString: string = '';
        let newValString: string = '';
        for (const attrib of Object.keys(newVal)) {
          if ( !_.isEqual(newVal[attrib], this.oldTrip[attrib] ) && attrib !== 'changeLog') { // import _ from 'lodash'
            if ( typeof newVal[attrib] === 'object' ) {
              oldValString = JSON.stringify(_.pick(this.oldTrip[attrib], ['name', 'state']));  // remove all but desired properties - returns a new object.
              newValString = JSON.stringify(_.pick(newVal[attrib], ['name', 'state', 'non-existent-property'])); // property will not be in new object if not found in old object.
            } else {
              oldValString = this.oldTrip[attrib];
              newValString = newVal[attrib];
            }
            this.trip.activeTrip!.changeLog.unshift(
              {
                updatedBy: authService.getCurrentUser()!.username,
                updateDate: moment().format(),
                property: attrib,
                oldVal: oldValString,
                newVal: newValString,
                app: 'Observer Web'
              }
            );
          }
        }
      } catch (err) {
        console.log(err);
      }
      this.oldTrip = JSON.parse(JSON.stringify(newVal));  // try catch will log error on page load, then store a copy of activeTrip in this.oldTrip
    }
  }

}
</script>

<style scoped>

.trips-el-height {
  height: 40px;
}

* >>> .p-datepicker {
  padding: 0 !important
}

p {
  margin-bottom: 5px;
}

* >>> .q-field {
  padding-bottom: 5px;
}

* >>> .p-inputtext {
  font-weight: bold !important;
  border: none !important;
  border-bottom: 1px solid rgba(0,0,0,0.24) !important;
  padding-top: 0 !important;
  border-radius: 0 !important;
  padding-left: 0 !important;
  margin: 0 !important;
  width: 100%;
}

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

* >>> .timeselector__box__item--is-selected {
  background-color: #007EC6 !important;
}

* >>> .vtimeselector__input {
  border: none !important;
}

* >>> .vtimeselector__input:focus {
  outline: none !important;
}

* >>> .vtimeselector__clear {
  display: none;
}

* >>> .active {
  height: inherit !important;
  background-color: #007EC6 !important;
}

* >>> .vue__time-picker input.display-time {
  border: none;
  border-bottom: 1px solid lightgrey;
  width: 150px;
}

* >>> .vue__time-picker input.disabled {
  color: #1f1f1f !important;
  background-color: white !important;
}

@media screen and (max-width: 290px){
  * >>> .vue__time-picker {
    width: 50px !important;
  }
}

</style>


