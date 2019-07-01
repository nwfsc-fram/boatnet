<template>
    <div>
        <q-card v-if="user.activeUser">

            <q-card-section>
                <div class="row">
                    <q-input class="col-md q-pa-sm" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.firstName" label="First Name"></q-input>
                    <q-input class="col-md q-pa-sm" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.lastName" label="Last Name"></q-input>
                    <q-input class="col-md q-pa-sm" disabled outlined dense v-model="user.activeUser.apexUserAdminUserName" label="User Name"></q-input>
                </div>

                <q-select class="q-pa-sm" outlined v-model="applicationRoles" label="Roles" multiple :options="roles">
                    <template v-slot:selected-item="scope">
                        <q-chip
                            removable
                            dense
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            color="primary"
                            text-color="white"
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

                    <q-select class="col-md q-pa-sm" outlined dense v-model="user.activeUser.state" label="State" type="address-level1" use-input fill-input
                    hide-selected :options="usStates" :option-label="opt => opt.abbreviation + ' (' + opt.name + ')'" option-value="_id"></q-select>

                    <q-input class="col-md q-pa-sm" outlined dense v-model="user.activeUser.zipcode" label="Zip Code" type="postal-code"></q-input>

                    <q-select class="col-md q-pa-sm" outlined dense v-model="user.activeUser.country" label="Country" use-input :options="countryOptions"></q-select>
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
                    fill-input
                    hide-selected
                    >
                    </q-select>

                    <q-select
                    class="col-md q-pa-sm"
                    outlined label="Active Vessel"
                    v-model="user.activeUser.activeVessel"
                    :options="vessels"

                    :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'" option-value="_id"
                    use-input
                    fill-input
                    hide-selected
                    dense
                    >
                    </q-select>
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
                            >
                            <q-avatar color="primary" text-color="white" :icon="scope.opt.icon" />
                            {{ scope.opt.label }}
                        </q-chip>
                    </template>

                </q-select>

                <q-input class="col-md q-pa-sm"
                outlined
                dense
                v-model="user.activeUser.birthdate" label="Birth Date">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                            <q-date v-model="user.activeUser.birthdate" @input="() => $refs.qDateProxy.hide()" />
                        </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>

                <q-select
                class="col-md q-pa-sm"
                label="Emergency Contacts"
                v-model="user.activeUser.emergencyContacts"
                :options="contacts"
                @filter="contactsFilterFn"
                :option-label="opt => opt.firstName + ' ' + opt.lastName + ' (' + opt.workEmail + ')'"
                option-value="_id"
                use-input
                multiple
                outlined
                use-chips
                >
                    <template v-slot:append>
                        <q-btn flat style="font-size: .5em" icon="fa fa-plus-circle" @click="newContact" >&nbsp;Add Contact</q-btn>
                    </template>

                    <template v-slot:selected-item="scope">
                        <q-chip
                            removable
                            dense
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            color="primary"
                            text-color="white"
                            >
                            <q-avatar color="primary" text-color="white" icon="person" />
                            <span>{{ scope.opt.firstName + ' ' + scope.opt.lastName }}</span>
                        </q-chip>
                    </template>
                </q-select>

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
import { Vessel, UsState, PersonTypeName, Person } from '@boatnet/bn-models';

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
    @State('vessel') private vessel!: VesselState;

    @State('alert') private alert!: AlertState;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;

    private vessels: Vessel[] = [];

    private usStateOptions: any = [];
    private usStates: UsState[] = [];
    private countryOptions = ['United States', 'Canada', 'Mexico'];

    private contacts: Person[] = [];

    private ports: any[] = [];

    private applicationRoles = [];

    private notificationOptions: any[] = [
    {label: 'email', value: 'email', icon: 'mail'},
    {label: 'sms/text', value: 'sms/text', icon: 'sms'},
    {label: 'app', value: 'app', icon: 'smartphone'}
    ];

    private roles = ['Captain', 'Observer', 'Staff', 'Provider', 'Permit Owner'];

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


    private contactsFilterFn(val: string, update: any, abort: any) {
    update(
        async () => {
            try {
                const db = couchService.masterDB;
                const queryOptions = {
                limit: 5,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false,
                include_docs: true
                };

                const contacts = await db.viewWithDocs(
                    'obs-web',
                    'all_persons',
                    queryOptions
                    );

                this.contacts = contacts.rows.map((row: any) => row.doc);

            } catch (err) {
                this.errorAlert(err);
            }
        }
    );
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
                // limit: 5,
                start_key: '',
                inclusive_end: true,
                descending: false,
                include_docs: true
                };

                // const vessels = await db.query(
                //     pouchService.lookupsDBName,
                //     'optecs_trawl/all_vessel_names',
                //     queryOptions
                //     );
                // this.vessels = vessels.rows.map((row: any) => row.doc);

                const vesselCaptains = await db.query(
                    pouchService.lookupsDBName,
                    'obs_web/vessel_captains',
                    queryOptions
                );
                for (const row of vesselCaptains.rows) {
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
                this.errorAlert(err);
            }
        }

    private saveUser() {
        if (this.user.activeUser!.activeVessel) {
            this.vessel.activeVessel = this.user.activeUser!.activeVessel;
        }
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
                if (row.doc.type === 'person' && row.doc.apexUserAdminUserName !== null) {
                    if (row.doc.apexUserAdminUserName === authService.getCurrentUser()!.username) {

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
                    'obs-web',
                    'all_usernames',
                    {key: authService.getCurrentUser()!.username}
                );

                if (user.rows.length > 0) {
                    couchService.masterDB.delete(user.rows[0].doc._id, user.rows[0].doc._rev);
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
                            firstName: '',
                            lastName: '',
                            apexUserAdminUserName: authService.getCurrentUser()!.username,
                            addressLine1: '',
                            addressLine2: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            country: '',
                            workPhone: '',
                            homePhone: '',
                            cellPhone: '',
                            workEmail: '',
                            homeEmail: '',
                            birthdate: '',
                            createdBy: authService.getCurrentUser()!.username,
                            createdDate: moment().format()
                            };
                        }
                    }
                );
    }

    private newContact() {
            const newUser = {
                type: PersonTypeName,
                firstName: '',
                lastName: '',
                apexUserAdminUserName: authService.getCurrentUser()!.username,
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                workPhone: '',
                homePhone: '',
                cellPhone: '',
                workEmail: '',
                homeEmail: '',
                birthdate: '',
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format()
            };
            this.user.activeUser = newUser;
            this.user.activeUser.activeVessel = this.vessel.activeVessel;
            this.user.activeUser.port = this.vessel.activeVessel!.homePort;
            this.user.newUser = true;
            this.$router.push({path: '/users/' + 'new'});
    }

    private async getUsStates() {
        const masterDB: Client<any> = couchService.lookupsDB;
        try {
        const queryOptions: ListOptions = {
            descending: false
        };

        const usstates = await masterDB.viewWithDocs<any>(
            'obs_web',
            'all_us_states',
            queryOptions
            );

        for (const row of usstates.rows) {
            const state = row.doc;
            this.usStates.push(state);
        }

        } catch (err) {
        this.errorAlert(err);
        }
    }

    private mounted() {
        if (this.$route.name === 'User Config') {
            this.getUser();
        }
        this.getVessels();
        this.getUsStates();
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
