<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
            <q-btn flat label="Dismiss" @click="clear"/>
        </template>
        </q-banner>

        <div class="centered-page-item">
            <q-btn class="bg-primary text-white q-ma-md" @click="emefpDetails(0)">New EM EFP</q-btn>
        </div>

        <q-table
            :data="EM_EFP"
            :columns="columns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="pagination"
            >
            
        <template v-slot:body="props">
        <q-tr :props="props" @click.native="emefpDetails(props.row)">
          <q-td key="id"></q-td>
          <q-td key="vesselName" :props="props">{{ props.row.vesselName }}</q-td>
          <q-td key="emEfpNumber" :props="props">{{ props.row.emEfpNumber }}</q-td>
          <q-td key="efpTypes" :props="props">
              {{ getArrayValues(props.row.efpTypes.map((type) => type.description )) }}</q-td>
          <q-td key="vesselCGNumber" :props="props">{{ props.row.vesselCGNumber }}</q-td>
          <q-td key="lePermit" :props="props">{{ props.row.lePermit }}</q-td>
          <q-td key="gear" :props="props">{{ getArrayValues(props.row.gear) }}</q-td>
          <q-td key="sector" :props="props">{{ props.row.sector }}</q-td>
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
import { EmEfpPermit } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';

@Component
export default class EMEFPManagementTable extends Vue {
    @State('alert') private alert!: AlertState;
    @State('emefp') private emefp!: EmefpState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

private selected = [];
private pagination = {rowsPerPage: 50};

private EM_EFP: EmEfpPermit[] = [];

private columns = [
    {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true },
    {name: 'emEfpNumber', label: 'EM EFP #', field: 'emEfpNumber', required: true, align: 'left', sortable: true },
    {name: 'efpTypes', label: 'EFP Type', field: 'efpTypes', required: true, align: 'left' },
    {name: 'vesselCGNumber', label: 'CG Number', field: 'vesselCGNumber', required: true, sortable: true },
    {name: 'lePermit', label: 'LE Permit', field: 'lePermit', required: true, align: 'left', sortable: true },
    {name: 'gear', label: 'Gear', field: 'gear', required: true, align: 'left' },
    {name: 'sector', label: 'Sector', field: 'sector', required: true, align: 'left', sortable: true },
    {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: true},
];

private async getEmEfpPermits() {
    const roDB: Client<any> = couchService.readonlyDB;
    try {
        // const vessels = await roDB.view<any>(
        //   'optecs_trawl',
        //   'all_vessel_names',
        //   queryOptions
        // );

        // this.options = vessels.rows.map((vessel) => vessel.value);

        const emefpPermits = await roDB.view<any>(
            'sethtest',
            'all_em_efp_permits',
            );

        console.log(emefpPermits.rows);

        for (const row of emefpPermits.rows) {
            const permit = row.value;
            permit.id = row.id;
            const types = [];
            for (const type of permit.efpTypes) {
                types.push(permit.type.description);
            }
            permit.eftTypes = types;
            this.EM_EFP.push(permit);
        }
        console.log(this.EM_EFP);

    } catch (err) {
        this.error(err);
    }
  }

  private created() {
    this.getEmEfpPermits();
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

private emefpDetails(permit: EmEfpPermit) {
    console.log(permit.vesselName);
    this.emefp.activeEmefpPermit = permit;
    console.log(this.emefp.activeEmefpPermit);
    this.$router.push({path: '/em-efp-details/' + this.EM_EFP.indexOf(permit) });
}

}
</script>

<style>
.my-special-class {
    width: 100px;
}
</style>


