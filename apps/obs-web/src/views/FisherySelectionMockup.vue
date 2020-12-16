<template>

    <div class="q-pa-md" style="max-width: 450px" >
        <transition name="selection-list-item">
            <div v-if="selections.length > 0">
                <b>Chosen:</b>
                <q-list dense>
                    <transition-group name="selections-list">
                        <q-item :class="getSelectionClasses(index)"  v-for="(selection, index) in selections" :key="selection.description" dense :style="getIndent(index)">
                            <q-item-section>
                                <b>{{ selection.description }}</b>
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

    const fisheries = [
        {description: 'Pacific Halibut Directed 2A', lookupValue: 'Pacific Halibut Directed 2A'},
        {description: 'LE Sable Fixed Gear', lookupValue: 'LE Sable Fixed Gear', sectors: [{description: 'Tier fishery (1, 2, 3)'}, {description: 'Zero Tier'}], isEm: false, isEfp: false, isFederal: true},
        {description: 'LE Sable Fixed Gear EM', lookupValue: 'LE Sable Fixed Gear EM', sectors: [{description: 'Tier fishery (1, 2, 3)'}, {description: 'Zero Tier'}], isEm: true, isEfp: false, isFederal: true},
        {description: 'LE Trawl ITQ', lookupValue: 'LE Trawl ITQ', sectors: [{description: 'Mothership Catcher Vessel'}, {description: 'Midwater Rockfish'}, {description: 'Bottom Trawl'}, {description: 'Fixed Gear'}, {description: 'Shoreside Hake'}], isEm: false, isEfp: false, isFederal: true},
        {description: 'LE Trawl ITQ EM', lookupValue: 'LE Trawl ITQ EM', sectors: [{description: 'Mothership Catcher Vessel'}, {description: 'Midwater Rockfish'}, {description: 'Bottom Trawl'}, {description: 'Fixed Gear'}, {description: 'Shoreside Hake'}], isEm: true, isEfp: true, isFederal: true},
        {description: 'CA Cucumber Trawl', lookupValue: 'OA Cucumber Trawl', isState: true},
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
            } else if (selections.length === 2 && selections[0].description === 'Federal Permit') {
                return _.cloneDeep(selections[1].sectors);
            } else if (selections[1].isEm && (selections.length === 2 || (selections.length === 3 && !['Maximized Retention', 'Optimized Retention'].includes(selections[2].description)))) {
                return [{description: 'Maximized Retention'}, {description: 'Optimized Retention'}];
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
        return 'margin-left: ' + index * 25 + 'px; margin-right: ' + (3 - index) * 25 + 'px';
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
        }, 300);
    };

    onMounted( () => computeHack.value += 1 );

    return {
        selections, fisheries, topLevelChoices, selectOption, removeSelection, choices, activeCollection, getSelectionClasses, getChoiceClasses, getIndent
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
</style>
