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
          <q-td key="vesselName" :props="props">{{ props.row.vesselName }}</q-td>
          <q-td key="vesselCGNumber" :props="props">{{ props.row.vesselCGNumber }}</q-td>
          <q-td key="lePermit" :props="props">{{ props.row.lePermit }}</q-td>
          <q-td key="emEfpNumber" :props="props">{{ props.row.emEfpNumber }}</q-td>
          <q-td key="efpTypes" :props="props">
              {{ getArrayValues(props.row.efpTypes.map((type) => type.description )) }}</q-td>
          <q-td key="gear" :props="props">{{ getArrayValues(props.row.gear) }}</q-td>
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
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { EmEfp } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';

@Component
export default class EMEFPManagement extends Vue {
    @State('alert') private alert!: AlertState;
    @State('emefp') private emefp!: EmefpState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

private selected = [];
private pagination = {rowsPerPage: 50};

private EM_EFP: EmEfp[] = [];

private columns = [
    {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true },
    {name: 'vesselCGNumber', label: 'Vessel ID', field: 'vesselCGNumber', required: true,
    sortable: true, align: 'left' },
    {name: 'lePermit', label: 'LE Permit', field: 'lePermit', required: true, align: 'left', sortable: true },
    {name: 'emEfpNumber', label: 'EM EFP #', field: 'emEfpNumber', required: true, align: 'left', sortable: true },
    {name: 'efpTypes', label: 'EFP Type', field: 'efpTypes', required: true, align: 'left' },
    {name: 'gear', label: 'Gear', field: 'gear', required: true, align: 'left' },
    {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: true},
];

private async getEmEfp() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const queryOptions: ListOptions = {
          descending: true
        };

        const emefp = await masterDB.viewWithDocs<any>(
            'sethtest',
            'all_em_efp',
            queryOptions
            );

        console.log(emefp.rows);

        for (const row of emefp.rows) {
            const efp = row.doc;
            this.EM_EFP.push(efp);
        }
        console.log(this.EM_EFP);

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

private emefpDetails(efp: EmEfp) {
    // console.log(efp.vesselName);
    if (efp === null) {
        const newEmNum = parseInt(this.EM_EFP[0].emEfpNumber.substring(3), 10) + 1;
        efp = {
            type: 'em-efp',
            emEfpNumber: 'EM-' + newEmNum.toString(),
            vesselName: '',
            vesselCGNumber: '',
            efpTypes: [],
        };
        this.emefp.activeEmefp = efp;
        console.log(this.emefp.activeEmefp);
        this.$router.push({path: '/em-efp-details/' + 'new' });
    } else {
        this.emefp.activeEmefp = efp;
        console.log(this.emefp.activeEmefp);
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
