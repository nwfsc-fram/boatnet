<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-select label="year" v-model="selectionYear" :options="yearOptions"></q-select>

        <q-table
            :data="selections"
            :columns="columns"
            dense
            row-key="id"
            :pagination.sync="pagination"
            :loading="loading"
            binary-state-sort
            style="cursor: pointer"
        >

            <template v-slot:top>
                <q-input label="Search" v-model="filterText" debounce="1000" style="width:100%" autofocus>
                    <template v-if="filterText">
                        <q-avatar dense icon="close" @click="filterText = ''"></q-avatar>
                    </template>
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" @click.native="vesselSelectionDetails(props.row, props)">
                    <q-td key="FISHERY" :props="props">{{ props.row.FISHERY }}</q-td>
                    <q-td key="PERIOD_START" :props="props">{{ formatDate(props.row.PERIOD_START) }}</q-td>
                    <q-td key="PERIOD_END" :props="props">{{ formatDate(props.row.PERIOD_END) }}</q-td>
                    <q-td key="PORT_GROUP_CODE" :props="props">{{ props.row.PORT_GROUP_CODE }}</q-td>
                    <q-td key="VESSEL_NAME" :props="props">{{ props.row.VESSEL_NAME }} ({{ props.row.VESSEL_DRVID}})</q-td>
                    <q-td key="LICENSE_NUMBER" :props="props">{{ props.row.LICENSE_NUMBER ? props.row.LICENSE_NUMBER : props.row.PERMIT_NUMBER ? props.row.PERMIT_NUMBER : props.row.PERMIT_NUMBER_2 }}</q-td>
                    <q-td key="rolloverStatus" :props="props">
                        <b>{{ props.row.rolloverStatus }}</b>
                    </q-td>
                </q-tr>
            </template>

        </q-table>

        <div v-if="selected.length > 0">{{ selected }}</div>
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
import { startCase, cloneDeep, set } from 'lodash';
import { AuthState, authService } from '@boatnet/bn-auth';
import { getSelections, getOracleWaivers, getFishTicket, getVesselFishTickets } from '@boatnet/bn-common';

export default createComponent({
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;

        const masterDB = couchService.masterDB;

        const jp = require('jsonpath');

        const selected: any = ref([]);
        const pagination = {
            sortBy: 'PERIOD_END',
            descending: true,
            rowsPerPage: 15
            };

        const filterText: any = ref('');

        const allVesselSelections: any = ref([]);
        const allWaivers = ref([]);
        const selections: any = ref([]);
        const loading: any = ref(false);

        const selectionYear = ref(moment().format('YYYY'));

        const yearOptions = ref([selectionYear]);

        const getYearOptions = () => {
            for (let i = 0; i < 10; i++) {
                yearOptions.value.push((parseInt(selectionYear.value, 10) - i).toString());
            }
        };

        const columns = [
            {name: 'FISHERY', label: 'Fishery', field: 'FISHERY', required: true, align: 'left', sortable: true},
            {name: 'PERIOD_START', label: 'Period Start', field: 'PERIOD_START', required: true, align: 'left', sortable: true,  sort: (a: any, b: any) => (a).localeCompare(b)},
            {name: 'PERIOD_END', label: 'Period End', field: 'period_end', required: true, align: 'left', sortable: true,  sort: (a: any, b: any) => (a).localeCompare(b)},
            {name: 'PORT_GROUP_CODE', label: 'Port Group', field: 'PORT_GROUP_CODE', required: true, align: 'left', sortable: true},
            {name: 'VESSEL_NAME', label: 'Vessel/Fisher', field: 'VESSEL_NAME', required: true, align: 'left', sortable: true},
            {name: 'LICENSE_NUMBER', label: 'License #', field: 'LICENSE_NUMBER', required: true, align: 'left', sortable: true},

            {name: 'rolloverStatus', label: 'Rollover?', field: 'rolloverStatus', required: true, align: 'left', sortable: true},
        ];

        const getVesselSelections = async () => {
            loading.value = true;
            const vesselSelections: any = await getSelections('year', selectionYear.value);
            for (const selection of vesselSelections) {
                if (vesselSelections.indexOf(selection) < 35) {
                    console.log(vesselSelections.indexOf(selection));
                    await getRolloverStatus(selection);
                }
            }

            allVesselSelections.value = cloneDeep(vesselSelections);
            selections.value = cloneDeep(vesselSelections);

            loading.value = false;
        };

        const getWaivers = async () => {
            const waiversQuery = await masterDB.view(
                'obs_web',
                'waivers_by_vesselId',
                {include_docs: true}
            );
            allWaivers.value.push.apply(allWaivers.value, waiversQuery.rows.filter((row: any) => moment(row.doc.startDate).isSame(moment(), 'year') ||  moment(row.doc.endDate).isSame(moment(), 'year')).map((row: any) => row.doc));
            const oracleWaivers: any = await getOracleWaivers(moment().format('YYYY'));
            allWaivers.value.push.apply(allWaivers.value, oracleWaivers);
        };

        const formatDate = (dateTime: string) => {
            return moment.utc(dateTime).format('MM/DD/YYYY');
        };

        const formatIssuerName = (username: string) => {
            return startCase(username.replace('.', ' '));
        };

        onMounted( async () => {
            getWaivers();
            getYearOptions();
        });

        const vesselSelectionDetails = async (selection: any) => {
            store.dispatch('vessel/setVesselSelection', selection);
            router.push({path: '/vessel-selections/' + selection.VESSEL_DRVID});
        };

        const getTrips = async (selection: any) => {
            const tripsQuery = await masterDB.view(
                'obs_web',
                'wcgop_trips_vesselId_returnDate',
                {
                    include_docs: true,
                    start_key: [selection.VESSEL_DRVID, moment(selection.PERIOD_START).format()],
                    end_key: [selection.VESSEL_DRVID, moment().format()]
                }
            );
            return tripsQuery.rows.map((row: any) => row.doc);
        };

        const getRolloverStatus = async (selection: any) => {
            status = '';
            if (moment(selection.PERIOD_END).isBefore(moment(), 'year')) {
                set(selection, 'rolloverStatus',  '- previous year');
            } else if ( moment(selection.PERIOD_END).isBefore(moment()) ) {
                const trips = await getTrips(selection);
                trips.sort( (a: any, b: any) => {
                    return a.returnDate > b.returnDate ? 1 : a.returnDate < b.returnDate ? -1 : 0;
                } );
                let fishTickets: any[] = [];
                try {
                    fishTickets = await getVesselFishTickets(selection.VESSEL_DRVID, selection.PERIOD_START, moment().format()) as any;
                } catch (err) {
                    console.log(err);
                }
                if (trips.length > 0) {
                    // const allTripsticketNumbers = jp.query(trips, '$..fishTicketNumber');
                    for (const trip of trips) {
                        if (trip.fishTickets && trip.fishTickets[0]) {
                            for (const ticket of trip.fishTickets) {
                                const tripTicket = fishTickets.find( (row: any) => row.FTID === ticket.fishTicketNumber || row.FTID === ticket.fishTicketNumber + 'E');
                                if (tripTicket && tripTicket.LANDED_WEIGHT_LBS && tripTicket.LANDED_WEIGHT_LBS > 0) {
                                    set(selection, 'rolloverStatus', 'N - observed w/ landed lbs - ' + moment(tripTicket.LANDING_DATE).format('MM/DD/YYYY'));
                                    break;
                                }
                            }
                        }
                    }
                    if (!selection.rolloverStatus) {
                        set(selection, 'rolloverStatus', 'Y - no landed lbs');
                    }
                } else {
                    const licenseNums = [ ...new Set(fishTickets.map( (row: any) => row.FISHER_LICENSE_NUM ).filter( (lic: any) => lic !== null ))];
                    if (licenseNums.length > 0 && selection.LICENSE_NUMBER && licenseNums.includes( selection.LICENSE_NUMBER ) ) {
                        // get waivers for period
                        if (allWaivers.value.map( (row: any) => row.PERMIT_OR_LICENSE || row.certificateNumber ).find( (num: any) => num === selection.LICENSE_NUMBER )) {
                            set(selection, 'rolloverStatus', 'Possibly Waived');
                        } else {
                            set(selection, 'rolloverStatus', 'Possible Out of Compliance');
                        }
                    } else {
                        set(selection, 'rolloverStatus', 'Y - no observerd trips');
                    }
                }
            } else if ( moment(selection.PERIOD_START).isBefore(moment()) && moment(selection.PERIOD_END).isAfter(moment()) ) {
                set(selection, 'rolloverStatus', '- in period');
            } else {
                set(selection, 'rolloverStatus', '- before period');
            }
        };

        const watcherOptions: WatchOptions = {
            immediate: true, deep: false
        };

        watch(
            () => filterText.value,
            (newVal, oldVal) => {
                if (newVal !== '') {
                    const needle = newVal.toLowerCase();
                    let selectionResults: any = [];
                    selectionResults = allVesselSelections.value.filter( (row: any) => {
                        return row.FISHERY.toLowerCase().includes(needle) ||
                                (row.CYCLE_NUMBER && row.CYCLE_NUMBER.toString().toLowerCase().includes(needle)) ||
                                (row.PERIOD_NUMBER && row.PERIOD_NUMBER.toString().includes(needle)) ||
                                (row.PERIOD_START && row.PERIOD_START.toLowerCase().includes(needle)) ||
                                (row.PERIOD_END && row.PERIOD_END.toLowerCase().includes(needle)) ||
                                (row.PORT_GROUP_CODE && row.PORT_GROUP_CODE.includes(needle.toUpperCase())) ||
                                (row.VESSEL_NAME && row.VESSEL_NAME.toLowerCase().includes(needle)) ||
                                (row.VESSEL_DRVID && row.VESSEL_DRVID.toLowerCase().includes(needle)) ||
                                (row.LICENSE_NUMBER && row.LICENSE_NUMBER.toLowerCase().includes(needle)) ||
                                (row.PERMIT_NUMBER && row.PERMIT_NUMBER.toLowerCase().includes(needle)) ||
                                (row.PERMIT_NUMBER_2 && row.PERMIT_NUMBER_2.toLowerCase().includes(needle));
                    });
                    selections.value.length = 0;
                    selections.value.push.apply(selections.value, selectionResults);
                } else {
                    selections.value.length = 0;
                    selections.value.push.apply(selections.value, allVesselSelections.value);
                }
            },
            watcherOptions
        );

        watch(
            () => selectionYear.value,
            async (newVal, oldVal) => {
                if (newVal !== '') {
                    await getVesselSelections();
                }
            },
            watcherOptions
        );

        return {
            allWaivers,
            columns,
            filterText,
            formatDate,
            formatIssuerName,
            getRolloverStatus,
            loading,
            pagination,
            selected,
            selections,
            selectionYear,
            vesselSelectionDetails,
            yearOptions
        };
    }
});

</script>

<style>

</style>
