<template>
  <div>
      <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
          <q-btn flat label="Dismiss" @click="clearAlert"/>
        </template>
      </q-banner>

  <div :disabled="trip.readOnly">
        <div class="text-h6 q-pa-md" style="margin-bottom: 10px;">
          <!-- {{ vessel.activeVessel.vesselName }} -->
          <div v-if="trip.activeTrip.fishery.description"> {{ trip.activeTrip.fishery.description }}</div>

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
          <p style="padding-left: 20px">
            <strong :disabled="trip.readOnly">Trip Dates (start to end)</strong>
          </p>
          <span>
            <pCalendar
              v-if="tripDates"
              v-model="tripDates"
              :minDate="minDate"
              :maxDate="maxDate"
              :disabledDates="invalidDates"
              :inline="true"
              :touchUI="false"
              placeholder="start / end"
              selectionMode="range"
              onfocus="blur();"
              style="width: 100%;"
              >
            </pCalendar>

            <div v-if="trip.activeTrip.departureDate" style="margin: 15px 0 0 15px ; font-weight: bold">Departure Time (24H)
            <pCalendar
              v-model="departureTime"
              :showTime="true"
              :timeOnly="true"
              hourFormat="24"
              onfocus="blur();"
              :touchUI="false"
              style="margin-left: 10px"
            >
            </pCalendar>
            </div>

          </span>
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
          :option-label="opt => opt.permitNumber + ' - ' + opt.permitType"
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
          :disabled="trip.readOnly"
          :options="[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
              {label: 'Don\'t know', value: null}
            ]"
          >
          </q-btn-toggle>
        </div>
      </div>

      <div v-if="trip.newTrip" align="right" class="text-primary" style="padding-right: 10px">
        <q-btn label="Cancel" @click="goToTrips"/>
        &nbsp;
        <q-btn label="Create Trip" color="primary" @click="createTrip"/>
      </div>
      <div v-else align="right" class="text-primary" style="padding-right: 10px">
        <q-btn label="Cancel Edit" @click="goToTrips" v-if="!trip.readOnly"></q-btn>
        &nbsp;
        <q-btn label="Update Trip" color="primary" @click="updateTrip" v-if="!trip.readOnly"></q-btn>
      </div>

    <q-dialog v-model="missingRequired">
          <div class="text-h6">
            You must specify a fishery.
          </div>
        <div style="float: right;">
          <q-btn color="primary" @click="missingRequired = false" label="ok"/>
        </div>
    </q-dialog>

    <q-dialog v-model="daysWarn">
      <q-card>
        <q-card-section>
        <div class="text-h6">
          Trip start date is less than 48 hours from now! If selected for observer coverage an observer will be provided ASAP but trip may be delayed up to 48 hours.
        </div>
        </q-card-section>
        <q-card-section class="float-right">
          <q-btn color="primary" @click="daysWarn = false" label="OK"/>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
        <div align="right" class="q-pa-md q-gutter-md">
          <q-btn label="Close" color="primary" @click="goBack" v-if="trip.readOnly"></q-btn>
        </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { date } from 'quasar';
import {
  TripState,
  PermitState,
  UserState,
  GeneralState,
  VesselState,
  AlertState
} from '../_store/types/types';
import { Permit, OTSTarget } from '@boatnet/bn-models';

import moment from 'moment';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
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
  Fishery,
  TripSelection
} from '@boatnet/bn-models';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

import { Notify } from 'quasar';

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
  private invalidDates: any[] = [];
  private minDate: any = null;
  private maxDate: any = null;
  private daysWarn: boolean = false;
  private emRoster: any = {};
  private maximizedRetention: any = null;

  constructor() {
    super();
  }

  private getDate(myDate: string) {
    return moment(myDate).format();
  }

  // private fisheriesFilterFn(val: string, update: any, abort: any) {
  //   update(async () => {
  //     try {
  //       const db = pouchService.db;
  //       const queryOptions: ListOptions = {
  //         start_key: val.toLowerCase(),
  //         inclusive_end: true,
  //         descending: false
  //       };

  //       const fisheries = await db.query(
    //         'obs_web/all_fisheries',
  //         queryOptions,
  //         pouchService.lookupsDBName
  //       );
  //       this.fisheryOptions = fisheries.rows.map((row: any) => row.value);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   });
  // }

  private async getFisheryOptions() {
    const db = pouchService.db;
    const queryOptions = {
      reduce: false,
      include_docs: true,
      key: 'fishery'
    };

    const fisheries = await db.query(
      'obs_web/all_doc_types',
      queryOptions,
      pouchService.lookupsDBName
    );
    this.fisheryOptions = fisheries.rows.map((row: any) => row.doc);

    this.fisheryOptions.sort( (a: any, b: any) => {
      if (a.description > b.description) {
        return 1;
      } else if (a.description < b.description) {
        return -1;
      } else {
        return 0;
      }
    });
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
        const db = pouchService.db;
        const queryOptions = {
          // limit: 5,
          start_key: val.toLowerCase(),
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const ports = await db.query(
          'obs_web/all_port_names',
          queryOptions,
          pouchService.lookupsDBName
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
        const db = pouchService.db;
        const queryOptions = {
          // limit: 5,
          start_key: val.toLowerCase(),
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const ports = await db.query(
          'obs_web/all_port_names',
          queryOptions,
          pouchService.lookupsDBName
        );
        this.ports = ports.rows.map((row: any) => row.doc);
        this.ports.unshift({ name: 'SAME AS START' });
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
    const db = pouchService.db;
    const queryOptions = {
      key: 'emefp',
      inclusive_end: true,
      reduce: false,
      include_docs: true
    };
    const EMEfpRoster = await db.query('obs_web/all_doc_types', queryOptions, pouchService.lookupsDBName);

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

  private async createTrip() {

    // REQUIRES A FISHERY!
    // first check whether there is a stored selection for the vessel and fishery

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

    if (this.trip.activeTrip!.fishery!.description !== '') {
      let savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
      };
      const db = pouchService.db;
      let docs = await db.allDocs();

      const vesselName: string = this.vessel.activeVessel.vesselName;
      const fisheryName: string = this.trip.activeTrip!.fishery!.description!;

      for (const row of docs.rows) {
        if (row.doc.type === 'saved-selections') {
          savedSelections = row.doc;
        }
      }

      if (!savedSelections[vesselName]) {
        savedSelections[vesselName] = {};
      }

      if (!savedSelections[vesselName][fisheryName]) {
        savedSelections[vesselName][fisheryName] = [];
      }

      if (!this.trip.activeTrip!.maximizedRetention) {


        // apply selection to new trip
        let tripSelection: any = null;

        if (savedSelections[vesselName] && savedSelections[vesselName][fisheryName] && savedSelections[vesselName][fisheryName].length > 0) {
          if (savedSelections[vesselName][fisheryName].length > 1) {
            const sel1 = savedSelections[vesselName][fisheryName][0].selectionDate;
            const sel2 = savedSelections[vesselName][fisheryName][1].selectionDate;
            if (moment(sel1).isBefore(sel2, 'second')) {
              tripSelection = savedSelections[vesselName][fisheryName].shift();
            } else {
              tripSelection = savedSelections[vesselName][fisheryName].pop();
            }
          } else {
            tripSelection = savedSelections[vesselName][fisheryName].pop();
          }

          pouchService.db.post(savedSelections);

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

      pouchService.db.post(this.trip.activeTrip);

      if (!savedSelections[vesselName]) {
        savedSelections[vesselName] = {};
      }

      if (!savedSelections[vesselName][fisheryName]) {
        savedSelections[vesselName][fisheryName] = [];
      }

      if (!savedSelections[vesselName][fisheryName] || savedSelections[vesselName][fisheryName].length < 1) {
        const activeOTSTarget: any = this.getActiveOtsTarget();
        const randomNum = Math.floor(Math.random() * 100);

        const newSelection: any = {
          vesselName,
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

        docs = await db.allDocs().then(
          (res: any) => {
            for (const row of res.rows) {
              if (row.doc.type === 'saved-selections') {
                savedSelections = row.doc;

                if (!savedSelections[vesselName]) {
                  savedSelections[vesselName] = {};
                }

                if (!savedSelections[vesselName][fisheryName]) {
                  savedSelections[vesselName][fisheryName] = [];
                }
              }
            }
            savedSelections[vesselName][fisheryName].push(newSelection);
            pouchService.db.post(savedSelections);
          }
        );
      }

      this.$router.push({ path: '/trips/' });

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

  get departureTime(): Date | undefined {
    if (this.trip.activeTrip) {
      return new Date(moment(this.trip.activeTrip.departureDate).format());
    }
  }

  set departureTime(value) {
    if (this.trip.activeTrip) {
      this.trip.activeTrip.departureDate = moment(value).format();
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
    const db = pouchService.db;
    const docs = await db.allDocs();

    if (this.trip.index === 0 && !this.trip.newTrip) {

    for (const row of docs.rows) {
      if ( row.doc.type === 'wcgop-trip' && row.doc.vessel.vesselName === this.trip.activeTrip!.vessel!.vesselName && row.doc._id !== this.trip.activeTrip!._id) {
        if (row.doc.tripStatus.description === 'open') {
          this.maxDate = new Date(moment(row.doc.departureDate).add(1, 'days').format());
        }
      }
    }
  }
}

private async getMinDate() {
  if (this.trip.index === 1) {
    const db = pouchService.db;
    const docs = await db.allDocs();

    for (const row of docs.rows) {
      if ( row.doc.type === 'wcgop-trip' && row.doc.vessel.vesselName === this.trip.activeTrip!.vessel!.vesselName && row.doc._id !== this.trip.activeTrip!._id) {
        if (row.doc.tripStatus.description === 'open') {
          this.minDate = new Date(moment(row.doc.returnDate).subtract(1, 'days').format());
        }
      }
    }
  } else if (this.trip.newTrip) {
    this.minDate = new Date();
  } else {
    this.minDate = undefined;
  }
}

  private async getBookedDates() {
    const db = pouchService.db;
    const docs = await db.allDocs();
    let i = 0;

    for (const row of docs.rows) {
      if ( row.doc.type === 'wcgop-trip' && row.doc.vessel.vesselName === this.trip.activeTrip!.vessel!.vesselName && row.doc._id !== this.trip.activeTrip!._id) {
        if (row.doc.tripStatus.description === 'open') {
          {
             this.existingTripStart = row.doc.departureDate;
             this.existingTripEnd = row.doc.returnDate;
             const days = moment(row.doc.returnDate).diff(row.doc.departureDate, 'days');
             for (i = 0; i < days; i++) {
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

  private updateTrip() {
    this.trip.activeTrip!.updatedBy = authService.getCurrentUser()!.username;
    this.trip.activeTrip!.updatedDate = moment().format();
    if (this.trip.activeTrip!.isSelected && this.trip.activeTrip!.maximizedRetention) {

      this.saveSelection().then(
        () => {
          this.trip.activeTrip!.isSelected = false;
          this.trip.activeTrip!.notes = 'Maximized Retention chosen - selection removed';
          pouchService.db.put(this.trip.activeTrip);
          this.$router.push({ path: '/trips' });
        }
      );
    } else {
      pouchService.db.put(this.trip.activeTrip);
      this.$router.push({ path: '/trips' });
    }

  }

    private async saveSelection() {
      let savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
        };

      // check to see if savedSelections exists, fetch it if it does.
      const db = pouchService.db;
      const docs = await db.allDocs();
      const vesselName: any = this.trip.activeTrip!.vessel!.vesselName;
      const fisheryName: any = this.trip.activeTrip!.fishery!.description;

      for (const row of docs.rows) {
        if (row.doc.type === 'saved-selections') {
          savedSelections = row.doc;
          savedSelections.updatedBy = authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined;
          savedSelections.updatedDate = moment().format();
        }
      }

      if (!savedSelections[vesselName]) {
        savedSelections[vesselName] = {};
      }
      if (!savedSelections[vesselName][fisheryName]) {
        savedSelections[vesselName][fisheryName] = [];
      }

      savedSelections[vesselName][fisheryName].push({
                            vesselName,
                            isSelected: this.trip.activeTrip!.isSelected,
                            notes: this.trip.activeTrip!.notes,
                            selectionDate: this.trip.activeTrip!.selectionDate ? this.trip.activeTrip!.selectionDate : this.trip.activeTrip!.createdDate
                          });
      pouchService.db.post(savedSelections);
  }

  private goBack() {
    this.trip.readOnly = false;
    this.$router.push({ path: '/trips' });
  }

  private async getOtsTargets() {
    const db = pouchService.db;
    const queryOptions = {
      include_docs: true,
      reduce: false,
      key: 'ots-target'
    };
    try {
      const otsTargets = await db.query(
        'obs_web/all_doc_types',
        queryOptions,
        pouchService.lookupsDBName
      );

      this.otsTargets = otsTargets.rows.map((row: any) => row.doc);
    } catch (err) {
      console.log(err);
    }
  }

  private async getPorts() {
        const db = pouchService.db;
        const queryOptions = {
          // limit: 5,
          start_key: '',
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const ports = await db.query(
          'obs_web/all_port_names',
          queryOptions,
          pouchService.lookupsDBName
        );
        this.ports = ports.rows.map((row: any) => row.doc);
  }

  private created() {
    console.log(this.trip);
    this.getEmRoster().then( () => {
      let emPermit = null;
      const permitNum = this.emRoster[this.vessel.activeVessel.coastGuardNumber];
      for (const permit of this.permit.permits) {
        if (permit.permitNumber === permitNum) {
          emPermit = permit;
        }
      }
      if (emPermit) {
        Vue.set(this.trip.activeTrip!, 'permits', [emPermit]);
      }
    });
    this.getMaxDate();
    this.getMinDate();
    this.getOtsTargets();
    // this.getLatestDepartureDate();
    this.getBookedDates();
    this.getPorts();
    this.getFisheryOptions().then( () => {
        // default to EM EFP for now
        for (const fishery of this.fisheryOptions) {
          if (fishery.description === 'Electronic Monitoring EFP') {
            Vue.set(this.trip.activeTrip!, 'fishery', fishery);
          }
        }
    });
    if (this.trip.activeTrip!.departureDate) {
      this.tripDates[0] = new Date(this.trip.activeTrip!.departureDate);
    }
    if (this.trip.activeTrip!.returnDate) {
      this.tripDates[1] = new Date(this.trip.activeTrip!.returnDate);
    }

  }

  @Watch('tripDates')
  private handler2(newVal: string, oldVal: string) {
    if (newVal[0]) {
      if (moment(newVal[0]).diff(moment(), 'day') < 2 && this.trip.activeTrip!.departureDate !== moment(newVal[0]).format() && moment(newVal[0]) >= moment()) {
        this.daysWarn = true;
      }
      this.trip.activeTrip!.departureDate = moment(newVal[0]).format();
      if (!newVal[1]) {
        this.trip.activeTrip!.returnDate = moment(newVal[0]).format();
      }
    }
    if (newVal[1]) {
      this.trip.activeTrip!.returnDate = moment(newVal[1]).format();
    }
    if (moment(newVal[0]) < moment(this.existingTripStart) && moment(newVal[1]) > moment(this.existingTripStart)) {
      this.tripDates[1] = new Date(moment(this.existingTripStart).subtract(1, 'days').format());
      this.trip.activeTrip!.returnDate = moment(this.existingTripStart).subtract(1, 'days').format();
    }
  }

  @Watch('trip.activeTrip.departurePort', {deep: true})
  private handler3(newVal: any, oldVal: any) {
    if (!this.trip.newTrip) {
      if (!this.trip.activeTrip!.changeLog) {
        this.trip.activeTrip!.changeLog = [];
      }
      this.trip.activeTrip!.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format('MM/DD/YYYY HH:MM A'),
          change: 'Departure Port changed from ' + oldVal.name + ' to ' + newVal.name
        }
      );
    }
  }

  @Watch('trip.activeTrip.returnPort', {deep: true})
  private handler4(newVal: any, oldVal: any) {
    if (!this.trip.newTrip) {
      if (!this.trip.activeTrip!.changeLog) {
        this.trip.activeTrip!.changeLog = [];
      }
      this.trip.activeTrip!.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format('MM/DD/YYYY HH:MM A'),
          change: 'Return Port changed from ' + oldVal.name + ' to ' + newVal.name
        }
      );
    }
  }

  @Watch('trip.activeTrip.departureDate', {deep: true})
  private handler5(newVal: any, oldVal: any) {
    if (!this.trip.newTrip) {
      if (!this.trip.activeTrip!.changeLog) {
        this.trip.activeTrip!.changeLog = [];
      }
      this.trip.activeTrip!.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format('MM/DD/YYYY HH:MM A'),
          change: 'Departure Date changed from ' + moment(oldVal).format('MM/DD/YYYY HH:MM A') + ' to ' + moment(newVal).format('MM/DD/YYYY HH:MM A')
        }
      );
    }
  }

  @Watch('trip.activeTrip.returnDate', {deep: true})
  private handler6(newVal: any, oldVal: any) {
    if (!this.trip.newTrip) {
      if (!this.trip.activeTrip!.changeLog) {
        this.trip.activeTrip!.changeLog = [];
      }
      this.trip.activeTrip!.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format('MM/DD/YYYY HH:MM A'),
          change: 'Return Date changed from ' + moment(oldVal).format('MM/DD/YYYY HH:MM A') + ' to ' + moment(newVal).format('MM/DD/YYYY HH:MM A')
        }
      );
    }
  }

  @Watch('trip.activeTrip.maximizedRetention', {deep: true})
  private handler7(newVal: any, oldVal: any) {
    if (!this.trip.newTrip) {
      if (!this.trip.activeTrip!.changeLog) {
        this.trip.activeTrip!.changeLog = [];
      }
      this.trip.activeTrip!.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format('MM/DD/YYYY HH:MM A'),
          change: 'Maximized Retention changed from ' + oldVal + ' to ' + newVal
        }
      );
    }
  }

  @Watch('trip.activeTrip.notes', {deep: true})
  private handler8(newVal: any, oldVal: any) {
    if (!this.trip.newTrip) {
      if (!this.trip.activeTrip!.changeLog) {
        this.trip.activeTrip!.changeLog = [];
      }
      this.trip.activeTrip!.changeLog.unshift(
        {
          updatedBy: authService.getCurrentUser()!.username,
          updateDate: moment().format('MM/DD/YYYY HH:MM A'),
          change: 'Notes updated: ' + newVal
        }
      );
    }
  }


}
</script>

<style lang="stylus">
.my-card {
  width: 95%;
}
.p-datepicker {
  padding: 0 !important
}

</style>

<style>
p {
  margin-bottom: 5px;
}
.q-field {
  padding-bottom: 5px;
}

.p-inputtext {
  font-weight: bold !important;
  border: none !important;
  border-bottom: 1px solid rgba(0,0,0,0.24) !important;
  padding-top: 0 !important;
  border-radius: 0 !important;
  padding-left: 0 !important;
}

</style>


