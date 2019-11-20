<template>
    <div>

    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>

        <div class="centered-page-item" style="margin: 10px"><strong>Active Permits</strong></div>
            <div style="background-color: white" class="q-pa-md q-gutter-sm centered-page-item">
                <q-input v-model="permit.filterText" label="Search" style="width: 100%" autofocus >
                    <template v-if="permit.filterText">
                        <q-avatar dense icon="clear" @click="permit.filterText = ''"></q-avatar>
                    </template>
                </q-input>
            </div>
        <q-list bordered separator>
            <q-item v-for="(permit, i) of filteredPermits" :key="i">
                <q-item-section  @click="permitDetails(permit, i)">
                    <q-item-label ><strong>{{ permit.permitNumber }}</strong> <span class="text-primary" style="position: relative; left: 20px">{{ permit.vessel.vesselName }}</span></q-item-label>
                </q-item-section>
            </q-item>

        </q-list>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from 'axios';
import { PermitState, AlertState } from '../_store/types/types';

@Component
export default class Permits extends Vue {

    @State('permit') private permit!: PermitState;
    @Action('updatePermits', { namespace: 'permit' }) private updatePermits: any;

    @State('alert') private alert!: AlertState;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;

    private keys = ['permit_number', 'vessel_name', 'vessel_registration_number', 'vessel_owner'];

    constructor() {
        super();
    }

    // private getPermits() {
    //     axios.get('https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500')
    //         .then( (response) => {
    //             // this.$store.dispatch('updatePermits', response.data.items);
    //             console.log(response.data.items)
    //             this.permit.permits = response.data.items;
    //             console.log(this.permit.permits);
    //         });
    // }

    private permitDetails(permit: any, i: number) {
        this.permit.activePermit = permit;
        this.$router.push({path: '/permits/' + i});
    }


    private get filteredPermits() {
        if (this.permit.filterText.length > 0) {
            return this.permit.permits.filter( (permit: any) =>
                permit.vessel.vesselName.toLowerCase().includes( this.permit.filterText.toLowerCase() ) ||
                permit.permitNumber.toLowerCase().includes( this.permit.filterText.toLowerCase() )
                );
        } else {
            return this.permit.permits;
            }
    }

}
</script>
