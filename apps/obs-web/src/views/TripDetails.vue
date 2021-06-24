<template>
    <div class="q-pa-md" style="max-width: 450px">
        <div v-if="tripNotRequired && trip.newTrip && !trip.logTrip" class="trip-alert">
            <q-list>
                <q-item>
                    <q-item-section avatar>
                        <q-avatar color="white" text-color="secondary" icon="priority_high" />
                    </q-item-section>
                    <q-item-section>
                        <b>Trip creation is not required in this category/fishery.</b>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
         <div v-if="!trip.readOnly && !trip.newTrip" class="trip-alert">
            <q-list>
                <q-item>
                    <q-item-section avatar>
                        <q-avatar color="white" text-color="secondary" icon="priority_high" />
                    </q-item-section>
                    <q-item-section>
                        <b>Fishery/sector can not be edited.  To create trip in another fishery/sector, cancel current trip and create new one.</b>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
        <div style="font-weight: bold; margin: 15px 15px 0">
            <div v-if="trip.activeTrip.tripNum !== 1"> Trip #: {{ trip.activeTrip.tripNum }}</div>
            <div v-if="trip.activeTrip.fishery && trip.activeTrip.tripNum !== 1"> Fishery: {{ trip.activeTrip.fishery.description }}</div>
            <div v-if="trip.activeTrip.isSelected && trip.activeTrip.tripNum !== 1" class="text-green" style="font-size: 22px">
                <q-icon name="warning"></q-icon>
                Trip Selected
            </div>
            <div v-if="trip.activeTrip._id && !trip.activeTrip.isSelected" class="text-primary" style="font-size: 22px">
                <q-icon name="not_interested"></q-icon>
                Observer Not Required
            </div>
        </div>


        <transition name="selection-list-item">
            <div v-if="selections.length > 0" :disabled="trip.readOnly" >
                <b>Trip Details:</b>
                <q-list dense>
                    <transition-group name="selections-list">
                            <q-item :class="getSelectionClasses(index)" v-for="(selection, index) in selections" :key="index + 1" dense :style="getIndent(index)">
                             <q-item-section>
                               <b>{{ selection.description }} {{ selection.lookupValue ? formatValue(selection) : ''}}</b>
                             </q-item-section>
                             <q-item-section avatar style="cursor: pointer" v-if="!trip.readOnly && trip.newTrip" >
                                 <q-icon name="clear" @click="removeSelection(index)"></q-icon>
                             </q-item-section>
                             <q-item-section avatar v-else-if="!trip.readOnly && !trip.newTrip" disabled>
                                 <q-icon name="remove"></q-icon>
                             </q-item-section>
                         </q-item>
                    </transition-group>
                </q-list>

                <q-list dense>
                    <transition-group name="selections-list">
                        <span v-for="(property, index) in ['departureDate', 'returnDate', 'departurePort', 'returnPort']" :key="index + 1">
                            <q-item v-if="trip.activeTrip[property] || trip.activeTrip[property] === false" :class="getSelectionClasses(index)"  dense :style="getIndent(index)">
                                <q-item-section >
                                    <b>{{ titleFormat(property) }}: {{ trip.activeTrip[property].name ? trip.activeTrip[property].name : trip.activeTrip[property].description ? trip.activeTrip[property].description : ['departureDate', 'returnDate'].includes(property) ? formatDate(trip.activeTrip[property], property) : trip.activeTrip[property] }}</b>
                                </q-item-section>
                                <q-item-section avatar style="cursor: pointer" v-if="!trip.readOnly">
                                    <q-icon name="clear" @click="removeProperty(property)"></q-icon>
                                </q-item-section>
                            </q-item>

                        </span>
                    </transition-group>
                </q-list>
            </div>
        </transition>
        <div v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode">
          <strong>Coverage Waived? (Staff Only)</strong><br>
          <q-btn-toggle
          v-model="trip.activeTrip.isWaived"
          toggle-color="primary"
          :options="[
            {label: 'Yes', value: true},
            {label: 'No', value: false}
          ]"></q-btn-toggle>
        </div>
        <div v-if="trip.logTrip && trip.activeTrip.fishery && trip.activeTrip.returnPort">
          <strong :disable="trip.readOnly">Trip Observed?</strong><br>
          <q-btn-toggle
          v-model="trip.activeTrip.isSelected"
          toggle-color="primary"
          :disable="trip.readOnly"
          :options="[
            {label: 'Yes', value: true},
            {label: 'No', value: false}
          ]"></q-btn-toggle>
        </div>
        <hr>
        <transition name="choices-list-item">
            <div v-if="choices">
            <b v-if="choices.length > 0">Choose option that best describes trip:</b>
                <q-list>
                    <transition-group name="choices-list">
                        <q-item class="choices-list-item" v-for="(option, index) in choices" :key="option.description" :class="getChoiceClasses(index)" clickable @click="selectOption(option)" manual-focus>
                            <q-item-section>
                                <b>{{ option.description }}</b>
                            </q-item-section>
                            <q-item-section avatar v-if="option.isEm">
                                <q-avatar color="white" text-color="primary" size="sm"><b>EM</b></q-avatar>
                            </q-item-section>
                        </q-item>
                    </transition-group>
                </q-list>
            </div>
        </transition>
        <transition name="choices-list-item">
            <div v-if="!choices || choices.length === 0">
                <q-list>
                    <transition-group name="choices-list">
                        <q-item class="choices-list-item" :key="'departuredate'" :class="getChoiceClasses(0)" v-if="!trip.activeTrip.departureDate && !transitioning">
                            <q-item-section>
                                <b>Departure Date/Time:<span v-if="!trip.logTrip"> (estimated)</span></b>
                            </q-item-section>
                            <q-item-section>
                                <pCalendar
                                    id="departdate"
                                    v-model="depDateTime"
                                    :touchUI="isMobile"
                                    :inline="false"
                                    :minDate="minDate"
                                    :maxDate="maxDate"
                                    :disabledDates="invalidDates"
                                    selectionMode="single"
                                    :selectOtherMonths="true"
                                    title="Departure Date"
                                    :showTime="true"
                                    onfocus="blur()"
                                    :rules="[val => !!val || 'Departure Date/Time is required']"
                                    >
                                    <template #header>
                                        <q-btn v-if="depDateTime !== ''" style="float: right" color="primary" size="sm" @click="submitDepartureDate">Done</q-btn>
                                    </template>
                                </pCalendar>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'singleDay'" :class="getChoiceClasses(1)" clickable @click="singleDayTrip" manual-focus v-if="trip.activeTrip.departureDate && !trip.activeTrip.returnDate">
                            <q-item-section>
                                <b>Single Day Trip</b>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'returndate'" :class="getChoiceClasses(0)" v-if="trip.activeTrip.departureDate && !trip.activeTrip.returnDate">
                            <q-item-section>
                                <b>Return Date:<span v-if="!trip.logTrip"> (estimated)</span></b>
                            </q-item-section>
                            <q-item-section>
                                <pCalendar
                                    id="returndate"
                                    v-model="retDate"
                                    :touchUI="isMobile"
                                    :inline="false"
                                    :minDate="minDate"
                                    :maxDate="maxDate"
                                    :disabledDates="invalidDates"
                                    selectionMode="single"
                                    :selectOtherMonths="true"
                                    title="Return Date"
                                    :showTime="false"
                                    @date-select="submitReturnDate"
                                    onfocus="blur()"
                                    :rules="[val => !!val || 'Return date is required']"
                                    >
                                </pCalendar>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'departureport'" :class="getChoiceClasses(0)" v-if="trip.activeTrip.returnDate && !trip.activeTrip.departurePort">
                            <q-item-section>
                                <b>Departure Port:</b>
                            </q-item-section>
                            <q-item-section>
                                <q-select
                                    v-model="trip.activeTrip.departurePort"
                                    dense
                                    title="Departure Port"
                                    style="width: 100%; border: 2px solid black; border-radius: 3px; padding: 0"
                                    :options="portOptions"
                                    :option-label="opt => opt.name"
                                    option-value="_id"
                                    bg-color= "white"
                                    :readonly="trip.readOnly"
                                    @filter="portsFilterFn"
                                    use-input
                                    clearable
                                ></q-select>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'returnport'" :class="getChoiceClasses(0)" v-if="trip.activeTrip.departurePort && !trip.activeTrip.returnPort">
                            <q-item-section>
                                <b>Return Port:</b>
                            </q-item-section>
                            <q-item-section>
                                <q-select
                                    v-model="trip.activeTrip.returnPort"
                                    dense
                                    title="Return Port"
                                    style="width: 100%; border: 2px solid black; border-radius: 3px; padding: 0"
                                    :options="portOptions"
                                    :option-label="opt => opt.name"
                                    option-value="_id"
                                    bg-color= "white"
                                    :readonly="trip.readOnly"
                                    @filter="portsFilterFn"
                                    use-input
                                    clearable
                                ></q-select>
                            </q-item-section>
                        </q-item>
                    </transition-group>
                </q-list>
            </div>
        </transition>

        <div v-if="trip.activeTrip.tripStatus.description === 'closed' || (trip.activeTrip.fishery && trip.activeTrip.returnDate && trip.activeTrip.returnPort && trip.logTrip && (trip.activeTrip.isSelected || trip.activeTrip.isSelected === false))" style="text-align: center">
            <file-uploader
                label="Logbook Capture"
                :trip="trip.activeTrip"
                submitAction="Add Image(s)"
            />
        </div>

        <hr v-if="!(trip.activeTrip.fishery && trip.activeTrip.returnDate && trip.activeTrip.returnPort)">
        <div v-if="trip.newTrip" align="right" class="text-primary" style="padding-right: 10px">
            <q-btn label="Cancel" @click="goToTrips"/>
            &nbsp;
            <q-btn v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode && trip.activeTrip.fishery && trip.activeTrip.returnPort && trip.logTrip" color="red" label="submit without image" @click="submitTripOnly" :disabled="disableCreate"></q-btn>
            &nbsp;
            <q-btn v-if="trip.activeTrip.fishery && trip.activeTrip.returnDate && trip.activeTrip.returnPort && !trip.logTrip" label="Create Trip" color="primary" @click="createTrip" :disable="disableCreate"/>
            <q-btn v-if="trip.logTrip && trip.activeTrip._attachments" label="Log Trip" color="primary" @click="createTrip" :disable="disableCreate"/>
            <q-spinner-radio v-if="transferring" color="primary" size="3em"/>
            <br>&nbsp;
        </div>
            <div v-if="!trip.newTrip" align="right" class="text-primary" style="padding-right: 10px">
            <q-btn label="Cancel Edit" @click="goToTrips"></q-btn>
            &nbsp;
            <q-btn v-if="trip.activeTrip.fishery && trip.activeTrip.returnDate && trip.activeTrip.returnPort" label="Update Trip" color="primary" @click="updateTrip"></q-btn>
            <q-spinner-radio v-if="transferring" color="primary" size="3em"/>
            <br>&nbsp;
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
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onMounted
} from '@vue/composition-api';

import { Vue, Watch } from 'vue-property-decorator';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import { WatchOptions } from 'vue';

import { Notify } from 'quasar';
import moment from 'moment';

import _ from 'lodash';

import { getTripsApiTrip, getCatchApiCatch, getTripsApiTrips } from '@boatnet/bn-common';
import { newTripsApiTrip, updateTripsApiTrip, emailCoordinators } from '@boatnet/bn-common';
import { authService } from '@boatnet/bn-auth/lib';
import {
  Fishery, LocationEvent, OTSTarget, Permit, Port,
  PortTypeName, TripSelection, Vessel, VesselTypeName,
  WcgopOperation, WcgopOperationTypeName,
  WcgopTrip, WcgopTripTypeName
} from '@boatnet/bn-models';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const router = context.root.$router;
    const trip = state.trip;
    const vessel = state.vessel;
    const user = state.user;
    // const activeTrip: any = ref({});

    const masterDb: Client<any> = couchService.masterDB;

    const transferring: any = ref(false);
    const selections: any = reactive([]);
    const isMobile = computed(
      () => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          return true;
        } else {
          return false;
        }
      }
    );

    let fisheries: Fishery = [];

    let userRoles: string[] = [];

    const isAuthorized = (authorizedRoles: string[]) => {
    for (const role of authorizedRoles) {
        if (userRoles.includes(role)) {
            return true;
        }
    }
    return false;
    };

    const minDate: any = ref(null);
    const maxDate: any = ref(null);
    const invalidDates: any = ref([]);
    const existingTripStart: any = ref('0');
    const existingTripEnd: any = ref('0');
    let tripsApiNum: any = null;
    const savedMaxRetention: any = null;
    let otsTargets: any[] = [];
    const missingRequired: any = ref(false);
    const daysWarn: any = ref(false);
    let disableCreate: boolean = false;
    const tripNotRequired: any = ref(false);
    const confirmedSameDaysSubmission: any = ref(false);
    const sameDatesWarning: any = ref(false);

    const getMinDate = async () => {
        const vesselId = vessel.activeVessel.coastGuardNumber ? vessel.activeVessel.coastGuardNumber : vessel.activeVessel.stateRegulationNumber;
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

        if (trip.activeTrip.departureDate) {
            minDate.value = new Date(moment(trip.activeTrip.departureDate).format());
        } else if (trip.logTrip) {
            minDate.value = new Date(moment(new Date()).subtract(1, 'years').format());
        } else if (trip.index === 1) {
            for (const row of openTrips) {
            if ( row.doc.type === 'ots-trip' &&
                    (row.doc.vessel.coastGuardNumber ? row.doc.vessel.coastGuardNumber : row.doc.vessel.stateRegulationNumber) === vesselId &&
                    row.doc._id !== trip.activeTrip!._id
                ) {
                    minDate.value = new Date(moment(row.doc.returnDate).format());
                    if (moment(minDate.value).isSameOrBefore(moment()) ) {
                        minDate.value = new Date();
                    }
                }
            }
        } else if (trip.newTrip) {
            minDate.value = new Date();
        } else {
            minDate.value = new Date();
        }
        } catch (err) {
        console.log(err);
        }
    };

    const getMaxDate = async () => {
        const vesselId = vessel.activeVessel.coastGuardNumber ? vessel.activeVessel.coastGuardNumber : vessel.activeVessel.stateRegulationNumber;
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions: any = {
                include_docs: true,
                reduce: false,
                key: vesselId
            };
        if (trip.logTrip) {
            maxDate.value = new Date();
        } else {
            try {
            const vesselTrips = await masterDB.view<any>(
                    'obs_web',
                    'ots_trips_by_vesselId',
                    queryOptions
                    );
            const openTrips: any = vesselTrips.rows.filter( (row: any) => row.doc.tripStatus.description === 'open');
            if (trip.index === 0 && !trip.newTrip) {
                for (const row of openTrips) {
                if ( row.doc.type === 'ots-trip' && row.doc.vessel.vesselName === trip.activeTrip!.vessel!.vesselName && row.doc._id !== trip.activeTrip!._id) {
                    if (row.doc.tripStatus.description === 'open') {
                    maxDate.value = new Date(moment(row.doc.departureDate).format());
                    }
                }
                }
            }
            } catch (err) {
            console.log(err);
            }
        }
    };

    const getBookedDates = async () => {
        if (!trip.logTrip) {
            if (!isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) || user.captainMode) {
            trip.readOnly = true;
            } else {
            trip.readOnly = false;
            }
            const vesselId = vessel.activeVessel.coastGuardNumber ? vessel.activeVessel.coastGuardNumber : vessel.activeVessel.stateRegulationNumber;
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
                if ( row.doc.type === 'ots-trip' && row.doc.vessel.vesselName === trip.activeTrip!.vessel!.vesselName && row.doc._id !== trip.activeTrip!._id) {
                if (row.doc.tripStatus.description === 'open') {
                    {
                    existingTripStart.value = row.doc.departureDate;
                    existingTripEnd.value = row.doc.returnDate;
                    const days = moment(moment(row.doc.returnDate).format('YYYY-MM-DD')).diff(moment(row.doc.departureDate).format('YYYY-MM-DD'), 'days');
                    for (i = 1; i < days; i++) {
                        const invalidDay: any = moment(JSON.parse(JSON.stringify(row.doc.departureDate)));
                        invalidDay.add(i, 'days');
                        invalidDates.value.push(new Date(invalidDay.format()));
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
                    invalidDates.value.push(new Date(invalidDay.format()));
                    }
                }
                }
            }

            } catch (err) {
            console.log(err);
            trip.readOnly = false;
            }
            if (trip.activeTrip!.tripStatus!.description === 'open') {
            trip.readOnly = false;
            }
        }
    };

    const getFisheries = async () => {
        const fisheriesQuery: any = await masterDb.view('obs_web', 'all_doc_types', {key: 'fishery', include_docs: true, reduce: false} as any);
        fisheries = fisheriesQuery.rows.map( (row: any) => row.doc).filter( (row: any) => row.isActive);
    };

    const topLevelChoices = [
        {description: 'Federal Permit'},
        {description: 'State Permit'},
        {description: 'Open Access'},
        {description: 'Pacific Halibut Directed 2A'},
        {description: 'EFP'}
    ];

    const computeHack = ref(0); // forces computed property to update
    const transitioning = ref(false);

    const activeCollection = ref('');

    const choices = computed (
      () => {
        if (computeHack.value) {
            if (transitioning.value) {
                return [];
            }
            if (selections.length === 0) {
            activeCollection.value = 'topLevelChoices';
            return topLevelChoices;
            } else if (selections.length === 1) {
                if ( selections[0].description === 'Federal Permit') {
                    activeCollection.value = 'fisheries';
                    return fisheries.filter( (fishery: any) => fishery.isFederal );
                } else if (selections[0].description === 'State Permit') {
                    return fisheries.filter( (fishery: any) => fishery.isState );
                } else if (selections[0].description === 'Open Access' ) {
                    return fisheries.filter( (fishery: any) => fishery.isOpenAccess );
                } else if (selections[0].description === 'EFP') {
                    return fisheries.filter( (fishery: any) => fishery.isEfp );
                }
            } else if ((selections.length === 2 && selections[0].description === 'Federal Permit') || (selections.length === 2 && (selections[1].description === 'LE ITQ EM' || selections[1].description === 'Electronic Monitoring EFP'))) {
                return _.cloneDeep(selections[1].sectors);
            } else if ( selections[1].isEm && ( selections.length === 2 || ( selections.length === 3 && !['Maximized Retention', 'Optimized Retention'].includes(selections[2].description) && (selections[2].description !== 'Mothership Catcher Vessel') ) ) ) {
                return [{description: 'Maximized Retention'}, {description: 'Optimized Retention / Don\'t know'}];
            } else {
                return [];
            }
        }
      }
    );

    const getSelectionClasses = (index: number) => {
        if (index % 2 === 0) {
            return 'selections-list-item bg-primary text-white rounded';
        } else {
            return 'selections-list-item bg-blue-2 rounded';
        }
    };

    const getChoiceClasses = (index: number) => {
        if (index % 2 === 0) {
            return 'choices-list-item bg-primary text-white rounded';
        } else {
            return 'choices-list-item bg-blue-2 rounded';
        }
    };

    const getIndent = (index: number) => {
        return 'margin: 3px';
    };

    const checkTripRequired = () => {
        if (selections.find( (row: any) => {
            return ['State Permit', 'Open Access', 'Maximized Retention',
                    'Mothership Catcher Vessel', 'OR Cook Midwater H&L EFP',
                    'CA Real Good Fish Monterey Bay EFP',
                    'Trawl Gear Modification EFP',
                    'Trawl Gear Modification EFP (EM)',
                    'CA Emley-Platt SFCFA EFP',
                    'Pacific Halibut Directed 2A',
                    'Limited Entry Sablefish Fixed Gear',
                    'Limited Entry Sablefish Fixed Gear EM',
                    'Limited Entry ITQ',
                    'Limited Entry ITQ EM'
                    ].includes(row.description);
        })) {
            tripNotRequired.value = true;
        } else {
            tripNotRequired.value = false;
        }
    };

    const selectOption = (option: any) => {
        if (option.type === 'fishery') {
            trip.activeTrip.fishery = option;
        }
        if (trip.activeTrip.fishery &&
            trip.activeTrip.fishery.sectors &&
            trip.activeTrip.fishery.sectors.find( (row: any) => option.description === row.description )
           ) {
            trip.activeTrip.fisherySector = option;
        }
        if (option.description === 'Maximized Retention') {
            trip.activeTrip.maximizedRetention = true;
        }
        if (option.description === 'Optimized Retention / Don\'t know') {
            trip.activeTrip.maximizedRetention = false;
        }
        transitioning.value = true;
        computeHack.value += 1;
        setTimeout( () => {
            selections.push(option);
            transitioning.value = false;
            computeHack.value += 1;
            checkTripRequired();
        }, 300);
    };

    const removeSelection = (index: number) => {
        transitioning.value = true;
        computeHack.value += 1;
        setTimeout( () => {
            selections.splice(index, selections.length - index);
            transitioning.value = false;
            computeHack.value += 1;
            trip.activeTrip.departureDate = null;
            trip.activeTrip.returnDate = null;
            trip.activeTrip.departurePort = null;
            trip.activeTrip.returnPort = null;
            if (selections.findIndex( (row: any) => row.description === 'Departure Date - ') !== -1) {
                selections.splice(selections.findIndex( (row: any) => row.description === 'Departure Date - '), selections.length );
            }
            depDateTime.value = '';
            retDate.value = '';
            checkTripRequired();
        }, 300);
    };

    const depDateTime: any = ref('');
    const getDepDateTime = () => {
      if (trip.activeTrip.departureDate) {
        depDateTime.value = new Date(moment(trip.activeTrip.departureDate).format());
      }
    };
    const submitDepartureDate = () => {
        if (moment(depDateTime.value).format() !== 'Invalid date') {
            trip.activeTrip.departureDate = moment(depDateTime.value).format();
            if (trip.activeTrip.returnDate && moment(trip.activeTrip.returnDate).isBefore(trip.activeTrip.departureDate)) {
                trip.activeTrip.returnDate = null;
            }
            checkDepartureDate();
            getMinDate();
            getMaxDate();
        }
    };
    const checkDepartureDate = () => {
        if (!trip.logTrip) {
            if (moment(trip.activeTrip!.departureDate).diff(moment(), 'hours') < 48  && (!isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) || user.captainMode)) {
                daysWarn.value = true;
            }
        }
    };

    const retDate: any = ref('');
    const getRetDate = () => {
      if (trip.activeTrip.returnDate) {
        retDate.value = new Date(moment(trip.activeTrip.returnDate).format());
      }
    };
    const submitReturnDate = () => {
        if (moment(retDate.value).format() !== 'Invalid date') {
            trip.activeTrip.returnDate = moment(retDate.value).format();
            getMinDate();
            getMaxDate();
        }
    };

    const portOptions: any = ref([]);
    const getPortOptions = async () => {
        const queryOptions = {
          key: 'port',
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const queryResults = await masterDb.view('TripsApi', 'all_em_lookups', queryOptions);
        portOptions.value.push.apply(portOptions.value, queryResults.rows.map( (row: any) => {
            return row.doc;
        }));

        portOptions.value.sort(
            (a: any, b: any) => {
                if (a.description > b.description) {
                    return 0;
                } else if (a.description < b.description) {
                    return -1;
                } else {
                    return 0;
                }
            }
        );
    };

    const portsFilterFn = async (val: string, update: any, abort: any) => {
        update(async () => {
        try {
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
            portOptions.value = ports.rows.map((row: any) => row.doc);
        } catch (err) {
            console.log(err);
        }
        });
    };

    const singleDayTrip = () => {
        if (trip.activeTrip.departureDate) {
            trip.activeTrip.returnDate = _.cloneDeep(trip.activeTrip.departureDate);
            getRetDate();
            // selectOption({description: 'Single Day Trip ', lookupValue: ''});
        }
    };

    const formatValue = (selection: any) => {
        if (selection.description === 'Departure Date - ') {
            return moment(selection.lookupValue).format('MM/DD/YYYY, HH:mm');
        } else if (selection.description === 'Return Date - ') {
            return moment(selection.lookupValue).format('MM/DD/YYYY');
        } else {
            if (selection.description !== selection.lookupValue) {
                return '';
            } else {
                return '';
            }
        }
    };

    const formatDate = (value: string, property: string) => {
        if (property === 'departureDate') {
            return moment(value).format('MM/DD/YYYY HH:mm');
        } else if (property === 'returnDate') {
            return moment(value).format('MM/DD/YYYY');
        }
    };

    const titleFormat = (value: string) => {
        const returnValue = value[0].toUpperCase() + value.slice(1, value.length);
        return returnValue.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g)!.join(' ');
    };

    const removeProperty = (property: any) => {
        trip.activeTrip[property] = null;
        computeHack.value += 1;
        getMinDate();
        getMaxDate();
    };

    const createTrip = async () => {

        // REQIRES A START AND END DATE
        if (!trip.activeTrip!.departureDate || !trip.activeTrip!.returnDate) {
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

        if (!trip.activeTrip!.departurePort || !trip.activeTrip!.returnPort) {
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
        if (trip.activeTrip!.fishery!.description !== '') {
            disableCreate = true;

            handleSavedSelections().then( async () => {
                const newApiTrip = {
                    vesselId: trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber,
                    vesselName: trip.activeTrip!.vessel!.vesselName,
                    departurePort: trip.activeTrip!.departurePort!.code,
                    departureDate: trip.activeTrip!.departureDate,
                    returnPort: trip.activeTrip!.returnPort!.code,
                    returnDate: trip.activeTrip!.returnDate,
                    permits: trip.activeTrip!.permits ? trip.activeTrip!.permits.map((permit: any) => permit.permitNumber ) : [],
                    fishery: trip.activeTrip!.fishery!.description,
                    createdBy: trip.activeTrip!.createdBy,
                    createdDate: trip.activeTrip!.createdDate
                };

                trip.activeTrip!.vesselId = trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber;

                try {
                    await newTripsApiTrip(newApiTrip).then( (res: any) => tripsApiNum = res.tripNum);
                    trip.activeTrip!.tripNum = tripsApiNum;
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

                if (trip.logTrip) {
                    trip.activeTrip.tripStatus = {description: 'closed'};
                    trip.activeTrip.captainAffirmedDepartureDate = trip.activeTrip.departureDate;
                    trip.activeTrip.captainAffirmedReturnDate = trip.activeTrip.returnDate;
                    if (trip.activeTrip.maximizedRetention || (trip.activeTrip.fisherySector && ['Mothership Catcher Vessel', 'Shoreside Hake'].includes(trip.activeTrip.fisherySector.description))) {
                        trip.activeTrip.closingReason = 'taken';
                    } else {
                        trip.activeTrip.closingReason = 'missed trip';
                    }
                }

                const masterDB: Client<any> = couchService.masterDB;
                await masterDB.post(trip.activeTrip).then( () => {
                Notify.create({
                    message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>Your trip notification has been submitted!<br></div><div class=text-h6"><br>If an Observer is required, the Observer Program will be in touch before the trip.<br>&nbsp;<br>&nbsp;</div>',
                    position: 'top',
                    color: 'primary',
                    timeout: 7000,
                    html: true,
                    multiLine: true
                });
                if (trip.activeTrip!.isSelected) {
                    emailCoordinators(trip.activeTrip, 'NEW');
                }
                router.push({ path: '/trips/' });
                });
            });
        } else {
            missingRequired.value = true;
        }
    };


    const updateTrip = async () => {

        // REQIRES A START AND END DATE
        if (!trip.activeTrip!.departureDate || !trip.activeTrip!.returnDate) {
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

        transferring.value = true;
        trip.activeTrip!.updatedBy = authService.getCurrentUser()!.username;
        trip.activeTrip!.updatedDate = moment().format();

        if (trip.activeTrip!.tripNum === 0 || trip.activeTrip!.tripNum === 1) {
        try {
            const newApiTrip = {
            vesselId: trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber,
            vesselName: trip.activeTrip!.vessel!.vesselName,
            departurePort: trip.activeTrip!.departurePort!.code,
            departureDate: trip.activeTrip!.departureDate,
            returnPort: trip.activeTrip!.returnPort!.code,
            returnDate: trip.activeTrip!.returnDate,
            permits: trip.activeTrip!.permits ? trip.activeTrip!.permits.map((permit: any) => permit.permitNumber ) : [],
            fishery: trip.activeTrip!.fishery!.description,
            createdBy: trip.activeTrip!.createdBy,
            createdDate: trip.activeTrip!.createdDate
            };

            trip.activeTrip!.vesselId = trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber;

            await newTripsApiTrip(newApiTrip).then( (res: any) => tripsApiNum = res.tripNum);
            trip.activeTrip!.tripNum = tripsApiNum;

        } catch (err) {
            console.log(err);
        }
        } else {
            const updateApiTrip = {
            tripNum: trip.activeTrip.tripNum,
            vesselId: trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber,
            vesselName: trip.activeTrip!.vessel!.vesselName,
            departurePort: trip.activeTrip!.departurePort!.code,
            departureDate: trip.activeTrip!.departureDate,
            returnPort: trip.activeTrip!.returnPort!.code,
            returnDate: trip.activeTrip!.returnDate,
            permits: trip.activeTrip!.permits ? trip.activeTrip!.permits.map((permit: any) => permit.permitNumber ) : [],
            fishery: trip.activeTrip!.fishery!.description,
            createdBy: trip.activeTrip!.createdBy,
            createdDate: trip.activeTrip!.createdDate
            };
            try {
                await updateTripsApiTrip(updateApiTrip);
                console.log('tripsApi trip updated');
            } catch (err) {
                console.log(err);
            }
        }

        if (trip.activeTrip!.isSelected && trip.activeTrip!.maximizedRetention) {

        saveSelection().then(
            async () => {
            trip.activeTrip!.isSelected = false;
            trip.activeTrip!.notes = 'Maximized Retention chosen - selection removed';
            await masterDb.put(
                trip.activeTrip!._id as string,
                trip.activeTrip,
                trip.activeTrip!._rev as string).then( () => router.push({ path: '/trips' }));
            }
        );

        } else if (savedMaxRetention === true && !trip.activeTrip!.maximizedRetention) {
        handleSavedSelections().then(async () => {
            await masterDb.put(
            trip.activeTrip!._id as string,
            trip.activeTrip,
            trip.activeTrip!._rev as string
            ).then( async () => {
                transferring.value = false;
                Notify.create({
                message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>Your trip notification has been updated!<br></div><div class=text-h6"><br>If an Observer is required, the Observer Program will be in touch before the trip.<br>&nbsp;<br>&nbsp;</div>',
                position: 'top',
                color: 'primary',
                timeout: 7000,
                html: true,
                multiLine: true
                });
                router.push({ path: '/trips' });
            });
        });
        } else {
        await masterDb.put(
            trip.activeTrip!._id as string,
            trip.activeTrip,
            trip.activeTrip!._rev as string
            ).then( async () => {
                transferring.value = false;
                if (trip.activeTrip!.tripStatus!.description === 'open') {
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
                if (trip.activeTrip!.isSelected) {
                emailCoordinators(trip.activeTrip, 'UPDATE');
                }
                router.push({ path: '/trips' });
                });
        }
    };

    const saveSelection = async () => {
      const savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
        };

      // check to see if savedSelections exists, fetch it if it does.
      const vesselId = trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber;
      const fisheryName: any = trip.activeTrip!.fishery!.description ? trip.activeTrip!.fishery!.description : '';

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
            isSelected: trip.activeTrip!.isSelected,
            notes: trip.activeTrip!.notes ? trip.activeTrip!.notes : 'fish',
            selectionDate: trip.activeTrip!.selectionDate ? trip.activeTrip!.selectionDate : trip.activeTrip!.createdDate
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
  };

    const handleSavedSelections = async () => {
        const savedSelections: any = {
        type: 'saved-selections',
        createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
        createdDate: moment().format()
        };
        const vesselId = trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber;
        const fisheryName: any = trip.activeTrip!.fishery!.description ? trip.activeTrip!.fishery!.description : 'fish';

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

        if (!trip.activeTrip!.maximizedRetention) {
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

                trip.activeTrip!.isSelected = tripSelection.isSelected;
                trip.activeTrip!.notes = tripSelection.notes;
                trip.activeTrip!.selectionDate = tripSelection.selectionDate;
            } else {
                const activeOTSTarget: any = getActiveOtsTarget();

                const randomNum = Math.floor(Math.random() * 100);

                if (activeOTSTarget && activeOTSTarget.setRate && trip.activeTrip) {
                    if (randomNum < activeOTSTarget.setRate) {
                        trip.activeTrip.isSelected = true;
                        trip.activeTrip.notes =
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
                        trip.activeTrip.isSelected = false;
                        trip.activeTrip.notes =
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
            trip.activeTrip!.isSelected = false;
            trip.activeTrip!.notes = 'Maximized Retention Trip - Not Selected';
        }

        if (!vesselSelections[fisheryName]) {
            vesselSelections[fisheryName] = [];
        }

        if (!vesselSelections[fisheryName] || vesselSelections[fisheryName].length < 1) {

        const activeOTSTarget: any = await getActiveOtsTarget();
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
    };

    const getActiveOtsTarget = () => {
        let activeOTSTarget;
        const fisheryName: string = trip.activeTrip!.fishery!.description!;
        for (const otsTarget of otsTargets) {
            if (trip.activeTrip && trip.activeTrip.fishery) {
                if (
                    getStatus(otsTarget) === 'Active' &&
                    otsTarget.targetType === 'Fishery Wide' &&
                    otsTarget.fishery === fisheryName
                ) {
                    activeOTSTarget = otsTarget;
                }
            }
        }
        for (const otsTarget of otsTargets) {
            if (
            getStatus(otsTarget) === 'Active' &&
            otsTarget.targetVessel &&
            trip.activeTrip &&
            trip.activeTrip.vessel &&
            trip.activeTrip.fishery
            ) {
            const otsVesselId = otsTarget.targetVessel.coastGuardNumber
                ? otsTarget.targetVessel.coastGuardNumber
                : otsTarget.targetVessel.stateRegulationNumber;
            const tripVesselId = trip.activeTrip.vessel.coastGuardNumber
                ? trip.activeTrip.vessel.coastGuardNumber
                : trip.activeTrip.vessel.stateRegulationNumber;
            if (
                otsTarget.targetType === 'Vessel' &&
                otsTarget.fishery === trip.activeTrip.fishery.description &&
                otsVesselId === tripVesselId
            ) {
                activeOTSTarget = otsTarget;
            }
            }
        }
        return activeOTSTarget;
    };

    const getOtsTargets = async () => {
        const queryOptions = {
            include_docs: true,
            reduce: false,
            key: 'ots-target'
        };
        try {
            const otsTargetsQuery = await masterDb.view(
            'obs_web',
            'all_doc_types',
            queryOptions
            );

            otsTargets = otsTargetsQuery.rows.map((row: any) => row.doc);
        } catch (err) {
            console.log(err);
        }
    };

    const getStatus = (otsTarget: OTSTarget) => {
        if (
            moment(otsTarget.effectiveDate) <= moment() &&
            moment() <= moment(otsTarget.expirationDate) &&
            otsTarget.status !== 'Inactive'
        ) {
            return 'Active';
        } else {
            return 'Inactive';
        }
    };

    const submitAnyway = () => {
        confirmedSameDaysSubmission.value = true;
        submitTripOnly();
    };

    const submitTripOnly = async () => {

        // REQIRES A START AND END DATE
        if (!trip.activeTrip!.departureDate || !trip.activeTrip!.returnDate) {
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


        if (typeof trip.activeTrip!.isSelected === 'undefined' ) {
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

        disableCreate = true;
        trip.activeTrip!.vesselId = trip.activeTrip!.vessel!.coastGuardNumber ? trip.activeTrip!.vessel!.coastGuardNumber : trip.activeTrip!.vessel!.stateRegulationNumber;

        if (!confirmedSameDaysSubmission.value) {
            const vesselTrips: any = await getTripsApiTrips('vesselId', trip.activeTrip!.vesselId);

            const sameDatesTrips = vesselTrips.filter(
                (existingTrip: any) => {
                    return moment(existingTrip.departureDate).isSame(trip.activeTrip!.departureDate, 'day') && moment(existingTrip.returnDate).isSame(trip.activeTrip!.returnDate, 'day');
                });
            if (sameDatesTrips.length > 0) {
                sameDatesWarning.value = true;
                return;
            }
        }

        sameDatesWarning.value = false;
        confirmedSameDaysSubmission.value = false;

        const newApiTrip = {
            vesselId: trip.activeTrip!.vesselId,
            vesselName: trip.activeTrip!.vessel!.vesselName,
            departurePort: trip.activeTrip!.departurePort!.code ? trip.activeTrip!.departurePort!.code : trip.activeTrip!.departurePort!.name,
            departureDate: trip.activeTrip!.departureDate,
            returnPort: trip.activeTrip!.returnPort!.code ? trip.activeTrip!.returnPort!.code : trip.activeTrip!.returnPort!.name,
            returnDate: trip.activeTrip!.returnDate,
            permits: trip.activeTrip!.permits ? trip.activeTrip!.permits.map((permit: any) => permit.permitNumber) : [],
            fishery: trip.activeTrip!.fishery!.description,
            createdBy: trip.activeTrip!.createdBy,
            createdDate: trip.activeTrip!.createdDate
        };


        await newTripsApiTrip(newApiTrip).then( (res: any) => tripsApiNum = res.tripNum);
        trip.activeTrip!.tripNum = tripsApiNum;

        if (trip.logTrip) {
            trip.activeTrip.tripStatus = {description: 'closed'};
            trip.activeTrip.captainAffirmedDepartureDate = trip.activeTrip.departureDate;
            trip.activeTrip.captainAffirmedReturnDate = trip.activeTrip.returnDate;
            if (trip.activeTrip.maximizedRetention || (trip.activeTrip.fisherySector && ['Mothership Catcher Vessel', 'Shoreside Hake'].includes(trip.activeTrip.fisherySector.description))) {
                trip.activeTrip.closingReason = 'taken';
            } else {
                trip.activeTrip.closingReason = 'missed trip';
            }
        }

        trip.activeTrip!.changeLog!.unshift(
            {
                updatedBy: authService.getCurrentUser()!.username,
                updateDate: moment().format('MM/DD/YYYY HH:mm A'),
                property: '_attachments',
                newVal: 'submitted trip wihtout image capture',
                app: 'Observer Web'
            }
        );
        emailCoordinators(trip.activeTrip, 'MISSED TRIP');
        const masterDB: Client<any> = couchService.masterDB;
        transferring.value = true;
        return await masterDB.post(
            trip.activeTrip
            ).then( () => {
                transferring.value = false;
                Notify.create({
                    message: 'Missed Trip Submitted',
                        position: 'center',
                        color: 'green',
                        timeout: 2000,
                        icon: 'emoji_emotions',
                        html: true,
                        multiLine: true
                    });
                router.push({ path: '/trips' });
            });
    };

    const goToTrips = () => {
        router.push({ path: '/trips/' });
    };

    const parseActiveTrip = () => {
        if (trip.activeTrip.fishery) {
            selections.push(
                {description: 'Federal Permit'}
            );
            selections.push(
                {description: trip.activeTrip.fishery.description}
            );
        }
        if (trip.activeTrip.fisherySector) {
            selections.push(
                {description: trip.activeTrip.fisherySector.description}
            );
            if (trip.activeTrip.maximizedRetention ) {
                selections.push(
                    {description: 'Maximized Retention'}
                );
            }
            if (trip.activeTrip.maximizedRetention === false) {
                selections.push(
                    {description: 'Optimized Retention / Don\'t know'}
                );
            }
        }
    };


    onMounted( () => {
        computeHack.value += 1;
        getPortOptions();
        getRetDate();
        getDepDateTime();
        getMinDate();
        getMaxDate();
        getBookedDates();
        parseActiveTrip();
        getFisheries();
        getOtsTargets();
        if ( authService.getCurrentUser() ) {
            userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
        }
     }
    );

    return {
        activeCollection,
        choices,
        createTrip,
        daysWarn,
        depDateTime,
        disableCreate,
        fisheries,
        formatDate,
        formatValue,
        getChoiceClasses,
        getIndent,
        getSelectionClasses,
        goToTrips,
        isAuthorized,
        isMobile,
        invalidDates,
        maxDate,
        minDate,
        missingRequired,
        portsFilterFn,
        portOptions,
        removeProperty,
        removeSelection,
        retDate,
        sameDatesWarning,
        selections,
        selectOption,
        singleDayTrip,
        submitAnyway,
        submitDepartureDate,
        submitReturnDate,
        submitTripOnly,
        titleFormat,
        topLevelChoices,
        transferring,
        transitioning,
        trip,
        tripNotRequired,
        updateTrip,
        user
    };
  }
});
</script>

<style scoped>
    .trip-alert {
        background-color: #003D72;
        color: white;
        border-radius: 5px;
        padding: 5px;
    }

    .selections-list-item {
        transition: all .3s;
    }
    .selections-list-enter,
    .selections-list-leave-to {
        opacity: 0;
        transform: translateX(30px);
    }

    .choices-list-item {
        transition: all .3s;
    }
    .choices-list-enter {
        opacity: 0;
        transform: translateY(30px);
    }
    .choices-list-leave-to {
        opacity: 0;
        transform: translateY(-30px);
    }

    .rounded {
        border-radius: 5px;
        margin: 3px;
    }

    * >>> .p-inputtext {
        border: 2px solid black !important;
        cursor: pointer;
        font-weight: bold;
        padding: 6px 0;
        line-height: 2.4em;
    }

    * >>> .q-select__dropdown-icon {
        color: black !important;
    }
</style>
