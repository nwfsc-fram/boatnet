<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
            <q-btn flat label="Dismiss" @click="clear"/>
        </template>
        </q-banner>

        {{ vessel.activeVessel }}

        <q-input v-model="vessel.activeVessel.vesselName" label="Vessel Name"></q-input>
        <q-input v-if="vessel.activeVessel.coastGuardNumber" v-model="vessel.activeVessel.coastGuardNumber" label="Coast Guard Number"></q-input>
        <q-input v-else v-model="vessel.activeVessel.stateRegulationNumber" label="State Regulation Number"></q-input>
        <q-input v-model="vessel.activeVessel.registeredLength.value" label="Registered Length (feet)" type="number"></q-input>

        <q-select
        v-model="vessel.activeVessel.captains"
        label="Vessel Captains"
        :options="filteredUsers"
        >
        </q-select>
    </div>
</template>

<script lang="ts">
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator

import router from '../router';
import { AlertState, VesselState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Vessel, VesselTypeTypeName } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';

@Component
export default class VesselDetails extends Vue {
    @State('alert') private alert!: AlertState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

    @State('vessel') private vessel!: VesselState;

  private created() {

  }

}

</script>

<style>
.my-special-class {
    width: 100px;
}

</style>
