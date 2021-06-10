<template>
    <div class='q-pa-md  q-gutter-md'>

        <div class="centered-page-item">
            <q-btn class="bg-primary text-white q-ma-md" @click="newWaiver">New Waiver</q-btn>
        </div>

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
            hide-bottom
        >

            <template v-slot:top>
                <q-input label="Search" v-model="filterText" debounce="1000" style="width:100%" autofocus>
                    <template v-if="filterText">
                        <q-avatar dense icon="close" @click="filterText = ''"></q-avatar>
                    </template>
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" @click.native="waiverDetails(props.row, props)">
                    <q-td key="id"></q-td>
                    <q-td key="waiverId" :props="props">{{ props.row.waiverId }}</q-td>
                    <q-td key="vesselName" :props="props">{{ props.row.vessel.vesselName }}</q-td>
                    <q-td key="vesselCGNumber" :props="props">{{ (props.row.vessel.coastGuardNumber ? props.row.vessel.coastGuardNumber : props.row.vessel.stateRegulationNumber) }}</q-td>
                    <q-td key="createdBy" :props="props">{{ formatIssuerName(props.row.createdBy) }}</q-td>
                    <q-td key="date" :props="props">{{ formatDateTime(props.row.createdDate) }}</q-td>
                    <q-td key="waiverType" :props="props">{{ props.row.waiverType.description }}</q-td>
                    <q-td key="reason" :props="props">{{ props.row.reason.description }}</q-td>
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

export default createComponent({
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;

        const selected: any = ref([]);
        const pagination = {
            sortBy: 'waiverId',
            descending: true,
            };

        const filterText: any = ref('');

        const allWaivers: any = ref([]);
        const waivers: any = ref([]);
        const loading: any = ref(false);

        const columns = [
            {name: 'waiverId', label: 'Waiver ID', field: 'waiverId', required: true, align: 'left', sortable: true},
            {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description > b.description },
            {name: 'vesselCGNumber', label: 'Vessel ID', field: 'vesselCGNumber', required: true,
            sortable: true, align: 'left' },
            {name: 'createdBy', label: 'Issuer', field: 'createdBy', required: true, align: 'left', sortable: true},
            {name: 'date', label: 'Issue Date', field: 'createdDate', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b) },
            {name: 'waiverType', label: 'Type', field: 'waiverType', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description > b.description},
            {name: 'reason', label: 'Reason', field: 'reason', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description > b.description },
        ];

        const getWaivers = async () => {
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

                allWaivers.value = waiversQuery.rows.map( (row: any) => row.doc);
                waivers.value = waiversQuery.rows.map( (row: any) => row.doc);

                loading.value = false;

            } catch (err) {
                console.log(err);
            }
        };

        const formatDateTime = (dateTime: string) => {
            return moment(dateTime).format('MM/DD/YYYY');
        };

        const formatIssuerName = (username: string) => {
            return startCase(username.replace('.', ' '));
        }

        onMounted( async () => {
            await getWaivers();
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
                    const needle = newVal.toLowerCase()
                    let waiverResults: any = [];
                        waiverResults = allWaivers.value.filter( (row: any) => {
                            return row.vessel.vesselName.toLowerCase().includes(needle) ||
                                   (row.vessel.coastGuardNumber ? row.vessel.coastGuardNumber : row.vessel.stateRegulationNumber).toLowerCase().includes(needle) ||
                                   row.createdBy.toLowerCase().includes(needle) ||
                                   row.createdDate.includes(needle) ||
                                   row.waiverType.description.toLowerCase().includes(needle) ||
                                   row.reason.description.toLowerCase().includes(needle)
                        })
                    waivers.value.length = 0;
                    waivers.value.push.apply(waivers.value, waiverResults);
                } else {
                    waivers.value.length = 0;
                    waivers.value.push.apply(waivers.value, allWaivers.value);
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
            waivers
        };
    }
});

</script>

<style>

</style>
