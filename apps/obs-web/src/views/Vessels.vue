<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
            <q-btn flat label="Dismiss" @click="clear"/>
        </template>
        </q-banner>

        <div class="centered-page-item">
            <q-btn class="bg-primary text-white q-ma-md" @click="newVessel">New Vessel</q-btn>
        </div>

        <q-table
            :data="filteredVessels"
            :columns="columns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="pagination"
            class="bg-blue-grey-1"
            >

            <template v-slot:top="props">
                <q-input v-model="vessel.filterText" label="Search" style="width:100%" autofocus >
                    <template v-if="vessel.filterText">
                        <q-avatar dense icon="clear" @click="vessel.filterText = ''"></q-avatar>
                    </template>
                </q-input>
            </template>

        <template v-slot:body="props">
        <q-tr :props="props" @click.native="vesselDetails(props.row, props)">
          <q-td key="id"></q-td>
          <q-td key="vesselName" :props="props">{{ props.row.vesselName }}</q-td>
          <q-td key="vesselCGNumber" :props="props">{{ (props.row.coastGuardNumber ? props.row.coastGuardNumber : props.row.stateRegulationNumber) }}</q-td>
          <q-td key="vesselType" :props="props">{{ props.row.vesselType ? props.row.vesselType.description : '' }}</q-td>
          <q-td key="registeredLength" :props="props">{{ props.row.registeredLength.value ? props.row.registeredLength.value + '\'' : '' }}</q-td>
          <q-td key="port" :props="props">{{ props.row.port ? props.row.port.name : '' }}</q-td>
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
import { AlertState, VesselState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Vessel, VesselTypeTypeName } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';

@Component
export default class Vessels extends Vue {
    @State('alert') private alert!: AlertState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

    @State('vessel') private vessel!: VesselState;

private selected = [];
private pagination = {rowsPerPage: 50};

private vessels: Vessel[] = [];

private columns = [
    {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true },
    {name: 'vesselCGNumber', label: 'Vessel ID', field: 'vesselCGNumber', required: true,
    sortable: true, align: 'left' },
    {name: 'vesselType', label: 'Vessel Type', field: 'vesselType', required: true, align: 'left', sortable: true },
    {name: 'registeredLength', label: 'Registered Length', field: 'registeredLength', required: true, align: 'left', sortable: true },
    {name: 'port', label: 'Port', field: 'port', required: true, align: 'left', sortable: true },
    {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: true},
];

private async getVessels() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const queryOptions: any = {
          include_docs: true
        };

        const vessels = await masterDB.viewWithDocs<any>(
            'optecs_trawl',
            'all_vessel_names',
            queryOptions
            );

        for (const row of vessels.rows) {
            const vessel = row.doc;
            this.vessels.push(vessel);
        }

    } catch (err) {
        this.error(err);
    }
  }

      private get filteredVessels() {
        if (this.vessel.filterText.length > 0) {
            return this.vessels.filter( (vessel: any) => vessel.vesselName.toLowerCase().includes( this.vessel.filterText.toLowerCase() ));
        } else {
            return this.vessels;
            }
    }

  private created() {
    this.getVessels();
  }

private vesselDetails(vessel: any) {
    this.vessel.activeVessel = vessel;

    const i = vessel.__index;
    this.$router.push({path: '/vessels/' + i});
    }

private newVessel() {
    this.vessel.activeVessel = {
        createdBy: authService.getCurrentUser()!.username,
        createdDate: moment().format(),
        vesselName: '',
        port: undefined
    };
    this.$router.push({path: '/vessels/' + 'new'});
}

}

</script>

<style>
.my-special-class {
    width: 100px;
}

</style>
