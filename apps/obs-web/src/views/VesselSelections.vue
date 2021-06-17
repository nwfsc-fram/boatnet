<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-select label="year" v-model="selectionYear" :options="yearOptions"></q-select>

        <q-table
            :data="selections"
            :columns="columns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="pagination"
            :loading="loading"
            binary-state-sort
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
                    <q-td key="id"></q-td>
                    <q-td key="fishery" :props="props">{{ props.row.FISHERY }}</q-td>
                    <q-td key="cycle_number" :props="props">{{ props.row.CYCLE_NUMBER }}</q-td>
                    <q-td key="period_number" :props="props">{{ props.row.PERIOD_NUMBER }}</q-td>
                    <q-td key="period_start" :props="props">{{ formatDate(props.row.PERIOD_START) }}</q-td>
                    <q-td key="period_end" :props="props">{{ formatDate(props.row.PERIOD_END) }}</q-td>
                    <q-td key="port_group_code" :props="props">{{ props.row.PORT_GROUP_CODE }}</q-td>
                    <q-td key="vessel" :props="props">{{ props.row.VESSEL_NAME }} ({{ props.row.VESSEL_DRVID}})</q-td>
                    <q-td key="license_number" :props="props">{{ props.row.LICENSE_NUMBER ? props.row.LICENSE_NUMBER : props.row.PERMIT_NUMBER ? props.row.PERMIT_NUMBER : props.row.PERMIT_NUMBER_2 }}</q-td>
                    <q-td key="rollover" :props="props">{{ props.row.ROLLOVER}}</q-td>
                    <q-td key="waivers" :props="props">{{ props.row.WAIVERS}}</q-td>
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
import { startCase, cloneDeep } from 'lodash';
import { AuthState, authService } from '@boatnet/bn-auth';
import { getSelections, getOracleWaivers } from '@boatnet/bn-common';

export default createComponent({
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;

        const selected: any = ref([]);
        const pagination = {
            sortBy: 'period_end',
            descending: true,
            rowsPerPage: 15
            };

        const filterText: any = ref('');

        const allVesselSelections: any = ref([]);
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
            {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.toLowerCase() > b.toLowerCase()},
            {name: 'cycle_number', label: 'Cycle', field: 'cycle_number', required: true, align: 'left', sortable: true},
            {name: 'period_number', label: 'Period', field: 'period_number', required: true, align: 'left', sortable: true},
            {name: 'period_start', label: 'Period Start', field: 'period_start', required: true, align: 'left', sortable: true,  sort: (a: any, b: any) => (a).localeCompare(b)},
            {name: 'period_end', label: 'Period End', field: 'period_end', required: true, align: 'left', sortable: true,  sort: (a: any, b: any) => (a).localeCompare(b)},
            {name: 'port_group_code', label: 'Port Group', field: 'port_group_code', required: true, align: 'left', sortable: true},
            {name: 'vessel', label: 'Vessel/Fisher', field: 'vessel_name', required: true, align: 'left', sortable: true},
            {name: 'license_number', label: 'License #', field: 'license_number', required: true, align: 'left', sortable: true},

            {name: 'rollover', label: 'Rollover?', field: 'rollover', required: true, align: 'left', sortable: true},
            {name: 'waivers', label: 'Waivers?', field: 'waivers', required: true, align: 'left', sortable: true},
        ];

        const getVesselSelections = async () => {
            loading.value = true;
            const vesselSelections: any = await getSelections('year', selectionYear.value); // CHANGE THIS TO LINE BELOW!!!
            // const vesselSelections: any = await getSelections('year', moment().format('YYYY'));

            allVesselSelections.value = cloneDeep(vesselSelections);
            selections.value = cloneDeep(vesselSelections);

            loading.value = false;

        };

        const formatDate = (dateTime: string) => {
            return moment(dateTime).format('MM/DD/YYYY');
        };

        const formatIssuerName = (username: string) => {
            return startCase(username.replace('.', ' '));
        };

        onMounted( async () => {
            getYearOptions();
        });

        const vesselSelectionDetails = async (selection: any) => {
            store.dispatch('vessel/setVesselSelection', selection);
            router.push({path: '/vessel-selections/' + selection.VESSEL_DRVID});
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
            columns,
            filterText,
            formatDate,
            formatIssuerName,
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
