<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>

        <div class="centered-page-item">
            <q-btn class="bg-primary text-white q-ma-md" @click="newWaiver">New Waiver</q-btn>
        </div>

        <q-table
            :data="Waivers"
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

            <!-- :filter="vessel.filterText"
            @request="onRequest" -->
            <template v-slot:top>
                <q-input label="Vessel Name or Id" v-model="vessel.filterText" debounce="1000" placeholder="Search" style="width:100%" autofocus>
                    <template v-if="vessel.filterText">
                        <q-avatar dense icon="close" @click="vessel.filterText = ''"></q-avatar>
                    </template>
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" @click.native="vesselDetails(props.row, props)">
                    <q-td key="id"></q-td>
                    <q-td key="vesselName" :props="props">{{ props.row.vesselName }}</q-td>
                    <q-td key="vesselCGNumber" :props="props">{{ (props.row.coastGuardNumber ? props.row.coastGuardNumber : props.row.stateRegulationNumber) }}</q-td>
                    <q-td key="vesselType" :props="props">{{ props.row.vesselType ? props.row.vesselType.description : '' }}</q-td>
                    <q-td key="registeredLength" :props="props">{{ props.row.registeredLength ? props.row.registeredLength.value : '' }}</q-td>
                    <q-td key="port" :props="props">{{ props.row.homePort ? props.row.homePort.name : '' }}</q-td>
                    <q-td key="isActive" :props="props">{{ props.row.isActive ? 'Active' : 'Inactive' }}</q-td>
                    <q-td key="notes" :props="props">{{ props.row.notes }}</q-td>
                    <q-td key="emHardware" :props="props">{{ props.row.emHardware ? props.row.emHardware.description : '' }}</q-td>
                    <q-td key="thirdPartyReviewer" :props="props">{{ props.row.thirdPartyReviewer ? props.row.thirdPartyReviewer.description : '' }}</q-td>
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
import { Waiver, WaiverTypeTypeName } from '@boatnet/bn-models';

export default createComponent({
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;

        const selected = [];
        const pagination = {
            sortBy: 'name',
            descending: false,
            page: 1,
            rowsPerPage: 20,
            rowsNumber: 10
            };

        const waivers: any = ref([]);
        const loading: any = ref(false);

        const columns = [
            {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true },
            {name: 'vesselCGNumber', label: 'Vessel ID', field: 'vesselCGNumber', required: true,
            sortable: true, align: 'left' },
            {name: 'vesselType', label: 'Vessel Type', field: 'vesselType', required: true, align: 'left', sortable: true },
            {name: 'registeredLength', label: 'Length (ft)', field: 'registeredLength', required: true, align: 'left', sortable: true },
            {name: 'port', label: 'Home Port', field: 'port', required: true, align: 'left', sortable: true },
            {name: 'isActive', label: 'Status', field: 'isActive', required: true, align: 'left', sortable: true },
            {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: false },
            {name: 'emHardware', label: 'EM Hardware', field: 'emHardware', required: false, align: 'left', sortable: true },
            {name: 'thirdPartyReviewer', label: '3rd Party Reviewer', field: 'thirdPartyReviewer', required: false, align: 'left', sortable: true },

        ];

        const getVessels = async () => {
            const masterDB: Client<any> = couchService.masterDB;
            try {
                loading.value = true;
                const queryOptions: any = {
                include_docs: true,
                reduce: false,
                key: 'waiver'
                };

                const waiversQuery = await masterDB.view<any>(
                    'obs_web',
                    'all_doc_types',
                    queryOptions
                    );

                waivers.value = waiversQuery.rows.map( (row: any) => row.doc);

                loading.value = false;

            } catch (err) {
                console.log(err);
            }
        };

        onMounted( async () => {
            await getVessels();
        });

        const waiverDetails = async (waiver: any) => {
            const i = waiver.__index;
            router.push({path: '/vessels/' + i});
        };

        const newWaiver = () => {
            const waiver = {
                type: WaiverTypeTypeName,
                createdBy: state.authService.getCurrentUser()!.username,
                createdDate: moment().format(),
                vesselName: '',
                homePort: undefined,
                vesselType: {},
                registeredLength: {
                        measurementType: 'length',
                        value: undefined,
                        units: 'FT'
                    },
                isActive: true
            };
            router.push({path: '/vessels/' + 'new'});
        };

        return {
            columns,
            loading,
            newWaiver
        };
    }
});

</script>

<style>

</style>
