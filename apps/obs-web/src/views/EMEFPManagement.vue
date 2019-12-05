<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clear"/>
            </template>
        </q-banner>

        <div class="centered-page-item">
            <q-btn class="bg-primary text-white q-ma-md" @click="emefpDetails(null)">New EM EFP</q-btn>
        </div>

        <q-table
            :data="EM_EFP"
            :columns="columns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="pagination"
            class="bg-blue-grey-1"
            >

        <template v-slot:body="props">
        <q-tr :props="props" @click.native="emefpDetails(props.row)">
          <q-td key="id"></q-td>
          <q-td key="vesselName" :props="props">{{ props.row.vessel.vesselName ? props.row.vessel.vesselName : '' }}</q-td>
          <q-td key="vesselCGNumber" :props="props">{{ props.row.vessel.coastGuardNumber ? props.row.vessel.coastGuardNumber : props.row.vessel.stateRegulationNumber }}</q-td>
          <q-td key="lePermit" :props="props">{{ getLEPermit(props.row) }}</q-td>
          <q-td key="emEfpNumber" :props="props">{{ props.row.emEfpNumber }}</q-td>
          <q-td key="efpTypes" :props="props">
              {{ getArrayValues(props.row.efpTypes.map((type) => type.description )) }}</q-td>
          <q-td key="gear" :props="props">{{ getArrayValues(props.row.gear.map((gear) => gear.description)) }}</q-td>
          <q-td key="notes" :props="props">{{ props.row.notes }}</q-td>
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
import { AlertState, EmefpState } from '../_store/types/types';
import { AuthState, authService } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { EmEfp, EmEfpTypeName } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';

@Component
export default class EMEFPManagement extends Vue {
    @State('alert') private alert!: AlertState;
    @State('emefp') private emefp!: EmefpState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

private selected = [];
private pagination = {sortBy: 'vesselName', descending: false, rowsPerPage: 50};

private EM_EFP: EmEfp[] = [];

private columns = [
    {name: 'vesselName', label: 'Vessel Name', field: 'vessel', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => ('' + a.vesselName).localeCompare(b.vesselName) },
    {name: 'vesselCGNumber', label: 'Vessel ID', field: 'vesselCGNumber', required: true, align: 'left', sortable: true, sort: (a: string, b: string) => {
        const reA = /[^a-zA-Z]/g;
        const reN = /[^0-9]/g;

        const aA = a.replace(reA, '');
        const bA = b.replace(reA, '');
        if (aA === bA) {
            const aN = parseInt(a.replace(reN, ''), 10);
            const bN = parseInt(b.replace(reN, ''), 10);
            return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
            return aA > bA ? 1 : -1;
            }
        }
    },
    {name: 'lePermit', label: 'LE Permit', field: 'lePermit', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.localeCompare(b, 'en', { numeric: true }) },
    {name: 'emEfpNumber', label: 'EM EFP #', field: 'emEfpNumber', required: true, align: 'left', sortable: true },
    {name: 'efpTypes', label: 'EFP Type', field: 'efpTypes', required: true, align: 'left' },
    {name: 'gear', label: 'Gear', field: 'gear', required: true, align: 'left' },
    {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: true},
];

private async getEmEfp() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const queryOptions = {
            reduce: false,
            include_docs: true,
            key: 'emefp'
        };

        const emefp: any = await masterDB.view(
            'obs_web',
            'all_doc_types',
            queryOptions
            );

        this.EM_EFP = emefp.rows.map((row: any) => row.doc);


    } catch (err) {
        this.error(err);
    }
  }

  private created() {
    this.getEmEfp();
  }

private getArrayValues(array: any[]) {
    let returnString  = '';
    for (const item of array) {
        returnString += item;
        if (array.indexOf(item) + 1 < array.length && array.length > 1) {
            returnString += ' , ';
        }
    }
    return returnString;
}

private getVesselId(row: any) {
    if (row.vesselCGNumber) {
        return row.vesselCGNumber;
    } else if (row.vessel) {
        return row.vessel.coastGuardNumber ? row.vessel.coastGuardNumber : row.vessel.stateRegulationNumber;
    } else {
        return '';
    }
}

private getLEPermit(row: any) {
    if (row.lePermit) {
        return row.lePermit;
    } else {
        return '';
    }
}

private emefpDetails(efp: EmEfp) {
    // console.log(efp.vesselName);
    if (efp === null) {
        const newEmNum = parseInt(this.EM_EFP[0].emEfpNumber.substring(3), 10) + 1;
        efp = {
            createdBy: authService.getCurrentUser()!.username,
            createdDate: moment().format(),
            type: EmEfpTypeName,
            emEfpNumber: 'EM-' + newEmNum.toString(),
            vessel: {},
            efpTypes: [],
        };
        this.emefp.activeEmefp = efp;
        this.emefp.newEmEfp = true;
        this.$router.push({path: '/em-efp-details/' + 'new' });
    } else {
        this.emefp.activeEmefp = efp;
        this.emefp.newEmEfp = false;
        this.$router.push({path: '/em-efp-details/' + this.EM_EFP.indexOf(efp) });
    }

}

}
</script>

<style>
.my-special-class {
    width: 100px;
}

</style>
