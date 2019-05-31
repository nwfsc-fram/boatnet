<template>
    <div>
        <q-card v-if="user.activeUser">

            <q-card-section>
                <div class="row">
                    <q-input class="col-md q-pa-sm" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.firstName" label="First Name"></q-input>
                    <q-input class="col-md q-pa-sm" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.lastName" label="Last Name"></q-input>
                    <q-input class="col-md q-pa-sm" disabled outlined dense v-model="user.activeUser.userName" label="User Name"></q-input>
                </div>

                <q-select class="q-pa-sm" outlined v-model="user.activeUser.applicationRoles" label="Roles" multiple :options="roles">
                    <template v-slot:selected-item="scope">
                        <q-chip
                            removable
                            dense
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            color="primary"
                            text-color="white"
                            class="q-ma-none"
                            >
                            <q-avatar color="primary" text-color="white" icon="person" />
                            {{ scope.opt }}
                        </q-chip>
                    </template>
                </q-select>

                <div class="row">
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.workEmail" label="Email (Work)" type="email"></q-input>
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.homeEmail" label="Email (Home)" type="email"></q-input>
                </div>

                <div class="row">
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.cellPhone" label="Mobile Number" type="tel"></q-input>
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.homePhone" label="Home Phone" type="tel"></q-input>
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.workPhone" label="Work Phone" type="tel"></q-input>
                </div>

                <div class="row">
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.addressLine1" label="Address Line 1" type="street-address"></q-input>
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.addressLine2" label="Address Line 2" type="street-address"></q-input>
                </div>

                <div class="row">
                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.city" label="City" type="address-level2"></q-input>

                    <q-select class="col-md q-pa-sm" outlined dense v-model="user.activeUser.state" label="State" type="address-level1" @filter="filterStates" use-input :options="usStateOptions"></q-select>

                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.zipcode" label="Zip Code" type="postal-code"></q-input>

                    <q-select class="col-md q-pa-sm" outlined dense v-model="user.activeUser.country" label="Country"  @filter="filterStates" use-input :options="usStateOptions"></q-select>
                </div>

                <div class="row">
                    <q-select
                    class="col-md q-pa-sm"
                    label="Home Port"
                    v-model="user.activeUser.port"
                    :options="ports"
                    @filter="portsFilterFn"
                    :option-label="opt => opt.name"
                    option-value="_id"
                    outlined
                    dense
                    stack-label
                    use-input
                    >
                    </q-select>

                    <q-select class="col-md q-pa-sm" outlined label="Active Vessel" v-model="user.activeUser.activeVessel" :options="vessels" @filter="filterVessels" option-label="vesselName" option-value="_id" use-input dense > </q-select>
                </div>

                <q-select class="q-pa-sm" outlined label="Notification Preferences" v-model="user.activeUser.notificationPreferences" :options="notificationOptions" multiple use-input stack-label >

                    <template v-slot:selected-item="scope">
                        <q-chip
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            removable
                            dense
                            color="primary"
                            text-color="white"
                            class="q-ma-none"
                            >
                            <q-avatar color="primary" text-color="white" :icon="scope.opt.icon" />
                            {{ scope.opt.label }}
                        </q-chip>
                    </template>

                </q-select>

                <q-input class="col-md q-pa-sm" outlined v-model="user.activeUser.birthdate" label="Birth Date" type="date"></q-input>

                <q-select class="col-md q-pa-sm" outlined label="Emergency Contacts" v-model="user.activeUser.emergencyContacts"></q-select>

            </q-card-section>
            <q-card-actions align="right">
                <q-btn v-if="this.$route.name === 'User Details'" color="red" label="Cancel" @click="navigateBack"></q-btn>
                <q-btn color="primary" label="Save" @click="saveUser"></q-btn>
            </q-card-actions>
        </q-card>
    </div>
</template>


<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { GeneralState, UserState, VesselState } from '../_store/types/types';
import { Vessel } from '@boatnet/bn-models';

import moment from 'moment';

import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AlertState } from '../_store/types/types';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

@Component
export default class UserDetails extends Vue {
    @State('general') private general!: GeneralState;
    @State('user') private user!: UserState;

    @State('alert') private alert!: AlertState;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;

    private vessels: Vessel[] = [];

    private usStateOptions: any = [];

    private ports: any[] = [];

    private get usStates() {
        return this.general.usStates;
    }

    private get roles() {
        return this.general.roles.sort();
    }

    private get notificationOptions() {
        return this.general.notificationOptions;
    }

    constructor() {
        super();
    }

    private portsFilterFn(val: string, update: any, abort: any) {
    update(
        async () => {
            try {
                const db = pouchService.db;
                const queryOptions = {
                limit: 5,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false,
                include_docs: true
                };

                const ports = await db.query(
                    pouchService.lookupsDBName,
                    'optecs_trawl/all_port_names',
                    queryOptions
                    );
                this.ports = ports.rows.map((row: any) => row.doc);
            } catch (err) {
                this.errorAlert(err);
            }
        }
    );
    }

    private filterStates(val: string , update: any) {
        if (val === '') {
            update(() => {
                this.usStateOptions = this.general.usStates.sort();
                });
            return;
        }
        update(() => {
            const searchString = val.toLowerCase();
            this.usStateOptions = this.general.usStates.filter(
                (v: any) => v.toLowerCase().indexOf(searchString) > - 1 ).sort();
            });
        }

    private filterVessels(val: string, update: any, abort: any) {
      update(async () => {
            try {
              const db = pouchService.db;
              const queryOptions = {
                limit: 5,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false,
                include_docs: true
              };

              const vessels = await db.query(
                pouchService.lookupsDBName,
                'optecs_trawl/all_vessel_names',
                queryOptions
              );

              this.vessels = vessels.rows.map((row: any) => row.doc);
            } catch (err) {
              this.errorAlert(err);
            }
          });
        }

    private async getVessels() {
            try {
                const db = pouchService.db;
                const queryOptions = {
                limit: 5,
                start_key: '',
                inclusive_end: true,
                descending: false,
                include_docs: true
                };

                const vessels = await db.query(
                    pouchService.lookupsDBName,
                    'optecs_trawl/all_vessel_names',
                    queryOptions
                    );
                this.vessels = vessels.rows.map((row: any) => row.doc);
            } catch (err) {
                this.errorAlert(err);
            }
        }

    private saveUser() {
        if (this.user.newUser) {
            console.log('new user');
            if (this.$route.name === 'User Details') {
                couchService.masterDB.post(this.user.activeUser).then(
                    this.navigateBack()
                );
            } else {
                pouchService.db.post(pouchService.userDBName, this.user.activeUser).then(
                    this.getUser()
                );
            }
        } else {
            console.log('existing user');
            this.user.activeUser!.updatedBy = authService.getCurrentUser()!.username;
            this.user.activeUser!.updatedDate = moment().format();
            if (this.$route.name === 'User Details') {
                couchService.masterDB.put(
                    this.user.activeUser!._id,
                    this.user.activeUser!,
                    this.user.activeUser!._rev
                ).then(
                this.navigateBack()
                );
            } else {
                pouchService.db.put(pouchService.userDBName, this.user.activeUser).then(
                    this.getUser()
                );
            }
        }
    }

    private async getUserFromUserDB() {
        // get user doc from userDB if exits
        console.log('getting user from userDB');

        try {
            const allDocs = await pouchService.db.allDocs(
                pouchService.userDBName
                );

            for (const row of allDocs.rows) {
                if (row.doc.type === 'person' && row.doc.userName) {
                    if (row.doc.userName === authService.getCurrentUser()!.username) {

                        this.user.newUser = false;
                        this.user.activeUser = row.doc;
                    }
                }
            }
        } catch (err) {
            this.errorAlert(err);
        }
    }

    private async getUserFromMasterDB() {
        // get user doc from master if exists / then put in userDB.
        if (this.user.activeUser === undefined) {
            console.log('Getting user from masterDB');
            try {
                const masterDB: Client<any> = couchService.masterDB;
                const user = await masterDB.viewWithDocs<any>(
                    'sethtest',
                    'all_usernames',
                    {key: authService.getCurrentUser()!.username}
                );

                if (user.rows) {
                    couchService.masterDB.remove(couchService.masterDB, user.rows[0].doc);
                    pouchService.db.put(pouchService.userDBName, user.rows[0].doc).then( this.getUserFromUserDB() );
                }
            } catch (err) {
                this.errorAlert(err);
            }
        }
    }


    private getUser() {
        this.user.activeUser = undefined;

        this.getUserFromUserDB().then(
           () => {
                this.getUserFromMasterDB();
                console.log('after get user from pouch');
                console.log(this.user.activeUser);
            }
           ).then(
               () => {
                    if (this.user.activeUser === undefined) {
                        this.user.newUser = true;
                        this.user.activeUser = {
                            type: 'person',
                            firstName: undefined,
                            lastName: undefined,
                            apexUserAdminUserName: authService.getCurrentUser()!.username,
                            createdBy: authService.getCurrentUser()!.username,
                            createdDate: moment().format()
                            };
                        }
                    }
                );
    }

    private mounted() {
        if (this.$route.name === 'User Config') {
            this.getUser();
        }
        this.getVessels();
    }

    private navigateBack() {
        this.$router.back();
        }
}
</script>

<style>

</style>


<!--
<script>
export default {
    data() {
        return {
            user: this.$store.getters.activeUser,
        }
    },
    computed: {
        usStates() {
            return this.$store.state.usStates
        },
        ports() {
            return this.$store.state.ports.sort()
        },
        roles() {
            return this.$store.state.roles.sort()
        }
    }
}
</script>
-->
