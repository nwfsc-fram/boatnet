<template>
    <div>
        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>
        <div v-if="user.activeUser">
            <div>
                <div class="row">
                    <q-input class="col-md q-pa-sm wide-field" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.firstName" label="First Name"></q-input>
                    <q-input class="col-md q-pa-sm wide-field" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.lastName" label="Last Name"></q-input>
                    <div v-if="user.activeUser.apexUserAdminUserName && user.activeUser.apexUserAdminUserName !== ''" class="q-ma-sm col-md row">
                        <q-input
                        class="col2"
                        style="width: 80%"
                        v-model="user.activeUser.apexUserAdminUserName"
                        disabled
                        readonly
                        outlined
                        dense
                        label="User Name"
                        >
                        </q-input>
                        <q-btn v-if="$route.name === 'User Details' && user.activeUser._id" class="col" color="red-5" size="sm" flat @click.native="confirmUnlink = true">unlink</q-btn>
                    </div>
                    <div v-else class="q-ma-sm" style="width: 100%">
                        <q-select
                        outlined
                        class="wide-field"
                        dense
                        label="apex UserAdmin UserName"
                        v-model="user.activeUser.apexUserAdminUserName"
                        :option-label="opt => opt.apexUserAdminUserName"
                        :option-value="opt => opt.apexUserAdminUserName"
                        emit-value
                        :options="user.unLinkedApexUsers"
                        ></q-select>
                    </div>
                </div>

                <q-select
                    v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator'])"
                    class="q-pa-sm"
                    outlined
                    v-model="applicationRoles"
                    label="Roles (staff only)"
                    multiple
                    :options="roles"
                    >
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
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.workEmail" label="Email (Work)" type="email"></q-input>
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.homeEmail" label="Email (Home)" type="email"></q-input>
                </div>

                <div class="row">
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.cellPhone" label="Mobile Number" type="tel"></q-input>
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.homePhone" label="Home Phone" type="tel"></q-input>
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.workPhone" label="Work Phone" type="tel"></q-input>
                </div>

                <div class="row">
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.addressLine1" label="Address Line 1" type="street-address"></q-input>
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.addressLine2" label="Address Line 2" type="street-address"></q-input>
                </div>

                <div class="row">
                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.city" label="City" type="address-level2"></q-input>

                    <q-select class="col-md q-pa-sm  wide-field" outlined dense v-model="user.activeUser.state" label="State" type="address-level1" fill-input
                    hide-selected @filter="statesFilterFn" :options="usStateOptions" use-input :option-label="opt => opt.abbreviation + ' (' + opt.name + ')'" 
                    option-value="_id" emit-label></q-select>

                    <q-input class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.zipcode" label="Zip Code" type="postal-code"></q-input>

                    <q-select class="col-md q-pa-sm wide-field" outlined dense v-model="user.activeUser.country" label="Country" :options="countryOptions"></q-select>
                </div>

                <div class="row">
                    <q-select
                    class="col-md q-pa-sm wide-field"
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
                    v-if="!user.newUser"
                    class="col-md q-pa-sm wide-field"
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

                    <q-select class="q-pa-sm wide-field" outlined label="Notification Preferences" v-model="user.activeUser.notificationPreferences" :options="notificationOptions" multiple use-input stack-label >

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

                <!-- <q-input class="col-md q-pa-sm wide-field"
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
                </q-input> -->
<!--
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
                </q-select> -->
                <div class="q-pa-sm">
                    <div class="text-h6">Emergency Contacts:</div>
                    <q-btn v-if="!contactEditing" color="primary" label="add" @click="addEmergencyContact" class="q-ma-sm"></q-btn>
                    <q-card v-if="contactEditing">
                        <q-card-section>
                        <span>
                            <q-input
                            dense
                            v-model="editContact.firstName"
                            label="First Name"
                            >
                            </q-input>
                            <q-input
                            dense
                            v-model="editContact.lastName"
                            label="Last Name"
                            >
                            </q-input>
                        </span>
                        <span>
                            <q-input
                            dense
                            v-model="editContact.relation"
                            label="Relation"
                            >
                            </q-input>
                            <q-input
                            dense
                            v-model="editContact.phoneNumber"
                            label="Phone"
                            >
                            </q-input>
                        </span>
                            <q-card-actions>
                                <q-btn label="done" color="primary" @click="addContact"></q-btn>
                                <q-btn v-if="isNewContact" label="cancel" color="red" @click="discardEntry"></q-btn>
                            </q-card-actions>
                        </q-card-section>
                    </q-card>

                        <q-card v-for="emergencyContact of user.activeUser.emergencyContacts" :key="user.activeUser.emergencyContacts.indexOf(emergencyContact)">
                            <q-card-section>

                                <q-item-label class="text-weight-medium">{{ emergencyContact.firstName }} {{ emergencyContact.lastName }}</q-item-label>
                                <q-item-label class="text-primary" caption>relation: {{ emergencyContact.relation }}</q-item-label>
                                <q-item-label class="text-primary" caption>phone: {{ emergencyContact.phoneNumber }}</q-item-label>

                                <q-card-actions>
                                    <q-btn
                                    label="edit"
                                    color="primary"
                                    class="q-ma-sm"
                                    @click="setEditContact(emergencyContact)"
                                    v-if="!contactEditing"
                                    />
                                    <q-btn
                                    label="delete"
                                    color="red"
                                    class="q-ma-sm"
                                    @click="confirmDelete(emergencyContact)"
                                    v-if="!contactEditing"
                                    />
                                </q-card-actions>
                            </q-card-section>
                        </q-card>

                </div>

            </div>

            <q-dialog v-model="deleteConfirm">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Are you sure you want to remove {{ contactToDelete.firstName }} {{ contactToDelete.lastName }} from your emergency contacts?</div>
                        <q-card-actions class="float-right">
                            <q-btn color="primary" label="cancel" @click="deleteConfirm = false"></q-btn>
                            <q-btn color="red" label="delete" @click="deleteContact"></q-btn>
                        </q-card-actions>
                    </q-card-section>
                </q-card>
            </q-dialog>

            <q-dialog v-model="confirmUnlink">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Are you sure you want to unlink this boatnet account from apexUserAdminUserName: <br>{{ user.activeUser.apexUserAdminUserName }}?</div>
                        <q-card-actions class="float-right">
                            <q-btn color="primary" label="cancel" @click="confirmUnlink = false"></q-btn>
                            <q-btn color="red" label="unlink" @click="unlinkApexUserName"></q-btn>
                        </q-card-actions>
                    </q-card-section>
                </q-card>
            </q-dialog>

            <div class="q-pa-md  q-gutter-md" align="right">
                <q-btn v-if="this.$route.name === 'User Details'" color="red" label="Cancel" @click="navigateBack"></q-btn>
                <q-btn color="primary" label="Save" @click="saveUser"></q-btn>
            </div>

        </div>
        <div v-else>
            no active user
        </div>
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
import axios from 'axios';

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
    private storedRoles = [];

    private userRoles: string[] = [];

    private notificationOptions: any[] = [
    {label: 'email', value: 'email', icon: 'mail'},
    {label: 'sms/text', value: 'sms/text', icon: 'sms'},
    {label: 'app', value: 'app', icon: 'smartphone'}
    ];

    private roles: any[] = [];
    private editContact: any = {};
    private contactEditing: boolean = false;
    private deleteConfirm: boolean = false;
    private contactToDelete: any = {};
    private isNewContact: boolean = false;

    private confirmUnlink = false;
    private url: string = '';

    constructor() {
        super();
    }

    private isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (this.userRoles.includes(role)) {
          return true;
        }
      }
      return false;
    }

    private unlinkApexUserName() {
        this.user.activeUser!.apexUserAdminUserName = '';
        this.confirmUnlink = false;
    }

    private setEditContact(emergencyContact: any) {
        Vue.set(this.editContact, 'firstName', emergencyContact.firstName);
        Vue.set(this.editContact, 'lastName', emergencyContact.lastName);
        Vue.set(this.editContact, 'relation', emergencyContact.relation);
        Vue.set(this.editContact, 'phoneNumber', emergencyContact.phoneNumber);

        this.contactEditing = true;
        this.user.activeUser!.emergencyContacts!.splice(this.user.activeUser!.emergencyContacts!.indexOf(emergencyContact), 1);
    }

    private addEmergencyContact() {
        const newContact = {
            firstName: '',
            lastName: '',
            relation: '',
            phoneNumber: ''
        };

        Vue.set(this.editContact, 'firstName', '');
        Vue.set(this.editContact, 'lastName', '');
        Vue.set(this.editContact, 'relation', '');
        Vue.set(this.editContact, 'phoneNumber', '');

        this.contactEditing = true;
        this.isNewContact = true;
    }

    private addContact() {
        if (!this.user.activeUser!.emergencyContacts) {
            this.user.activeUser!.emergencyContacts = [];
        }
        this.user.activeUser!.emergencyContacts.unshift(this.editContact);
        this.editContact = {};
        this.contactEditing = false;
    }

    private confirmDelete(emergencyContact: any) {
        this.contactToDelete = emergencyContact;
        this.deleteConfirm = true;
    }

    private deleteContact() {
        this.user.activeUser!.emergencyContacts!.splice(this.user.activeUser!.emergencyContacts!.indexOf(this.contactToDelete), 1);
        this.deleteConfirm = false;
    }

    private discardEntry() {
        this.editContact = {};
        this.contactEditing = false;
        this.isNewContact = false;
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
                    console.log(err);
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
                console.log(err);
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
              console.log(err);
            }
          });
        }

    private statesFilterFn(val: string, update: any, abort: any) {
        if (val === '') {
            update(() => {
                this.usStateOptions = this.usStates;
                });
            return;
        }

        update( () => {
            const inputVal = val.toLowerCase();
            this.usStateOptions = this.usStates.filter(
                (state) => state.name.toLowerCase().indexOf(inputVal) > -1 ||
                state.abbreviation.toLowerCase().indexOf(inputVal) > -1
                );
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

                if (this.user.activeUser) {
                    const activeUserEmail = this.user.activeUser!.workEmail;
                    if (activeUserEmail) {
                        this.vessels = vesselCaptains[activeUserEmail];
                    }
                }


            } catch (err) {
                console.log(err);
            }
        }

    private saveUser() {
        if (this.user.activeUser!.activeVessel) {
            this.vessel.activeVessel = this.user.activeUser!.activeVessel;
        }
        if (this.user.activeUser!.workEmail !== '' && this.user.activeUser!.cellPhone !== '') {
            if (this.user.newUser) {
                console.log('new user');
                console.log(this.user.newUser);
                this.user.newUser = false;
                if (this.user.activeUser!.type === 'apexUser') {
                    this.user.activeUser!.type = 'person';
                }
                if (this.$route.name === 'User Details') {
                    couchService.masterDB.post(this.user.activeUser).then(
                        setTimeout( () => {
                            this.errorAlert('User Config Saved'),
                            this.$router.push({path: '/'});
                        } , 500)
                    );
                } else {
                    couchService.masterDB.post(this.user.activeUser).then(
                        setTimeout( () => {
                            this.errorAlert('User Config Saved'),
                            this.$router.push({path: '/'});
                        } , 500)
                    );
                }
            } else {
                console.log('existing user');
                this.updateUserRoles();
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
                    couchService.masterDB.put(
                        this.user.activeUser!._id,
                        this.user.activeUser!,
                        this.user.activeUser!._rev
                    )
                    // pouchService.db.put(pouchService.userDBName, this.user.activeUser)
                    .then(
                        this.errorAlert('User Config Saved'),
                        this.$router.push({path: '/'})
                    );
                }
            }
        } else {
            this.errorAlert('Work Email and Mobile Number are required fields.');
        }

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
                activeVessel: this.vessel.activeVessel ? this.vessel.activeVessel : '',
                port: this.vessel.activeVessel ? this.vessel.activeVessel!.homePort : '',
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format()
            };

            Vue.set(this.user, 'activeUser', newUser);
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
            console.log(err);
        }
    }

    private async getRoles() {
        axios.get(this.url + '/api/v1/roles', {
        params: {
            token: authService.getCurrentUser()!.jwtToken,
            applicationName: 'BOATNET_OBSERVER'
            }
        })
        .then((response) => {
            console.log(response);
            this.roles = response.data.roles.map( (role: any) => role );
        });
    }

    private async getUserRoles() {
        axios.get(this.url + '/api/v1/user-role', {
        params: {
            token: authService.getCurrentUser()!.jwtToken,
            username: this.user.activeUser!.apexUserAdminUserName,
            applicationName: 'BOATNET_OBSERVER'
            }
        })
        .then((response) => {
            console.log(response);
            this.applicationRoles = response.data.roles.map( (role: any) => role);
            this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
            this.storedRoles = response.data.roles.map( (role: any) => role);
        });
    }

    private async updateUserRoles() {
        for (const role of this.applicationRoles) {
            // compare this.applicationRoles to this.storedRoles...
            if (this.storedRoles.indexOf(role) === -1) {
            // if role in applicationRoles but not in storedRoles - add it
                axios.post(this.url + '/api/v1/user-role', {
                    token: authService.getCurrentUser()!.jwtToken,
                    username: this.user.activeUser!.apexUserAdminUserName,
                    applicationName: 'BOATNET_OBSERVER',
                    role
                })
                .then((response) => {
                    console.log(response);
                });
            }
        }

        for (const role of this.storedRoles) {
            if (this.applicationRoles.indexOf(role) === -1) {
                // if role in storedRoles but not in applicationRoles - delete it
                    const headers: any = {
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    };

                    const params: any = {
                        username: this.user.activeUser!.apexUserAdminUserName,
                        applicationName: 'BOATNET_OBSERVER',
                        token: authService.getCurrentUser()!.jwtToken,
                        role
                    };


                    axios.delete(this.url + '/api/v1/user-role', {
                        headers, params
                        })
                    .then((response) => {
                    console.log(response);
                    });
            }
        }
    }

    private created() {
        console.log(this.user.activeUser);
        console.log(authService.getCurrentUser());

        if (authService.apiUrl) {
            this.url = authService.apiUrl;
        } else {
            this.url = '';
        }

        this.getRoles();
        this.getUserRoles();
        if (this.user.activeUser && this.user.activeUser.type === 'apexUser') {
            this.user.newUser = true;
        }
    }

    private mounted() {
        // if (this.$route.name === 'User Config') {
        //     this.getUser();
        // }
        this.getVessels();
        this.getUsStates();
    }

    private navigateBack() {
        this.$router.back();
        }
}
</script>

<style scoped>

.wide-field {
    width: 100% !important;
    max-width: 500px !important;
}

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
