<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>

        <div class="centered-page-item">
            <q-btn class="bg-primary text-white q-ma-md" @click="newVessel">New Vessel</q-btn>
        </div>

        <q-table
            :data="vessels"
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
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator

import router from '../router';
import { AlertState, VesselState } from '../_store/types/types';
import { AuthState, authService } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Vessel, VesselTypeTypeName, VesselTypeName } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';

@Component
export default class Vessels extends Vue {
    @State('alert') private alert!: AlertState;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;

    @State('vessel') private vessel!: VesselState;

private selected = [];
private pagination = {
    sortBy: 'name',
    descending: false,
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 10
    };

private vessels: Vessel[] = [];
private vesselNames: any = [];
private loading: boolean = false;
private searchText: string = '';

private columns = [
    {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true },
    {name: 'vesselCGNumber', label: 'Vessel ID', field: 'vesselCGNumber', required: true,
    sortable: true, align: 'left' },
    {name: 'vesselType', label: 'Vessel Type', field: 'vesselType', required: true, align: 'left', sortable: true },
    {name: 'registeredLength', label: 'Registered Length (ft)', field: 'registeredLength', required: true, align: 'left', sortable: true },
    {name: 'port', label: 'Port', field: 'Home Port', required: true, align: 'left', sortable: true },
    {name: 'isActive', label: 'Status', field: 'isActive', required: true, align: 'left', sortable: true },
    {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: false },
    {name: 'emHardware', label: 'EM Hardware', field: 'emHardware', required: false, align: 'left', sortable: true },
    {name: 'thirdPartyReviewer', label: '3rd Party Reviewer', field: 'thirdPartyReviewer', required: false, align: 'left', sortable: true },

];

private async getVessels() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
        this.loading = true;
        const queryOptions: any = {
          include_docs: false
        };

        const vessels = await masterDB.view<any>(
            'obs_web',
            'all_vessel_names',
            queryOptions
            );


        this.vesselNames = vessels.rows.map( (row: any) => {
            return {vesselNameAndReg: row.value, id: row.id};
        });

        this.loading = false;

    } catch (err) {
        this.errorAlert(err);
    }
  }

//   private async onRequest(props: any) {

//     const { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination;
//     const filter = props.filter ? props.filter : '';

//     try {
//         this.loading = true;
//         const db = couchService.masterDB;
//         const queryOptions = {
//             limit: 20,
//             start_key: filter.toLowerCase(),
//             end_key: filter.toLowerCase() + '\u9999' ,
//             inclusive_end: true,
//             descending: false,
//             include_docs: true
//         };

//         const vessels = await db.view(
//             'obs_web',
//             'all_vessel_names',
//             queryOptions
//             );

//         for (const row of vessels.rows) {
//             if ( row.doc.isActive === undefined ) {
//                 row.doc.isActive = true;
//             }
//         }

//         this.vessels = vessels.rows.map((row: any) => row.doc);

//         this.loading = false;
//         return this.vessels;
//     } catch (err) {
//         this.errorAlert(err);
//     }

//   }

  private created() {
    this.getVessels().then(
        () => {
            if (this.vessel.filterText) {
                return this.getSearchVessels(this.vessel.filterText);
            } else {
               return this.getSearchVessels('a');
            }
        }
    );

    // this.onRequest({
    //     pagination: this.pagination,
    //     filter: this.vessel.filterText
    // });
  }

private vesselDetails(vessel: any) {
    this.vessel.activeVessel = vessel;

    const i = vessel.__index;
    this.$router.push({path: '/vessels/' + i});
    }

private newVessel() {
    this.vessel.activeVessel = {
        type: VesselTypeName,
        createdBy: authService.getCurrentUser()!.username,
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
    this.$router.push({path: '/vessels/' + 'new'});
}

  private async getSearchVessels(searchString: string) {
    this.vessels = [];
    const matchedVessels = this.vesselNames.filter((vessel: any) => vessel.vesselNameAndReg.toLowerCase().includes(searchString.toLowerCase()));
    matchedVessels.sort((a: any, b: any) => {
        const keyA = a.vesselNameAndReg.toLowerCase();
        const keyB = b.vesselNameAndReg.toLowerCase();
        if (keyA < keyB) {
            return -1;
        }
        if (keyA > keyB) {
            return 1;
        }
        return 0;
        }
    )

    const ids = matchedVessels.map( (vessel: any) => vessel.id);
    try {
        const db = couchService.masterDB;
        for (const id of ids.splice(0, 20)) {
            const doc = await db.get(id);
            this.vessels.push(doc);
        }
    } catch (err) {
        console.log(err);
    }

  }

  @Watch('vessel.filterText')
  private async handler3(newVal: string, oldVal: string) {
    this.getSearchVessels(newVal);
  }

}

</script>

<style>
.my-special-class {
    width: 100px;
}

</style>
