<template>
    <div class='q-pa-md  q-gutter-md'>

        <div class="centered-page-item">
            <q-btn class="bg-primary text-white q-ma-md" @click="newWaiver">New Waiver</q-btn>
        </div>

        <q-select label="Issue Year" v-model="waiverYear" :options="yearOptions"></q-select>

        <q-table
            :data="waivers"
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
                <q-tr :props="props" @click.native="props.row.createdBy ? waiverDetails(props.row, props) : null">
                    <q-td key="id"></q-td>
                    <q-td key="waiverId" :props="props">{{ props.row.waiverId ? props.row.waiverId : props.row.WAIVER_ID }}</q-td>
                    <q-td key="vesselName" :props="props">{{ props.row.vessel ? props.row.vessel.vesselName : props.row.VESSEL_NAME }}</q-td>
                    <q-td key="vesselCGNumber" :props="props">{{ (props.row.vessel ? (props.row.vessel.coastGuardNumber ? props.row.vessel.coastGuardNumber : props.row.vessel.stateRegulationNumber) : props.row.VESSEL_DRVID) }}</q-td>
                    <q-td key="fishery" :props="props">{{ props.row.fishery ? props.row.fishery.description : props.row.FISHERY }}</q-td>
                    <q-td key="permit" :props="props">{{ props.row.certificateNumber ? props.row.certificateNumber.permitNumber : props.row.PERMIT_OR_LICENSE }}</q-td>
                    <q-td key="contact" :props="props">{{ props.row.contact ? (props.row.contact.firstName + ' ' + props.row.contact.lastName) : props.row.CONTACT }}</q-td>
                    <q-td key="createdBy" :props="props">{{ props.row.createdBy ? formatIssuerName(props.row.createdBy) : 'ORACLE' }}</q-td>
                    <q-td key="date" :props="props">{{ props.row.createdDate ? formatDateTime(props.row.createdDate) : formatDateTime(props.row.WAIVER_CREATED_DATE) }}</q-td>
                    <q-td key="waiverType" :props="props">{{ props.row.waiverType ? props.row.waiverType.description :props.row.WAIVER_TYPE }}</q-td>
                    <q-td key="reason" :props="props">{{ props.row.reason ? props.row.reason.description : props.row.WAIVER_REASON }}</q-td>
                    <q-td key="notes" :props="props">{{ props.row.notes ? (props.row.notes.substring(0, 40) + (props.row.notes.length > 40 ? '...' : '') ) : props.row.NOTES ? (props.row.NOTES.substring(0, 40) + (props.row.NOTES.length > 40 ? '...' : '')) : '' }}</q-td>
                    <q-td key="source" :props="props">{{ props.row.createdBy ? 'BOATNET' : 'ORACLE' }}</q-td>
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
import { startCase } from 'lodash';
import { Waiver, WaiverTypeTypeName } from '@boatnet/bn-models';
import { AuthState, authService } from '@boatnet/bn-auth';
import { getOracleWaivers } from '@boatnet/bn-common';

export default createComponent({
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;

        const selected: any = ref([]);
        const pagination = {
            sortBy: 'waiverId',
            descending: true,
            rowsPerPage: 15
            };

        const filterText: any = ref('');

        const allWaivers: any = ref([]);
        const waivers: any = ref([]);
        const loading: any = ref(false);

        const waiverYear = ref(moment().format('YYYY'));

        const yearOptions = ref([waiverYear]);

        const getYearOptions = () => {
            for (let i = 0; i < 10; i++) {
                yearOptions.value.push((parseInt(waiverYear.value, 10) - i).toString());
            }
        };

        const columns = [
            {name: 'waiverId', label: 'Waiver ID', field: 'waiverId', required: true, align: 'left', sortable: true},
            {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description > b.description },
            {name: 'vesselCGNumber', label: 'Vessel ID', field: 'vesselCGNumber', required: true,
            sortable: true, align: 'left' },
            {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true},
            {name: 'permit', label: 'Permit', field: 'permit', required: true, align: 'left', sortable: true},
            {name: 'contact', label: 'Contact', field: 'contact', required: true, align: 'left', sortable: true},
            {name: 'createdBy', label: 'Issuer', field: 'createdBy', required: true, align: 'left', sortable: true},
            {name: 'date', label: 'Issue Date', field: 'createdDate', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b) },
            {name: 'waiverType', label: 'Type', field: 'waiverType', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description > b.description},
            {name: 'reason', label: 'Reason', field: 'reason', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description > b.description },
            {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: false},
            {name: 'source', label: 'Source', field: 'source', required: true, align: 'left', sortable: 'true'}
        ];

        const getWaivers = async () => {
            allWaivers.value.length = 0;
            waivers.value.length = 0;
            const masterDB: Client<any> = couchService.masterDB;
            const queryOptions: any = {
                include_docs: true,
                descending: true
            };

            try {
                loading.value = true;

                const waiversQuery = await masterDB.view<any>(
                    'obs_web',
                    'waiverId',
                    queryOptions
                );

                allWaivers.value = waiversQuery.rows.filter((row: any) => moment(row.doc.createdDate).format('YYYY') === waiverYear.value).map( (row: any) => row.doc);
                waivers.value = waiversQuery.rows.filter((row: any) => moment(row.doc.createdDate).format('YYYY') === waiverYear.value).map( (row: any) => row.doc);

                loading.value = false;

            } catch (err) {
                console.log(err);
            }
            const oracleWaivers = await getOracleWaivers(waiverYear.value);
            allWaivers.value.push.apply(allWaivers.value, oracleWaivers);
            waivers.value.push.apply(waivers.value, oracleWaivers);
        };

        const formatDateTime = (dateTime: string) => {
            return moment(dateTime).format('MM/DD/YYYY');
        };

        const formatIssuerName = (username: string) => {
            return startCase(username.replace('.', ' '));
        };

        onMounted( async () => {
            getYearOptions();
        });

        const waiverDetails = async (waiver: any) => {
            router.push({path: '/waivers/' + waiver._id});
        };

        const newWaiver = () => {
            router.push({path: '/waivers/' + 'new'});
        };

        const watcherOptions: WatchOptions = {
            immediate: true, deep: false
        };

        watch(
            () => filterText.value,
            (newVal, oldVal) => {
                if (newVal !== '') {
                    const needle = newVal.toLowerCase();
                    let waiverResults: any = [];
                    waiverResults = allWaivers.value.filter( (row: any) => {
                        return row.vessel && row.vessel.vesselName.toLowerCase().includes(needle) ||
                                row.vessel && (row.vessel.coastGuardNumber ? row.vessel.coastGuardNumber : row.vessel.stateRegulationNumber).toLowerCase().includes(needle) ||
                                row.fishery && row.fishery.description.toLowerCase().includes(needle) ||
                                row.certificateNumber && row.certificateNumber.permitNumber.toLowerCase().includes(needle) ||
                                row.createdBy && row.createdBy.toLowerCase().includes(needle) ||
                                row.createdDate && row.createdDate.includes(needle) ||
                                row.waiverType && row.waiverType.description.toLowerCase().includes(needle) ||
                                row.reason && row.reason.description.toLowerCase().includes(needle) ||
                                row.waiverId && row.waiverId.includes(needle) ||
                                row.VESSEL_NAME && row.VESSEL_NAME.toLowerCase().includes(needle) ||
                                row.VESSEL_DRVID && row.VESSEL_DRVID.toLowerCase().includes(needle) ||
                                row.WAIVER_CREATED_DATE && row.WAIVER_CREATED_DATE.includes(needle) ||
                                row.WAIVER_TYPE && row.WAIVER_TYPE.toLowerCase().includes(needle) ||
                                row.WAIVER_REASON && row.WAIVER_REASON.toLowerCase().includes(needle) ||
                                row.FISHERY && row.FISHERY.toLowerCase().includes(needle) ||
                                row.WAIVER_ID && row.WAIVER_ID.toString().includes(needle) ||
                                row.PERMIT_OR_LICENSE && row.PERMIT_OR_LICENSE.toLowerCase().includes(needle);
                    });
                    waivers.value.length = 0;
                    waivers.value.push.apply(waivers.value, waiverResults);
                } else {
                    waivers.value.length = 0;
                    waivers.value.push.apply(waivers.value, allWaivers.value);
                }
            },
            watcherOptions
        );

        watch(
            () => waiverYear.value,
            async (newVal, oldVal) => {
                if (newVal !== '') {
                    await getWaivers();
                }
            },
            watcherOptions
        );


        return {
            columns,
            filterText,
            formatDateTime,
            formatIssuerName,
            loading,
            newWaiver,
            pagination,
            selected,
            waiverDetails,
            waivers,
            waiverYear,
            yearOptions
        };
    }
});

</script>

<style>

</style>
