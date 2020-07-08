<template>

    <div id="lb" class="q-pa-md  q-gutter-md">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>
        <div style="text-align: center; background-color: red; color:white; padding: 10px; border-radius: 4px"><b>WARNING: This form should be used to enter landed, un-logged trips only.</b></div>
        <div class="text-h6">
            <b>{{ vessel.activeVessel.vesselName }} ( {{ vessel.activeVessel.coastGuardNumber ? vessel.activeVessel.coastGuardNumber : vessel.activeVessel.stateRegulationNumber }} )</b>
        </div>

        <div>
            <span>
                <span class="text-h6">Trip Dates</span>
                {{ trip.activeTrip.departureDate }} | {{ trip.activeTrip.returnDate }}
                <q-toggle
                    v-model="trip.activeTrip.isSingleDayTrip"
                    color="primary"
                    label="Single Day Trip"
                    :disabled="trip.readOnly"
                ></q-toggle>
                <pCalendar
                    v-if="!trip.activeTrip.isSingleDayTrip"
                    v-model="tripDates"
                    :maxDate="maxDate"
                    :inline="false"
                    :touchUI="true"
                    placeholder="trip start / end"
                    selectionMode="range"
                    style="width: 100%"
                    >
                </pCalendar>

                <pCalendar
                    v-if="trip.activeTrip.isSingleDayTrip"
                    v-model="tripDate"
                    :maxDate="maxDate"
                    :inline="false"
                    :touchUI="true"
                    placeholder="trip date"
                    selectionMode="single"
                    style="width: 100%"
                    >
                </pCalendar>

                <div v-if="trip.activeTrip.departureDate" style="margin: 15px 15px 0 15px ; font-weight: bold">Departure Time (24H)
                    <timepicker manual-input hide-clear-button v-model="departureTime" @change="updateDepartureDate">
                    </timepicker>
                </div>

                <!-- <div v-if="trip.activeTrip.departureDate" style="margin: 15px 0 0 0px ; font-weight: bold">Departure Time (24H)
                    <pCalendar
                        v-model="departureTime"
                        :showTime="true"
                        :timeOnly="true"
                        hourFormat="24"
                        onfocus="blur();"
                        :touchUI="false"
                        style=""
                    >
                    </pCalendar>
                </div> -->
            </span>
        </div>

      <div>

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

        <!-- <q-select
          v-model="trip.activeTrip.permits"
          dense
          bg-color="white"
          color="primary"
          multiple
          use-chips
          stack-label
          label="Permits"
          :option-label="opt => opt.permitNumber + ' - ' + opt.permitType"
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
        </q-select> -->

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

        <q-btn style="float: right" color="primary" label="Cancel" @click="goToTrips"/>

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

import { newTripsApiTrip } from '@boatnet/bn-common';

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

    private handleImage(event: any) {
        this.file = event!.target!.files[0];
        this.fileUrl = URL.createObjectURL(this.file);
    }

    private async submitImage() {

        const newApiTrip = {
            vesselId: this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber,
            vesselName: this.trip.activeTrip!.vessel!.vesselName,
            departurePort: this.trip.activeTrip!.departurePort!.name,
            departureDate: this.trip.activeTrip!.departureDate,
            returnPort: this.trip.activeTrip!.returnPort!.name,
            returnDate: this.trip.activeTrip!.returnDate,
            permits: this.trip.activeTrip!.permits,
            fisheries: this.trip.activeTrip!.fishery!.description,
            createdBy: this.trip.activeTrip!.createdBy,
            createdDate: this.trip.activeTrip!.createdDate
        };

        this.trip.activeTrip!.vesselId = this.trip.activeTrip!.vessel!.coastGuardNumber ? this.trip.activeTrip!.vessel!.coastGuardNumber : this.trip.activeTrip!.vessel!.stateRegulationNumber;

        await newTripsApiTrip(newApiTrip).then( (res: any) => this.tripsApiNum = res.tripNum);
        this.trip.activeTrip!.tripNum = this.tripsApiNum;

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
            this.trip.activeTrip!.changeLog.unshift(
                {
                    updatedBy: authService.getCurrentUser()!.username,
                    updateDate: moment().format('MM/DD/YYYY HH:mm A'),
                    property: '_attachments',
                    newVal: 'added/updated logbook capture',
                    app: 'Observer Web'
                }
            );
            const masterDB: Client<any> = couchService.masterDB;
            this.transferring = true;
            return await masterDB.post(
                this.trip.activeTrip
                ).then( () => {
                    this.transferring = false;
                    Notify.create({
                        message: 'Logbook Capture Successfully Transferred',
                            position: 'center',
                            color: 'green',
                            timeout: 2000,
                            icon: 'emoji_emotions',
                            html: true,
                            multiLine: true
                        });
                    this.$router.push({ path: '/home' });
                });
        };

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

    private updateDepartureDate(value: any) {
        if (this.trip.activeTrip) {
            if (value.data.HH && value.data.mm) {
                this.trip.activeTrip!.departureDate = moment(this.trip.activeTrip!.departureDate).minute(this.departureTime.mm).hour(this.departureTime.HH).second(0).format();
            }
        }
    }

    // get departureTime(): Date | undefined {
    //     if (this.trip.activeTrip) {
    //     return new Date(moment(this.trip.activeTrip.departureDate).format());
    //     }
    // }

    // set departureTime(value) {
    //     if (this.trip.activeTrip) {
    //     this.trip.activeTrip.departureDate = moment(value).format();
    //     }
    // }

    private scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

  private goToTrips() {
    this.$router.push({ path: '/trips/' });
  }

    private created() {
        this.newTrip();
        this.getPorts();
        this.getFisheryOptions();
        this.getAuthorizedVessels();
    }

    @Watch('tripDates')
    private handler1(newVal: string, oldVal: string) {
        if (newVal[0]) {
            this.trip.activeTrip!.departureDate = moment(newVal[0]).format();
            if (!newVal[1]) {
                this.trip.activeTrip!.returnDate = moment(newVal[0]).format();
            }
        }
        if (newVal[1]) {
        this.trip.activeTrip!.returnDate = moment(newVal[1]).format();
        }

        if (this.departureTime) {
            this.trip.activeTrip!.departureDate = moment(this.trip.activeTrip!.departureDate).minute(this.departureTime.mm).hour(this.departureTime.HH).second(0).format();
        }
    }

  @Watch('tripDate')
  private handler2(newVal: any, oldVal: any) {
    this.trip.activeTrip!.departureDate = moment(newVal).format();
    this.trip.activeTrip!.returnDate = moment(newVal).format();

    if (this.departureTime) {
        this.trip.activeTrip!.departureDate = moment(this.trip.activeTrip!.departureDate).minute(this.departureTime.mm).hour(this.departureTime.HH).second(0).format();
    }

  }

    @Watch('trip.activeTrip.departurePort', {deep: true})
    private handler3(newVal: any, oldVal: any) {
        if (this.trip.activeTrip && (this.trip.activeTrip.returnPort === oldVal)) {
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

</style>