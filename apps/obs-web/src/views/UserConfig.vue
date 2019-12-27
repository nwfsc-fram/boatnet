<template>
    <div v-if="!offline" class="q-pa-md  q-gutter-md">
        <app-user-details></app-user-details>
    </div>
    <div v-else class="q-pa-md  q-gutter-md">
        <div class="text-h6">
            Network connection not detected - user config disabled.
        </div>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GeneralState, UserState, VesselState } from '../_store/types/types';
import { Vessel, PersonTypeName } from '@boatnet/bn-models';

import moment from 'moment';

// import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AlertState } from '../_store/types/types';
import { AuthState, authService } from '@boatnet/bn-auth';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

@Component
export default class UserConfig extends Vue {

    @State('user') private user!: UserState;
    @State('general') private general!: GeneralState;
    @State('vessel') private vessel!: VesselState;


    @State('alert') private alert!: AlertState;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;

    private vessels: Vessel[] = [];

    private notificationOptions: any[] = [
        {label: 'email', value: 'email', icon: 'mail'},
        {label: 'sms/text', value: 'sms/text', icon: 'sms'},
        {label: 'app', value: 'app', icon: 'smartphone'}
    ];

    private offline: boolean = false;

    constructor() {
        super();
    }

    private filterVessels(val: string, update: any, abort: any) {
      update(async () => {
            try {
              const masterDB: Client<any> = couchService.masterDB;
              const queryOptions: ListOptions = {
                limit: 7,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false
              };

              const vessels = await masterDB.viewWithDocs<any>(
                'optecs_trawl',
                'all_vessel_names',
                queryOptions
              );

              this.vessels = vessels.rows.map((row: any) => row.doc);
            } catch (err) {
              console.log(err);
            }
          });
        }

    private async getVessels() {
        const vesselCaptains: any = {};
        const db = pouchService.db;
        const queryOptions = {
            start_key: '',
            inclusive_end: true,
            descending: false,
            include_docs: true
        };
        try {
            const vessels = await db.query(
                'obs_web/vessel_captains',
                queryOptions,
                pouchService.lookupsDBName
                );
            for (const row of vessels.rows) {
                for (const captain of row.doc.captains) {
                    if (!vesselCaptains[captain.workEmail]) {
                        vesselCaptains[captain.workEmail] = [];
                    }
                    const vesselId = row.doc.coastGuardNumber ? row.doc.coastGuardNumber : row.doc.stateRegulationNumber;
                    vesselCaptains[captain.workEmail].push(row.doc);
                }
            }

            const activeUserEmail = this.user.activeUser!.workEmail;
            if (activeUserEmail) {
                this.vessels = vesselCaptains[activeUserEmail];
            }

        } catch (err) {
            console.log(err);
        }
    }

    private async getUser() {
        const db: Client<any> = couchService.masterDB;
        const queryOptions = {
            limit: 1,
            key: authService.getCurrentUser()!.username,
            include_docs: true
        };

        try {
            const userquery = await db.viewWithDocs<any>(
            'obs_web',
            'all_active_persons',
            queryOptions
            );

            if (userquery.rows[0]) {
                this.user.activeUser = userquery.rows[0].doc;
            } else {
                const newUser = {
                    type: PersonTypeName,
                    firstName: '',
                    lastName: '',
                    apexUserAdminUserName: authService.getCurrentUser()!.username,
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: {abbreviation: '', name: ''},
                    zipCode: '',
                    country: '',
                    workPhone: '',
                    homePhone: '',
                    cellPhone: '',
                    workEmail: '',
                    homeEmail: '',
                    birthdate: '',
                    activeVessel: this.vessel.activeVessel ? this.vessel.activeVessel : '',
                    port: this.vessel.activeVessel ? this.vessel.activeVessel!.homePort : '',
                    createdBy: authService.getCurrentUser()!.username,
                    createdDate: moment().format()
                };

                Vue.set(this.user, 'activeUser', newUser);
                this.user.newUser = true;
            }
        } catch (err) {
            this.offline = true;
        }
    }

    private created() {

        this.getVessels();
        this.getUser();
    }

}
</script>
