<template>
    <div class="q-ma-md">
        <div style="display: flex">
            <div>
                <div class="text-h6">
                    <b>Vessel:</b> {{ vessel.activeVessel.vesselName }}
                </div>
                <div class="text-h6">
                    <b>Vessel ID:</b> {{ vessel.activeVessel.coastGuardNumber ? vessel.activeVessel.coastGuardNumber : vessel.activeVessel.stateRegulationNumber }}
                </div>
                <br>
                <b>Trip Dates:</b><br>
                <q-input v-model="tripDates" mask="date" outlined dense></q-input>

                <div style="display: flex">
                    <div style="margin: 5px;">
                        <div style="text-align: center; font-weight: bold">Start Time</div>
                        <q-input v-model="startTime" mask="time" outlined dense></q-input>
                    </div>
                    <div style="margin: 5px;">
                        <div style="text-align: center; font-weight: bold">End Time</div>
                        <q-input v-model="endTime" mask="time" outlined dense></q-input>
                    </div>
                </div>

                <b>Start Port:</b> <span>
                    {{ vessel.activeVessel.homePort.name }}<br>
                    </span>
                <b>End Port:</b> <span>
                    {{ vessel.activeVessel.homePort.name }}<br>
                    </span>
                <br>
                <b>crew size</b>
                <q-input type="number" v-model="crewSize" outlined dense style="width: 55px">
                </q-input>

                <q-toggle color="primary" label="EFP" v-model="isEfp"></q-toggle>
                <q-toggle color="primary" label="EM" v-model="isEm"></q-toggle>
                <q-toggle color="primary" label="Observed" v-model="isObserved"></q-toggle>
                <br>
                <b>Buyers</b>
                <q-input v-model="buyers" outlined dense></q-input>
            </div>
            <div style="width: 20px"></div>
            <div>

                <q-table
                    title="Tows"
                    :columns="towColumns"
                    :data="towData"
                    hide-bottom
                >
                    <template v-slot:top-right>
                        <q-btn class="q-ma-md" label="new tow" color="primary"></q-btn>
                    </template>
                </q-table>

            </div>



        </div>


    </div>
</template>

<script lang="ts">
    import { mapState } from 'vuex';
    import router from 'vue-router';
    import { State, Action, Getter } from 'vuex-class';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import { TripState, PermitState, UserState, VesselState, AlertState } from '../_store/types/types';

    import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
    import { Client, CouchDoc, ListOptions } from 'davenport';
    import { AuthState, authService } from '@boatnet/bn-auth';

    import moment from 'moment';

    import Calendar from 'primevue/calendar';
    Vue.component('pCalendar', Calendar);

    @Component
    export default class ELogbook extends Vue {
        @State('trip') private trip!: TripState;
        @State('permit') private permit!: PermitState;
        @State('user') private user!: UserState;
        @State('vessel') private vessel!: VesselState;

        @State('alert') private alert!: AlertState;
        @Action('error', { namespace: 'alert' }) private errorAlert: any;
        @Action('clear', { namespace: 'alert' }) private clearAlert: any;

        private tripDates = [];
        private startTime: any;
        private endTime: any;
        private isEfp: boolean = true;
        private isEm: boolean = true;
        private isObserved: boolean = false;
        private crewSize: number = 1;
        private buyers: string = '';

        private towColumns = [
            {name: 'date', label: 'Date', field: 'TowDate', required: true, align: 'left', sortable: true },
            {name: 'set', label: 'Set', field: 'TowSet', required: true, align: 'left', sortable: true },
            {name: 'up', label: 'Up', field: 'TowUp', required: true, align: 'left', sortable: true },
            {name: 'latitude', label: 'Lat', field: 'TowLat', required: true, align: 'left', sortable: true },
            {name: 'longitude', label: 'Lon', field: 'TowLon', required: true, align: 'left', sortable: true },
            {name: 'avgdepth', label: 'Avg. Depth', field: 'TowDepth', required: true, align: 'left', sortable: true },
            {name: 'nettype', label: 'Net Type', field: 'TowNet', required: true, align: 'left', sortable: true },
            {name: 'target', label: 'Target Strategy', field: 'TowTarget', required: true, align: 'left', sortable: true },
            {name: 'species', label: 'Hake', field: 'TowSpecies1', required: true, align: 'left', sortable: true },
            {name: 'speciesdiscard', label: 'Hake Discard', field: 'TowSpecies1Discard', required: true, align: 'left', sortable: true },
        ];

        private towData = [
            {TowDate: '10/11/19', TowSet: '11:12', TowUp: '13:13', TowLat: '44.022.234', TowLon: '122.32.233', TowDepth: '60', TowNet: 'A', TowTarget: 'PWHT', TowSpecies1: '60,000 lbs', TowSpecies1Discard: '500 lbs'},
            {TowDate: '10/11/19', TowSet: '14:30', TowUp: '15:22', TowLat: '44.024.034', TowLon: '122.30.628', TowDepth: '53', TowNet: 'A', TowTarget: 'PWHT', TowSpecies1: '42,000 lbs', TowSpecies1Discard: '20 lbs'},
            {TowDate: '10/11/19', TowSet: '15:55', TowUp: '17:10', TowLat: '44.024.734', TowLon: '122.29.033', TowDepth: '44', TowNet: 'A', TowTarget: 'PWHT', TowSpecies1: '12,000 lbs', TowSpecies1Discard: '20 lbs'},
        ];

    }

</script>

<style>

body .p-inputtext {
    border-radius: 4px !important;
    background-color: #c8c8c8 !important;
}

</style>