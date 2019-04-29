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

        <q-list bordered separator>
            <q-item v-for="(efp, i) of EM_EFP" :key="efp.id"  @click.native="emefpDetails(efp)">
                <q-item-section>
                    <q-item-label class="text-primary"><strong>{{efp.vesselName}}</strong> </q-item-label>
                    <q-item-label caption>{{ efp.vesselCGNumber }}</q-item-label>
                </q-item-section>
                <q-item-section style="text-align: center">
                    <q-item-label class="text-primary text-weight-bold">{{ efp.emEfpNumber }}</q-item-label>
                    <q-item-label caption>{{ efp.lePermit }}</q-item-label>
                </q-item-section>
                <q-item-section style="text-align: right">
                    <q-item-label class="text-primary text-weight-bold">
                        <span v-for="(type, i) in efp.efpTypes" :key="i">{{ type.description }}
                        <span v-if="efp.efpTypes.length > 1 && i + 1 < efp.efpTypes.length">-</span>
                        </span>
                    </q-item-label>
                    <q-item-label caption>
                        {{ getArrayValues(efp.gear) }}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>



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
export default class EMEFPManagementResponsive extends Vue {
    @State('alert') private alert!: AlertState;
    @State('emefp') private emefp!: EmefpState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

private selected = [];
private pagination = {rowsPerPage: 50};

private EM_EFP: EmEfp[] = [];

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

private async getEmEfp() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
        // const vessels = await masterDB.view<any>(
        //   'optecs_trawl',
        //   'all_vessel_names',
        //   queryOptions
        // );

        // this.options = vessels.rows.map((vessel) => vessel.value);

        const emefp = await masterDB.view<any>(
            'sethtest',
            'all_em_efp_permits',
            );

        console.log(emefp.rows);

        for (const row of emefp.rows) {
            const efp = row.value;
            efp.id = row.id;
            const types = [];
            for (const type of efp.efpTypes) {
                types.push(efp.type.description);
            }
            efp.eftTypes = types;
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
    console.log(efp.vesselName);
    this.emefp.activeEmefp = efp;
    console.log(this.emefp.activeEmefp);
    this.$router.push({path: '/em-efp-details/' + this.EM_EFP.indexOf(efp) });
}

}
</script>

<style>
.my-special-class {
    width: 100px;
}
</style>
