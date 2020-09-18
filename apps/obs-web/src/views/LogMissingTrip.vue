<template>

    <div id="lb">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>
        <div style="text-align: center; background-color: red; color:white; padding: 10px; border-radius: 4px; margin: 15px"><b>WARNING: This form should be used to enter landed, un-logged trips only.</b></div>

        <div>

        <div class="q-pa-md">
            <span class="text-h6">Trip Dates</span>
            {{ formatDateTime(trip.activeTrip.departureDate) }} | {{ formatFullDate(trip.activeTrip.returnDate) }}
        </div>

        <div class="trips el-height">
            <q-toggle
                v-model="trip.activeTrip.isSingleDayTrip"
                color="primary"
                label="Single Day Trip"
            ></q-toggle>
        </div>

          <div class="row items-start">
            <div class="trips-el-height">
              <span v-if="!trip.activeTrip.isSingleDayTrip" class="date-label">Departure Date</span>
                <pCalendar
                  v-if="!trip.activeTrip.isSingleDayTrip"
                  v-model="tripDates[0]"
                  :maxDate="maxDate"
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
                v-if="trip.activeTrip.isSingleDayTrip"
                v-model="tripDate"
                :maxDate="maxDate"
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
              <timepicker manual-input hide-clear-button close-on-complete v-model="departureTime" lazy @input="updateDepartureDate">
              </timepicker>
            </div>

            <div class="trips-el-height">
              <span v-if="!trip.activeTrip.isSingleDayTrip" class="date-label">Return Date</span>
              <pCalendar
                v-if="!trip.activeTrip.isSingleDayTrip"
                v-model="tripDates[1]"
                :maxDate="maxDate"
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
          use-input
          hide-selected
          clearable
        ></q-select>

        <p style="margin: 0">
          <strong>Permits</strong>
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
          style="padding-bottom: 5px"
        ></q-select>

        <div v-if="trip.activeTrip.fishery.description === 'Electronic Monitoring EFP'">
          <strong>Maximized Retention?</strong><br>
          <q-btn-toggle
          v-model="trip.activeTrip.maximizedRetention"
          toggle-color="primary"
          :options="[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
              {label: 'Don\'t know', value: null}
            ]"
          >
          </q-btn-toggle>
          <br><br>
        </div>

        <div >
          <strong>Was Trip Observed? </strong><br>
          <q-btn-toggle
          v-model="trip.activeTrip.isSelected"
          toggle-color="primary"
          :options="[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
            ]"
          >
          </q-btn-toggle>
        </div>
        </div>

        <file-uploader
            v-if="tripComplete()"
            label="Logbook Capture"
            :trip="trip.activeTrip"
            submitAction="Submit Image(s)"
            style=""
        />

        <div style="text-align: center">All details (including logbook capture) must be completed before missing trip can be submitted.</div>

        <div align="right" style="padding-right: 10px">
            <q-btn class="text-primary" label="Cancel" @click="goToTrips"/>
            &nbsp;
            <q-btn v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode" color="red" label="submit without image" @click="submitTripOnly" :disabled="disableCreate"></q-btn>
        </div>

        <q-dialog v-model="sameDatesWarning">
            <q-card>
            <q-card-section>
                <div class="text-h6">
                A trip with the same start and end date has already been submitted - are you sure you want to submit another trip with the same dates?
                </div>
                <div style="float: right;" >
                    <q-btn color="primary" @click="submitAnyway" label="submit"/>
                    &nbsp;
                    <q-btn color="red" @click="sameDatesWarning = false" label="cancel"/>
                </div>
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TripState, PermitState, UserState, VesselState, AlertState } from '../_store/types/types';

import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService } from '@boatnet/bn-auth';

import { WcgopTrip, Fishery, Vessel } from '@boatnet/bn-models';

import FileUploader from '../components/FileUploader.vue';

import moment from 'moment';
import { Notify } from 'quasar';

import { newTripsApiTrip, getTripsApiTrips, emailCoordinators } from '@boatnet/bn-common';

@Component({
  components: {
    'file-uploader': FileUploader
  }
})
export default class LogBookCapture extends Vue {
    @State('trip') private trip!: TripState;
    @State('permit') private permit!: PermitState;
    @State('user') private user!: UserState;
    @State('vessel') private vessel!: VesselState;

    @State('alert') private alert!: AlertState;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;

    private file: any = null;
    private fileUrl: any = null;

    private dbImage: any = null;
    private dbImageUrl: any = null;

    private tripDates: any = [];
    private tripDate: any = null;
    private ports: any = [];
    private fisheryOptions: Fishery = [];
    private authorizedVessels: Vessel = [];

    private transferring: boolean = false;
    private maxDate: any = new Date(moment().format());
    private tripsApiNum: any = 0;
    private departureTime: any = null;
    private userRoles: string[] = [];

    private sameDatesWarning: boolean = false;
    private confirmedSameDaysSubmission: boolean = false;
    private emRoster: any = {};
    private departureTimeEntered: boolean = false;
    private disableCreate: boolean = false;

    private isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (this.userRoles.includes(role)) {
          return true;
        }
      }
      return false;
    }

    private handleImage(event: any) {
        this.file = event!.target!.files[0];
        this.fileUrl = URL.createObjectURL(this.file);
    }

    private submitAnyway() {
        this.confirmedSameDaysSubmission = true;
        this.submitTripOnly();
    }

    private async submitTripOnly() {

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

        if (this.trip.activeTrip!.fishery!.description === '') {
            Notify.create({
                message: '<b>A trip must have a fishery.</b>',
                position: 'center',
                color: 'primary',
                timeout: 2000,
                icon: 'warning',
                html: true,
                multiLine: true
            });
            return;
        }

        if (typeof this.trip.activeTrip!.isSelected === 'undefined' ) {
            Notify.create({
                message: '<b>Was Trip Observed? is required.</b>',
                position: 'center',
                color: 'primary',
                timeout: 2000,
                icon: 'warning',
                html: true,
                multiLine: true
            });
            return;
        }

        this.disableCreate = true;
        this.trip.activeTrip!.vesselId = this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber;

        if (!this.confirmedSameDaysSubmission) {
            const vesselTrips: any = await getTripsApiTrips('vesselId', this.trip.activeTrip!.vesselId);
            const sameDatesTrips = vesselTrips.filter(
                (trip: any) => {
                    return moment(trip.departureDate).isSame(this.trip.activeTrip!.departureDate, 'day') && moment(trip.returnDate).isSame(this.trip.activeTrip!.returnDate, 'day');
            } );
            if (sameDatesTrips.length > 0) {
                this.sameDatesWarning = true;
                return;
            }
        }

        this.sameDatesWarning = false;
        this.confirmedSameDaysSubmission = false;

        const newApiTrip = {
            vesselId: this.trip.activeTrip!.vesselId,
            vesselName: this.trip.activeTrip!.vessel!.vesselName,
            departurePort: this.trip.activeTrip!.departurePort!.code ? this.trip.activeTrip!.departurePort!.code : this.trip.activeTrip!.departurePort!.name,
            departureDate: this.trip.activeTrip!.departureDate,
            returnPort: this.trip.activeTrip!.returnPort!.code ? this.trip.activeTrip!.returnPort!.code : this.trip.activeTrip!.returnPort!.name,
            returnDate: this.trip.activeTrip!.returnDate,
            permits: this.trip.activeTrip!.permits ? this.trip.activeTrip!.permits.map((permit: any) => permit.permitNumber) : [],
            fishery: this.trip.activeTrip!.fishery!.description,
            createdBy: this.trip.activeTrip!.createdBy,
            createdDate: this.trip.activeTrip!.createdDate
        };


        await newTripsApiTrip(newApiTrip).then( (res: any) => this.tripsApiNum = res.tripNum);
        this.trip.activeTrip!.tripNum = this.tripsApiNum;

        this.trip.activeTrip!.changeLog.unshift(
            {
                updatedBy: authService.getCurrentUser()!.username,
                updateDate: moment().format('MM/DD/YYYY HH:mm A'),
                property: '_attachments',
                newVal: 'submitted trip wihtout image capture',
                app: 'Observer Web'
            }
        );
        emailCoordinators(this.trip.activeTrip, 'MISSED TRIP');
        const masterDB: Client<any> = couchService.masterDB;
        this.transferring = true;
        return await masterDB.post(
            this.trip.activeTrip
            ).then( () => {
                this.transferring = false;
                Notify.create({
                    message: 'Missed Trip Submitted',
                        position: 'center',
                        color: 'green',
                        timeout: 2000,
                        icon: 'emoji_emotions',
                        html: true,
                        multiLine: true
                    });
                this.$router.push({ path: '/trips' });
            });
    }

    private newTrip() {
        const newTrip: WcgopTrip = {
                            createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
                            createdDate: moment().format(),
                            type: 'ots-trip',
                            tripNum: 0,
                            vessel: this.vessel.activeVessel!,
                            // permits: [],
                            // messages: [],
                            departureDate: '',
                            departurePort: this.vessel.activeVessel.homePort ? this.vessel.activeVessel.homePort : '',
                            returnDate: '',
                            returnPort: this.vessel.activeVessel.homePort ? this.vessel.activeVessel.homePort : '',
                            isSelected: undefined,
                            isSingleDayTrip: false,
                            isMissedTrip: true,
                            fishery: {description: undefined},
                            tripStatus: {
                              description: 'closed'
                            },
                            closingReason: 'missed trip',
                            maximizedRetention: null,
                            changeLog: [
                                    {
                                        updatedBy: authService.getCurrentUser()!.username,
                                        updateDate: moment().format('MM/DD/YYYY HH:mm A'),
                                        property: 'tripStatus',
                                        newVal: 'trip logged',
                                        app: 'Observer Web'
                                    }
                                ]
                            };
        this.trip.activeTrip = newTrip;
    }

    private tripComplete() {
        if (
            this.trip.activeTrip!.departureDate
            && this.trip.activeTrip!.fishery!.description
            && this.trip.activeTrip!.isSelected !== undefined
        ) {
            return true;
        } else {
            return false;
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
            queryOptions
        );

        this.fisheryOptions = fisheries.rows.map((row: any) => row.doc);
        this.fisheryOptions = this.fisheryOptions.filter((option: any) => option.description === 'Electronic Monitoring EFP'); // only EM EFP

        // this.fisheryOptions.sort( (a: any, b: any) => {
        // if (a.description > b.description) {
        //     return 1;
        // } else if (a.description < b.description) {
        //     return -1;
        // } else {
        //     return 0;
        // }
        // });

        this.trip.activeTrip!.fishery = this.fisheryOptions[0];  // set to EM EFP
    }

    private async getAuthorizedVessels() {
        const masterDb: Client<any> = couchService.masterDB;

        const queryOptions = {
            key: 'vessel-permissions',
            reduce: false,
            include_docs: true
        };

        const permissionsQuery: any = await masterDb.view<any>(
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

        const vesselQuery: any = await masterDb.view(
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

    private startPortsFilterFn(val: string, update: any, abort: any) {
        update(async () => {
        try {
            const masterDb = couchService.masterDB;
            const queryOptions = {
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

    private endPortsFilterFn(val: string, update: any, abort: any) {
        update(async () => {
        try {
            const masterDb = couchService.masterDB;
            const queryOptions = {
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

    private get getVesselPermits() {
        const vesselId = this.vessel.activeVessel!.coastGuardNumber ?
                        this.vessel.activeVessel!.coastGuardNumber : this.vessel.activeVessel!.stateRegulationNumber ?
                        this.vessel.activeVessel!.stateRegulationNumber : '';
        const vesselPermits = this.permit.vesselPermits[vesselId];
        return vesselPermits;
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

    private resetDepartureTime() {
        this.departureTime = {
            mm: '00',
            HH: '00'
        };
        this.departureTimeEntered = false;
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

    private scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    private goToTrips() {
        this.$router.push({ path: '/trips/' });
    }

    private shortFormatDate(date: any) {
        return moment(date).format('MMM Do');
    }

    private formatDepartureTime(date: any) {
        return moment(date).format('HH:mm');
    }

    private formatFullDate(date: any) {
        if (date) {
            return moment(date).format('MM/DD/YYYY');
        }
    }

    private formatDateTime(date: any) {
        if (date) {
            return moment(date).format('MM/DD/YYYY, HH:mm');
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

    private created() {
        if ( authService.getCurrentUser() ) {
            this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
        }
        this.trip.readOnly = false;
        this.newTrip();
        this.getPorts();
        this.getFisheryOptions();
        this.getAuthorizedVessels();
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
        this.updateDates();
        if (this.trip.activeTrip!.departureDate) {
        this.departureTimeEntered = true;
        }

        });
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
        if (this.trip.activeTrip ) {
            this.trip.activeTrip.returnPort = this.trip.activeTrip!.departurePort;
        }
    }

}
</script>

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

* >>> .p-datepicker {
  padding: 0 !important
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

* >>> .vue__time-picker {
  width: 150px
}


</style>