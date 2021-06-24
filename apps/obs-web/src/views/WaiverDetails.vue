<template>
    <div class="flex flex-center q-pa-md  q-gutter-md">
        <h6>WAIVER: {{ waiver.waiverId }}, DATE ISSUED: {{ formatDateTime(waiver.createdDate) }}, ISSUED BY: {{ formatIssuerName(waiver.createdBy) }} </h6>

        <div class="break"></div>

        <q-select
        v-model="waiver.vessel"
        label="Vessel"
        :options="vessels"
        :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber) + ')'"
        option-value="_id"
        stack-label
        use-input
        @filter="vesselsFilterFn"
        @click.native="selectText"
        dense

        style="width: 350px"
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
            <template #append v-if="waiver.vessel && !oldRecord">
                <q-btn icon="clear" @click="waiver.vessel = null" flat size="sm"></q-btn>
            </template>
        </q-select>

        <q-select
        v-model="waiver.waiverType"
        label="Type"
        :options="waiverTypes"
        :option-label="opt => opt.description"
        option-value="_id"
        stack-label
        fill-input
        dense
        style="width: 350px"
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
            <template #append v-if="waiver.waiverType && !oldRecord">
                <q-btn icon="clear" @click="waiver.waiverType = null" flat size="sm"></q-btn>
            </template>
        </q-select>

        <q-select
        v-model="waiver.reason"
        label="Reason"
        :options="waiverReasons"
        :option-label="opt => opt.description"
        option-value="_id"
        stack-label
        fill-input
        dense
        style="width: 350px"
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
            <template #append v-if="waiver.reason && !oldRecord">
                <q-btn icon="clear" @click="waiver.reason = null" flat size="sm"></q-btn>
            </template>
        </q-select>

        <div class="break"></div>

        <q-select
        v-model="waiver.fishery"
        label="Fishery"
        :options="fisheries"
        :option-label="opt => opt.description"
        option-value="_id"
        stack-label
        fill-input
        dense
        style="width: 350px"
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
            <template #append v-if="waiver.fishery && !oldRecord">
                <q-btn icon="clear" @click="waiver.fishery = null" flat size="sm"></q-btn>
            </template>
        </q-select>

        <q-select
        v-model="waiver.certificateNumber"
        label="Permit"
        :options="permits"
        stack-label
        use-input
        new-value-mode="add"
        @new-value="newPermit"
        @click.native="selectText"
        dense
        style="width: 350px"
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
            <template #append v-if="waiver.certificateNumber && !oldRecord">
                <q-btn icon="clear" @click="waiver.certificateNumber = null" flat size="sm"></q-btn>
            </template>
        </q-select>

        <q-select
        v-model="waiver.landingPort"
        label="Port"
        :options="ports"
        :option-label="opt => opt.name"
        option-value="_id"
        @filter="portsFilterFn"
        stack-label
        use-input
        @click.native="selectText"
        dense
        style="width: 350px"
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
            <template #append v-if="waiver.landingPort && !oldRecord">
                <q-btn icon="clear" @click="waiver.landingPort = null" flat size="sm"></q-btn>
            </template>
        </q-select>

        <q-select
        v-if="waiver.vessel"
        v-model="waiver.contact"
        label="Contact"
        :options="vesselCaptains"
        :option-label="opt => opt.firstName + ' ' + opt.lastName"
        option-value="_id"
        stack-label
        dense
        style="width: 350px"
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
            <template #append v-if="waiver.contact && !oldRecord">
                <q-btn icon="clear" @click="waiver.contact = null" flat size="sm"></q-btn>
            </template>
        </q-select>

        <q-btn v-if="waiver.vessel" @click="showContactDialog = true">add unlisted contact</q-btn>

        <div class="break"></div>

        <div style="width: 350px" :disabled="oldRecord" :readonly="oldRecord">
            <div class="text-subtitle2" >Start Date</div>
            <pCalendar
            v-model="startDate"
            :touchUI="isMobile"
            >
            </pCalendar>
        </div>

        <div style="width: 350px" :disabled="oldRecord" :readonly="oldRecord">
            <div class="text-subtitle2">End Date</div>
            <pCalendar
            v-model="endDate"
            :touchUI="isMobile"
            >
            </pCalendar>
        </div>

        <div class="break"></div>

        <q-input
        v-model="waiver.notes"
        label="Notes"
        type="textarea"
        style="width: 100%"
        outlined
        :disabled="oldRecord"
        :readonly="oldRecord"
        >
        </q-input>

        <div class="break"></div>

        <div>
            <div v-if="oldRecord" style="color: #007EC6">
                Waiver entries older than 30 days cannot be edited.
                &nbsp;
                <q-btn label="back" @click="navigateBack"></q-btn>
            </div>
            <div v-else>
                <q-btn label="cancel" @click="navigateBack"></q-btn>
                &nbsp;
                <q-btn  v-if="validatedWaiver && waiver._id" label="update waiver" color="primary" @click="updateWaiver"></q-btn>
                <q-btn  v-if="validatedWaiver && !waiver._id" label="save waiver" color="primary" @click="saveWaiver"></q-btn>
            </div>
        </div>

        <q-dialog v-model="showContactDialog">
            <q-card class="q-pa-md">
                <q-card-section>
                    <b>Waiver Contact</b>
                    <q-input v-model="waiverContact.firstName" label="First Name"></q-input>
                    <q-input v-model="waiverContact.lastName" label="Last Name"></q-input>
                    <q-input v-model="waiverContact.email" label="Email" type="email" :rules="[val => val.includes('@') && val.split('@')[1].includes('.') || 'Must be a valid email address']"></q-input>
                    <q-input v-model="waiverContact.phone" label="Phone #" type="phone" :rules="[val => parseInt(val, 10) && val.length == 10 || 'Must be a valid phone number']"></q-input>
                </q-card-section>
                <q-card-actions>
                    <q-btn
                        v-if="waiverContact.firstName && waiverContact.lastName && waiverContact.email && waiverContact.phone"
                        @click="waiver.contact = waiverContact; showContactDialog = false"
                        color="primary"
                    >save</q-btn>
                    <q-btn @click="showContactDialog = false">cancel</q-btn>
                </q-card-actions>
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

import moment from 'moment';
import { startCase, toLower, set, cloneDeep } from 'lodash';
import { Waiver, WaiverTypeTypeName } from '@boatnet/bn-models';
import { AuthState, authService } from '@boatnet/bn-auth';
import { Notify } from 'quasar';
import { updatePropertySignature } from 'typescript';
import { getSelections } from '@boatnet/bn-common';

export default createComponent({
    props: {
        id: String,
    },
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;
        const id = props.id;
        const masterDB = couchService.masterDB;

        const vessels: any = ref([]);
        const allPorts: any = ref([]);
        const ports: any = ref([]);
        const waiver: any = ref({});
        const waiverTypes: any = ref([]);
        const waiverReasons: any = ref([]);
        const fisheries: any = ref([]);
        const vesselSelections: any = ref([]);
        const showContactDialog: any = ref(false);
        const waiverContact: any = ref({});

        const portsFilterFn = (val: string, update: any, abort: any) => {

            update(() => {

            if (val !== '') {
                ports.value = ports.value.filter((port: any) => {
                return (
                    port.description.includes(val.toUpperCase()) ||
                    port.lookupValue.includes(val.toUpperCase())
                );
                });
            } else {
                ports.value = allPorts.value;
            }
            });
            return;
        };

        const vesselsFilterFn = (val: string, update: any, abort: any) => {

            update( async () => {

            if (val !== '') {
                const vesselNameResults = await masterDB.view('obs_web', 'all_vessel_names', {include_docs: true, start_key: val.toLowerCase(), end_key: val.toLowerCase() + '\u9999'});
                const vesselNumResults = await masterDB.view('obs_web', 'all_vessel_nums', {include_docs: true, start_key: val.toLowerCase(), end_key: val.toLowerCase() + '\u9999'});
                vessels.value.length = 0;
                vessels.value.push.apply(vessels.value, vesselNameResults.rows.map( (row: any) => row.doc ));
                vessels.value.push.apply(vessels.value, vesselNumResults.rows.map( (row: any) => row.doc ));
            } else {
                const vesselsQuery = await masterDB.view(
                    'obs_web',
                    'all_vessel_names',
                    {include_docs: true, limit: 20}
                );

                vessels.value = vesselsQuery.rows.map( (row: any) => row.doc );
            }
            });
            return;
        };

        // const permitsFilterFn = (val: string, update: any, abort: any) => {

        //     update( async () => {

        //     if (val !== '') {
        //         const permitResults = await masterDB.view(
        //             'obs_web',
        //             'permit_numbers',
        //             {include_docs: true, start_key: val.toLowerCase(), end_key: val.toLowerCase() + '\u9999'}
        //         );
        //         permits.value = permitResults.rows.map( (row: any) => row.doc );
        //     } else {
        //         const permitsQuery = await masterDB.view(
        //             'obs_web',
        //             'permit_numbers',
        //             {include_docs: true, limit: 20}
        //         );

        //         permits.value = permitsQuery.rows.map( (row: any) => row.doc );
        //     }
        //     });
        //     return;
        // };

        const navigateBack = () => {
            router.back();
        };

        const getOptions = async () => {

            try {
                const vesselsQuery = await masterDB.view(
                    'obs_web',
                    'all_vessel_names',
                    {include_docs: true, limit: 20}
                );

                vessels.value = vesselsQuery.rows.map( (row: any) => row.doc );
            } catch (err) { console.log(err); }

            try {
                const waiverTypesQuery = await masterDB.view(
                    'obs_web', 'all_doc_types', {include_docs: true, reduce: false, key: 'waiver-type'}
                );
                waiverTypes.value = waiverTypesQuery.rows.map( (row: any) => row.doc );
            } catch (err) { console.log(err); }

            try {
                const waiverReasonsQuery = await masterDB.view(
                    'obs_web', 'all_doc_types', {include_docs: true, reduce: false, key: 'waiver-reason'}
                );
                waiverReasons.value = waiverReasonsQuery.rows.map( (row: any) => row.doc );
                waiverReasons.value.sort( (a: any, b: any) => {
                    if (a.lookupValue > b.lookupValue) {
                        return 1;
                    } else if (a.lookupValue < b.lookupValue) {
                        return -1;
                    } else {
                        return 0;
                    }
                } );
            } catch (err) { console.log(err); }

            try {
                const fisheriesQuery = await masterDB.view(
                    'obs_web', 'all_doc_types', {include_docs: true, reduce: false, key: 'fishery'}
                );
                fisheries.value = fisheriesQuery.rows.map( (row: any) => row.doc ).filter( (row: any) => row.isWcgop && row.isActive );
                fisheries.value.sort( (a: any, b: any) => {
                    if (a.description > b.description) {
                        return 1;
                    } else if (a.description < b.description) {
                        return -1;
                    } else {
                        return 0;
                    }
                } );
            } catch (err) { console.log(err); }

            // try {
            //     const permitsQuery = await masterDB.view(
            //         'obs_web', 'permit_numbers', {include_docs: true, reduce: false, limit: 20}
            //     );
            //     permits.value = permitsQuery.rows.map( (row: any) => row.doc );
            // } catch (err) { console.log(err); }

            try {
                const portsQuery = await masterDB.view(
                    'obs_web', 'all_port_names', {include_docs: true}
                );
                allPorts.value = portsQuery.rows.map( (row: any) => row.doc ).filter( (row: any) => row.isWcgop && row.isActive );
                ports.value = portsQuery.rows.map( (row: any) => row.doc ).filter( (row: any) => row.isWcgop && row.isActive );
            } catch (err) { console.log(err); }
        };

        const getWaiver = async (waiverId: any) => {
            if (waiverId === 'new') {
                const maxIdQuery = await masterDB.view('obs_web', 'waiverId', {descending: true, limit: 1});
                const newId = 'b' + (parseInt(maxIdQuery.rows[0].key.substring(1,5), 10) + 1);
                waiver.value = {
                    type: 'waiver',
                    createdBy: authService.getCurrentUser()!.username,
                    createdDate: moment().format(),
                    vessel: null,
                    contact: null,
                    reason: null,
                    waiverType: null,
                    startDate: null,
                    endDate: null,
                    fishery: null,
                    certificateNumber: null,
                    landingPort: null,
                    notes: null,
                    waiverId: newId.toString()
                };
            } else {
                try {
                    waiver.value = await masterDB.get(id);
                } catch (err) {
                    console.log(err);
                }
            }
        };

        const selectText = (event: any) => {
            event.target.select();
        };

        const formatDateTime = (dateTime: string) => {
            return moment(dateTime).format('MM/DD/YYYY');
        };

        const formatIssuerName = (username: string) => {
            return username ? startCase(username.replace('.', ' ')) : '';
        };

        const validatedWaiver = computed( () => {
            if (waiver.value.vessel && waiver.value.startDate && waiver.value.endDate && waiver.value.waiverType && waiver.value.reason) {
                return true;
            } else {
                return false;
            }
        });

        const permits = computed( () => {
            if (waiver.value.vessel) {
                const vesselId = waiver.value.vessel.coastGuardNumber ? waiver.value.vessel.coastGuardNumber : waiver.value.vessel.stateRegulationNumber;
                const selectionForVessel = vesselSelections.value.filter( (row: any) => row.VESSEL_DRVID === vesselId);
                const returnPermits: any = []
                for (const sfv of selectionForVessel) {
                    if (sfv.PERMIT_NUMBER && sfv.PERMIT_NUMBER !== null && !returnPermits.includes(sfv.PERMIT_NUMBER)) {
                        returnPermits.push(sfv.PERMIT_NUMBER)
                    }
                    if (sfv.PERMIT_NUMBER_2 && sfv.PERMIT_NUMBER_2 !== null && !returnPermits.includes(sfv.PERMIT_NUMBER_2)) {
                        returnPermits.push(sfv.PERMIT_NUMBER)
                    }
                }
                return returnPermits;
            }
        })

        const saveWaiver = async () => {
            try {
                const result = await masterDB.post(waiver.value);
                waiver.value._id = result.id;
                waiver.value._rev = result.rev;
                Notify.create({
                    message: 'Waiver saved.'
                });
                navigateBack();
            } catch (err) {
                Notify.create({
                    message: err
                });
            }
        };

        const updateWaiver = async () => {
            try {
                waiver.value.updatedDate = moment().format();
                waiver.value.updatedBy = authService.getCurrentUser()!.username;
                const previous = await masterDB.get(waiver.value._id);
                delete previous.changeLog;
                if (!waiver.value.changeLog) {
                    waiver.value.changeLog = [];
                }
                waiver.value.changeLog.push(previous);
                const result = await masterDB.post(waiver.value);
                waiver.value._rev = result.rev;
                Notify.create({
                    message: 'Waiver updated.'
                });
                navigateBack();
            } catch (err) {
                Notify.create({
                    message: err
                });
            }
        };

        const startDate = computed({
            get: () => {
                return waiver.value.startDate ? new Date(waiver.value.startDate) : null;
            },
            set: (val) => {
                set(waiver.value, 'startDate', moment(val).format());
            }
        });

        const endDate = computed({
            get: () => {
                return waiver.value.endDate ? new Date(waiver.value.endDate) : null;
            },
            set: (val) => {
                set(waiver.value, 'endDate', moment(val).format());
            }
        });

        const oldRecord = computed( () => {
            if (moment().diff(moment(waiver.value.createdDate), 'days') > 30) {
                return true;
            } else {
                return false;
            }
        });

        const vesselCaptains = computed( () => {
            if (waiver.value && waiver.value.vessel && waiver.value.vessel.captains) {
                return waiver.value.vessel.captains;
            } else {
                return [];
            }
        });

        const isMobile = computed( () => {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        });

        const getVesselSelections = async () => {
            const selections: any = await getSelections('year', moment().format('YYYY'));
            vesselSelections.value = cloneDeep(selections);
        };

        const watcherOptions: WatchOptions = {
            immediate: true, deep: false
        };

      const newPermit = (val: any, done: any) => {
        if (val.length > 0) {
          set(waiver.value, 'certificateNumber', val);
          done(val, 'toggle')
        }
      }

      const newContact = (val: any, done: any) => {
        if (val.length > 0) {
          set(waiver.value, 'contact', {_id: 'new', firstName: val});
          done(val, 'toggle')
        }
      }

        watch(
            () => waiver.value.vessel,
            (newVal, oldVal) => {
                if (oldVal && newVal !== oldVal) {
                    set(waiver.value, 'certificateNumber', null);
                    set(waiver.value, 'contact', null);
                    set(waiver.value, 'landingPort', null);
                    if (waiver.value.vessel.captains && waiver.value.vessel.captains[0]) {
                        set(waiver.value, 'contact', waiver.value.vessel.captains[0]);
                    }
                    if (waiver.value.vessel.homePort) {
                        set(waiver.value, 'landingPort', waiver.value.vessel.homePort);
                    }
                }
            },
            watcherOptions
        );

        onMounted( async () => {
            await getOptions();
            await getWaiver(id);
            await getVesselSelections();
        });

        return {
            endDate,
            fisheries,
            formatDateTime,
            formatIssuerName,
            isMobile,
            navigateBack,
            newPermit,
            newContact,
            oldRecord,
            permits,
            // permitsFilterFn,
            ports,
            portsFilterFn,
            saveWaiver,
            selectText,
            showContactDialog,
            startDate,
            updateWaiver,
            validatedWaiver,
            vesselCaptains,
            vesselsFilterFn,
            vessels,
            vesselSelections,
            waiver,
            waiverContact,
            waiverReasons,
            waiverTypes
        };
    }
});

</script>

<style scoped>

.break {
    flex-basis: 100%;
    height: 0 !important;
    margin: 0;
    padding: 0;
}

* >>> .p-calendar {
    background-color: white !important;
    padding: 5px !important;
    border-bottom: 1px solid rgb(170, 169, 169) !important;
    width: 100%
}

* >>> .p-inputtext {
    border: none !important;
    font-weight: bold;
    margin: 0 !important;
    padding: 0 !important;
}

.text-subtitle2 {
    font-size: 10px;
    color: #007EC6;
    position: relative;
    top: 3px;
    z-index: 999;
}

.p-inputwrapper-focus {
    border: none !important;
}
</style>
