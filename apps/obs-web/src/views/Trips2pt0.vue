<template>

    <div class="q-pa-md" style="max-width: 450px" >
        <transition name="selection-list-item">
            <div v-if="selections.length > 0">
                <b>Chosen:</b>
                <q-list dense>
                    <transition-group name="selections-list">
                        <q-item :class="getSelectionClasses(index)" v-for="(selection, index) in selections" :key="selection.description" dense :style="getIndent(index)">
                            <q-item-section>
                                <b>{{ selection.description }} {{ selection.lookupValue ? formatValue(selection) : ''}}</b>
                            </q-item-section>
                            <q-item-section avatar style="cursor: pointer">
                                <!-- <q-avatar color="white" text-color="primary" size="sm" @click="removeSelection(index)"><b>x</b></q-avatar> -->
                                <q-icon name="clear" @click="removeSelection(index)"></q-icon>
                            </q-item-section>
                        </q-item>
                    </transition-group>
                </q-list>
            </div>
        </transition>
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
                        <q-item class="choices-list-item" :key="'departuredate'" :class="getChoiceClasses(0)" v-if="choices.length === 0 && !activeTrip.departureDateTime && !transitioning">
                            <q-item-section>
                                <b>Departure Date/Time:</b>
                            </q-item-section>
                            <q-item-section>
                                <pCalendar
                                    id="departdate"
                                    v-model="depDateTime"
                                    :touchUI="isMobile"
                                    :inline="false"
                                    selectionMode="single"
                                    :selectOtherMonths="true"
                                    title="Departure Date"
                                    :showTime="true"
                                    onfocus="blur()"
                                    :rules="[val => !!val || 'Departure Date/Time is required']"
                                    >
                                </pCalendar>
                            </q-item-section>
                            <q-item-section avatar v-if="depDateTime !== ''" style="cursor: pointer">
                                <q-icon avatar name="done" @click="submitDepartureDate"></q-icon>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'singleDay'" :class="getChoiceClasses(1)" clickable @click="singleDayTrip" manual-focus v-if="activeTrip.departureDateTime && !activeTrip.returnDate">
                            <q-item-section>
                                <b>Single Day Trip</b>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'returndate'" :class="getChoiceClasses(0)" v-if="activeTrip.departureDateTime && !activeTrip.returnDate">
                            <q-item-section>
                                <b>Return Date:</b>
                            </q-item-section>
                            <q-item-section>
                                <pCalendar
                                    id="returndate"
                                    v-model="retDate"
                                    :touchUI="isMobile"
                                    :inline="false"
                                    selectionMode="single"
                                    :selectOtherMonths="true"
                                    title="Return Date"
                                    :showTime="false"
                                    onfocus="blur()"
                                    :rules="[val => !!val || 'Return date is required']"
                                    >
                                </pCalendar>
                            </q-item-section>
                            <q-item-section avatar v-if="retDate !== ''" style="cursor: pointer">
                                <q-icon avatar name="done" @click="submitReturnDate"></q-icon>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'departureport'" :class="getChoiceClasses(0)" v-if="activeTrip.returnDate && !activeTrip.departurePort">
                            <q-item-section>
                                <b>Departure Port:</b>
                            </q-item-section>
                            <q-item-section>
                                <q-select
                                    v-model="activeTrip.departurePort"
                                    dense
                                    title="Departure Port"
                                    style="width: 100%; border: 2px solid black; border-radius: 3px; padding: 0"
                                    :options="portOptions"
                                    :option-label="opt => opt.description"
                                    :option-value="opt => opt.lookupValue"
                                    emit-value
                                    :display-value="activeTrip.departurePort"
                                    bg-color= "white"
                                ></q-select>
                            </q-item-section>
                        </q-item>
                        <q-item class="choices-list-item" :key="'returnport'" :class="getChoiceClasses(0)" v-if="activeTrip.departurePort && !activeTrip.returnPort">
                            <q-item-section>
                                <b>Return Port:</b>
                            </q-item-section>
                            <q-item-section>
                                <q-select
                                    v-model="activeTrip.returnPort"
                                    dense
                                    title="Return Port"
                                    style="width: 100%; border: 2px solid black; border-radius: 3px; padding: 0"
                                    :options="portOptions"
                                    :option-label="opt => opt.description"
                                    :option-value="opt => opt.lookupValue"
                                    emit-value
                                    :display-value="activeTrip.returnPort"
                                    bg-color= "white"
                                ></q-select>
                            </q-item-section>
                        </q-item>
                    </transition-group>
                </q-list>
            </div>
        </transition>
        <q-btn v-if="selections.find( (row) => row.description === 'Return Port - ')" label="submit" color="primary"></q-btn>

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
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
  setup(props, context) {
    const selections: any = reactive([]);
    const activeTrip: any = ref({});

    const isMobile = computed(
      () => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          return true;
        } else {
          return false;
        }
      }
    );

    const fisheries = [
        {description: 'Pacific Halibut Directed 2A', lookupValue: 'Pacific Halibut Directed 2A'},
        {description: 'LE Sablefish Fixed Gear', lookupValue: 'LE Sablefish Fixed Gear', sectors: [{description: 'Tier fishery (1, 2, 3)'}, {description: 'Zero Tier'}], isEm: false, isEfp: false, isFederal: true},
        {description: 'LE Sablefish Fixed Gear EM', lookupValue: 'LE Sablefish Fixed Gear EM', sectors: [{description: 'Tier fishery (1, 2, 3)'}, {description: 'Zero Tier'}], isEm: true, isEfp: false, isFederal: true},
        {description: 'LE ITQ', lookupValue: 'LE ITQ', sectors: [{description: 'Mothership Catcher Vessel'}, {description: 'Midwater Rockfish'}, {description: 'Bottom Trawl'}, {description: 'Fixed Gear'}, {description: 'Shoreside Hake'}], isEm: false, isEfp: false, isFederal: true},
        {description: 'LE ITQ EM', lookupValue: 'LE ITQ EM', sectors: [{description: 'Mothership Catcher Vessel'}, {description: 'Midwater Rockfish'}, {description: 'Bottom Trawl'}, {description: 'Fixed Gear'}, {description: 'Shoreside Hake'}], isEm: true, isEfp: true, isFederal: true},
        {description: 'CA Cucumber Trawl', lookupValue: 'CA Cucumber Trawl', isState: true},
        {description: 'CA Halibut', lookupValue: 'CA Halibut', isState: true},
        {description: 'CA Nearshore', lookupValue: 'CA Nearshore', isState: true},
        {description: 'CA Pink Shrimp', lookupValue: 'CA Pink Shrimp', isState: true},
        {description: 'CA Ridgeback Prawn', lookupValue: 'CA Ridgeback Prawn', isState: true},
        {description: 'OR Nearshore Black and Blue', lookupValue: 'OR Nearshore Black and Blue', isState: true},
        {description: 'OR Nearshore Endorsed', lookupValue: 'OR Nearshore Endorsed', isState: true},
        {description: 'OR Pink Shrimp', lookupValue: 'OR Pink Shrimp', isState: true},
        {description: 'WA Pink Shrimp', lookupValue: 'WA Pink Shrimp', isState: true},
        {description: 'WC Open Access Fixed Gear', lookupValue: 'WC Open Access Fixed Gear', isOpenAccess: true},
        {description: 'Emily Platt', lookupValue: 'Emily Platt', isEfp: true},
        {description: 'OR Cook Midwater', lookupValue: 'OR Cook Midwater', isEfp: true},
        {description: 'Reel Good Fish', lookupValue: 'Reel Good Fish', isEfp: true}
    ];

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
            } else if ((selections.length === 2 && selections[0].description === 'Federal Permit') || (selections.length === 2 && selections[1].description === 'LE ITQ EM')) {
                return _.cloneDeep(selections[1].sectors);
            } else if (selections[1].isEm && (selections.length === 2 || (selections.length === 3 && !['Maximized Retention', 'Optimized Retention'].includes(selections[2].description)))) {
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
        // if (index < 4) {
        //     return 'margin-left: ' + index * 25 + 'px; margin-right: ' + (3 - index) * 25 + 'px';
        // } else {
        //     return 'margin-left: ' + (index - 4) * 25 + 'px; margin-right: ' + (3 - (index - 4)) * 25 + 'px';
        // }
        return 'margin: 3px';
    };

    const selectOption = (option: any) => {
        transitioning.value = true;
        computeHack.value += 1;
        setTimeout( () => {
            selections.push(option);
            transitioning.value = false;
            computeHack.value += 1;
        }, 300);
    };

    const removeSelection = (index: number) => {
        transitioning.value = true;
        computeHack.value += 1;
        setTimeout( () => {
            selections.splice(index, selections.length - index);
            transitioning.value = false;
            computeHack.value += 1;
            activeTrip.value = {};
            delete activeTrip.value.departureDateTime;
            delete activeTrip.value.returnDate;
            delete activeTrip.value.departurePort;
            delete activeTrip.value.returnPort;
            if (selections.findIndex( (row: any) => row.description === 'Departure Date - ') !== -1) {
                selections.splice(selections.findIndex( (row: any) => row.description === 'Departure Date - '), selections.length );
            }
            depDateTime.value = '';
            retDate.value = '';
        }, 300);
    };

    const watcherOptions: WatchOptions = {
      immediate: true, deep: false
    };
    watch(
        () => activeTrip.value.departurePort,
        (newVal, oldVal) => {
            if (activeTrip.value.departurePort && portOptions.value) {
                const port = portOptions.value.find( (row: any) => row.lookupValue === activeTrip.value.departurePort );
                selectOption({description: 'Departure Port - ', lookupValue: port.description });
            }
        },
        watcherOptions
    );
    watch(
        () => activeTrip.value.returnPort,
        (newVal, oldVal) => {
            if (activeTrip.value.returnPort && portOptions.value) {
                const port = portOptions.value.find( (row: any) => row.lookupValue === activeTrip.value.returnPort );
                selectOption({description: 'Return Port - ', lookupValue: port.description });
            }
        },
        watcherOptions
    );

    const depDateTime: any = ref('');
    const getDepDateTime = () => {
      if (activeTrip.value.departureDateTime) {
        depDateTime.value = new Date(moment(activeTrip.value.departureDateTime).format());
      }
    };
    const submitDepartureDate = () => {
        if (moment(depDateTime.value).format() !== 'Invalid date') {
            activeTrip.value.departureDateTime = moment(depDateTime.value).format();
            selectOption({description: 'Departure Date - ', lookupValue: activeTrip.value.departureDateTime});
        }
    };

    const retDate: any = ref('');
    const getRetDate = () => {
      if (activeTrip.value.returnDate) {
        retDate.value = new Date(moment(activeTrip.value.returnDate).format());
      }
    };
    const submitReturnDate = () => {
        if (moment(retDate.value).format() !== 'Invalid date') {
            activeTrip.value.returnDate = moment(retDate.value).format();
            selectOption({description: 'Return Date - ', lookupValue: activeTrip.value.returnDate});
        }
    };

    const portOptions: any = ref([]);
    const getPortOptions = async () => {
        const masterDb = couchService.masterDB;
        const queryOptions = {
          key: 'port',
          inclusive_end: true,
          descending: false,
          include_docs: false
        };

        const queryResults = await masterDb.view('TripsApi', 'all_em_lookups', queryOptions);
        portOptions.value.push.apply(portOptions.value, queryResults.rows.map( (row: any) => {
            return {description: row.value[0], lookupValue: row.value[1]};
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

    const singleDayTrip = () => {
        if (activeTrip.value.departureDateTime) {
            activeTrip.value.returnDate = _.cloneDeep(activeTrip.value.departureDateTime);
            getRetDate();
            selectOption({description: 'Single Day Trip ', lookupValue: ''});
        }
    };

    const formatValue = (selection: any) => {
        if (selection.description === 'Departure Date - ') {
            return moment(selection.lookupValue).format('MM/DD/YYYY, HH:mm');
        } else if (selection.description === 'Return Date - ') {
            return moment(selection.lookupValue).format('MM/DD/YYYY');
        } else {
            if (selection.description !== selection.lookupValue) {
                return selection.lookupValue;
            } else {
                return '';
            }
        }
    };


    onMounted( () => {
        computeHack.value += 1;
        getPortOptions();
     }
    );

    return {
        activeCollection,
        activeTrip,
        choices,
        depDateTime,
        fisheries,
        formatValue,
        getChoiceClasses,
        getIndent,
        getSelectionClasses,
        isMobile,
        portOptions,
        removeSelection,
        retDate,
        selections,
        selectOption,
        singleDayTrip,
        submitDepartureDate,
        submitReturnDate,
        topLevelChoices,
        transitioning
    };
  }
});
</script>

<style scoped>
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
