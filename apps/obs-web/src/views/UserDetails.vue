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
                    <q-input class="col-md q-pa-sm wide-field" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.firstName" label="First Name" @click.native="selectText"></q-input>
                    <q-input class="col-md q-pa-sm wide-field" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.lastName" label="Last Name" @click.native="selectText"></q-input>
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
                        use-input
                        hide-selected
                        @filter="apexUsersFilterFn"
                        v-model="user.activeUser.apexUserAdminUserName"
                        :option-label="opt => opt.firstName + ' ' + opt.lastName"
                        :option-value="opt => opt.apexUserAdminUserName"
                        emit-value
                        :options="apexUserOptions"
                        ></q-select>
                    </div>
                </div>

                <q-select
                    v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator'])  && !user.captainMode"
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
                    <q-input
                        label="Email (Work)"
                        v-model="user.activeUser.workEmail"
                        type="email"
                        outlined
                        dense
                        class="col-md q-pa-sm wide-field"
                        @click.native="selectText"
                    ></q-input>

                </div>

                <q-btn
                    v-if="!editPhoneNumber"
                    label="add phone number"
                    icon="phone"
                    color="primary"
                    class="q-ma-sm"
                    @click="addPhone"
                ></q-btn>

                <q-card v-if="editPhoneNumber" style="width: 100%; max-width: 450px">
                    <q-card-section>
                        <q-select
                            label="type"
                            v-model="activePhoneNumber.phoneNumberType"
                            :options="phoneNumberTypes"
                            :option-label="opt => opt.description"
                            option-value="_id"
                            outlined
                            dense
                            class="q-pa-sm wide-field"
                        ></q-select>

                        <q-input
                            label="phone number"
                            v-model="activePhoneNumber.number"
                            type="number"
                            :rules="[
                            val => !!val || '* Required',
                            val => val.length === 10 || 'phone number must be exactly 10 digits (no dashes)'
                            ]"
                            outlined
                            dense
                            class="q-pa-sm wide-field"
                        ></q-input>

                        <q-toggle
                            label="active"
                            v-model="activePhoneNumber.isActive"
                        ></q-toggle>

                        <q-card-actions class="float-right">
                            <q-btn
                                :disabled="activePhoneNumber.number.length !== 10 || activePhoneNumber.phoneNumberType.description === ''"
                                label="save"
                                color="primary"
                                @click="editPhoneNumber = false"
                            ></q-btn>
                            <q-btn
                                v-if="newPhoneNumber"
                                label="cancel"
                                color="red-5"
                                @click="cancelEditPhone"
                            ></q-btn>
                        </q-card-actions>
                    </q-card-section>
                </q-card>

                <div class="row">

                    <q-card
                        v-for="number of userPhoneNumbers"
                        :key="userPhoneNumbers.indexOf(number)"
                        class="q-ma-sm my-card"
                    >
                        <q-card-section>
                            <div v-if="number.createdBy && $route.name === 'User Details'" class="float-right">
                                <sub>added by: <b>{{ number.createdBy }}</b>&nbsp;</sub>
                                <sub>on: <b>{{ getDate(number.createdDate) }}</b></sub>
                            </div>
                            <div v-if="number.updatedBy && $route.name === 'User Details'" class="float-right">
                                <sub>edited by: <b>{{ number.updatedBy }}</b>&nbsp;</sub>
                                <sub>on: <b>{{ getDate(number.updatedDate) }}</b></sub>
                            </div>
                            <div class="text-h6">
                                {{ number.phoneNumberType.description? number.phoneNumberType.description:'' }} number
                            </div>
                            <div class="text-subtitle2">
                                ({{ number.number.slice(0,3) }}) {{ number.number.slice(3,6) }}-{{ number.number.slice(6,10)}}
                            </div>
                            <div class="text-subtitle2">
                                status: {{ number.isActive ? 'Active':'Inactive' }}
                            </div>
                            <q-card-actions class="float-right">
                                <q-btn
                                    label="edit"
                                    icon="edit"
                                    color="primary"
                                    @click="editPhone(number)"
                                ></q-btn>
                                <q-btn
                                    label="delete"
                                    icon="delete"
                                    color="red-5"
                                    @click="deletePhone(number)"
                                ></q-btn>
                            </q-card-actions>
                        </q-card-section>
                    </q-card>

                    <div v-if="$route.name === 'User Details' && (user.activeUser.cellPhone || user.activeUser.homePhone || user.activeUser.workPhone)">
                        <div class="text-h6">Legacy Phone Numbers</div>
                        Mobile: {{ user.activeUser.cellPhone }}
                        Home: {{ user.activeUser.homePhone }}
                        Work: {{ user.activeUser.workPhone }}
                    </div>
                </div>

                    <q-select
                        label="Notification Preferences"
                        v-model="user.activeUser.notificationPreferences"
                        :options="notificationOptions"
                        outlined stack-label
                        multiple
                        class="q-pa-sm wide-field"
                    >
                        <template v-slot:selected-item="scope">
                            <q-chip
                                @remove="scope.removeAtIndex(scope.index)"
                                :tabindex="scope.tabindex"
                                removable
                                dense
                                color="primary"
                                text-color="white"
                            >
                                <q-avatar
                                    color="primary"
                                    text-color="white"
                                    :icon="scope.opt.icon"
                                />
                                {{ scope.opt.label }}
                            </q-chip>
                        </template>
                </q-select>

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

                        <br><br><br><br>
                        <div v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && user.activeUserAlias" >
                            <q-toggle v-model="user.activeUser.isActive" label="Active"/>
                            <q-toggle v-model="user.activeUser.isAshop" label="Ashop"/>
                            <q-toggle v-model="user.activeUser.isWcgop" label="Wcgop"/>
                        </div>
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

            <div
                class="q-pa-md q-gutter-md fixed-bottom"
                align="right"
                style="background-color: white;"
            >
                <q-btn
                    v-if="this.$route.name === 'User Details'"
                    label="Cancel"
                    color="red"
                    @click="navigateBack"
                ></q-btn>

                <q-btn
                    label="Save"
                    color="primary"
                    @click="saveUser"
                ></q-btn>
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

import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AlertState } from '../_store/types/types';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { AuthState, authService } from '@boatnet/bn-auth';
import { Notify } from 'quasar';

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

    private apexUserOptions: any[] = [];

    private editPhoneNumber: boolean = false;
    private newPhoneNumber: boolean = false;
    private activePhoneNumber: any;
    private phoneNumberTypes: any[] = [];

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

    private selectText(event: any) {
      event.target.select();
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
                    start_key: val.toLowerCase(),
                    inclusive_end: true,
                    descending: false,
                    include_docs: true
                    };

                    const ports = await db.query(
                        'obs_web/all_port_names',
                        queryOptions,
                        pouchService.lookupsDBName
                        );
                    this.ports = ports.rows.map((row: any) => row.doc);
                } catch (err) {
                    console.log(err);
                }
            }
        );
    }

    private apexUsersFilterFn(val: string, update: any, abort: any) {
        update(
            () => {
                try {
                    this.apexUserOptions = this.user.unLinkedApexUsers.filter(
                        (user: any) => {
                            return (
                                user.firstName.toLowerCase().includes(val.toLowerCase()) ||
                                user.lastName.toLowerCase().includes(val.toLowerCase())
                            );
                            });
                } catch (err) {
                    console.log(err);
                }

            });
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
                    'obs_web',
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

                const vesselCaptains = await db.query(
                    'obs_web/vessel_captains',
                    queryOptions,
                    pouchService.lookupsDBName
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
        if (this.user.activeUser!.workEmail !== '') {
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
                            this.notifySuccess('User Config Saved'),
                            this.$router.push({path: '/'});
                        } , 500)
                    );
                } else {
                    couchService.masterDB.post(this.user.activeUser).then(
                        setTimeout( () => {
                            this.notifySuccess('User Config Saved'),
                            this.$router.push({path: '/'});
                        } , 500)
                    );
                }
            } else {
                console.log('existing user');
                this.updateUserRoles();
                this.user.activeUser!.updatedBy = authService.getCurrentUser()!.username;
                this.user.activeUser!.updatedDate = moment().format();

                this.user.activeUserAlias.firstName = this.user.activeUser!.firstName;
                this.user.activeUserAlias.lastName = this.user.activeUser!.lastName;
                this.user.activeUserAlias.roles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
                this.user.activeUserAlias.isActive = this.user.activeUser!.isActive;
                this.user.activeUserAlias.isWcgop = this.user.activeUser!.isWcgop;
                this.user.activeUserAlias.isAshop = this.user.activeUser!.isAshop;

                couchService.masterDB.put(
                    this.user.activeUserAlias._id,
                    this.user.activeUserAlias,
                    this.user.activeUserAlias._rev
                );

                if (this.$route.name === 'User Details') {
                    couchService.masterDB.put(
                        this.user.activeUser!._id,
                        this.user.activeUser!,
                        this.user.activeUser!._rev
                    ).then(
                    this.notifySuccess('User Config Saved'),
                    this.navigateBack()
                    );
                } else {

                    couchService.masterDB.put(
                        this.user.activeUser!._id,
                        this.user.activeUser!,
                        this.user.activeUser!._rev
                    )
                    // pouchService.db.put(this.user.activeUser)
                    .then( () => {
                        this.notifySuccess('User Config Saved'),
                        this.$router.push({path: '/'});
                    }
                    );
                }
            }
        } else {
            this.errorAlert('Work Email is a required field.');
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
                isActive: true,
                isWcgop: true,
                isAshop: true,
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format()
            };

            Vue.set(this.user, 'activeUser', newUser);
            this.user.newUser = true;
            this.$router.push({path: '/users/' + 'new'});
    }

    private async getUsStates() {
        const db = pouchService.db;
        try {
        const queryOptions = {
            key: 'us-state',
            reduce: false,
            inclusive_end: true,
            descending: false,
            include_docs: true
        };

        const usstates = await db.query(
            'obs_web/all_doc_types',
            queryOptions,
            pouchService.lookupsDBName
            );

        for (const row of usstates.rows) {
            const state = row.doc;
            this.usStates.push(state);
        }

        } catch (err) {
            console.log(err);
        }
    }

    private async getPhoneTypes() {
        try {
            const db = pouchService.db;
            const queryOptions = {
                key: 'phone-number-type',
                reduce: false,
                inclusive_end: true,
                descending: false,
                include_docs: true
            };

            const phoneTypes = await db.query(
                'obs_web/all_doc_types',
            queryOptions,
            pouchService.lookupsDBName
            );

            this.phoneNumberTypes = phoneTypes.rows.map((type: any) => type.doc);
        } catch (err) {
            console.log(err);
        }
    }

    private async getRoles() {
        const config = {
            headers: {
                authorization: 'Bearer ' + authService.getCurrentUser()!.jwtToken
                },
            params: {
                applicationName: 'BOATNET_OBSERVER',
                }
            };

        axios.get(this.url + '/api/v1/roles', config)
        .then((response) => {
            console.log(response);
            this.roles = response.data.roles.map( (role: any) => role );
        });
    }

    private async getUserRoles() {
        const config = {
            headers: {
                authorization: 'Bearer ' + authService.getCurrentUser()!.jwtToken
                },
            params: {
                username: this.user.activeUser!.apexUserAdminUserName,
                applicationName: 'BOATNET_OBSERVER',
                }
            };

        axios.get(this.url + '/api/v1/user-role', config)
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

                const config = {
                    headers: {
                        authorization: 'Bearer ' + authService.getCurrentUser()!.jwtToken,
                        }
                    };

                const bodyParameters = {
                        username: this.user.activeUser!.apexUserAdminUserName,
                        applicationName: 'BOATNET_OBSERVER',
                        role
                        };

                axios.post(this.url + '/api/v1/user-role', bodyParameters, config)
                .then((response) => {
                    console.log(response);
                });
            }
        }

        for (const role of this.storedRoles) {
            if (this.applicationRoles.indexOf(role) === -1) {

                    const config = {
                        headers: {
                            'authorization': 'Bearer ' + authService.getCurrentUser()!.jwtToken,
                            'Content-Type': 'application/json',
                            'accept': 'application/json'
                            },
                        params: {
                            username: this.user.activeUser!.apexUserAdminUserName,
                            applicationName: 'BOATNET_OBSERVER',
                            role
                            }
                        };

                    axios.delete(this.url + '/api/v1/user-role', config)
                    .then((response) => {
                    console.log(response);
                    });
            }
        }
    }

    private notifySuccess(message: string) {
        Notify.create({
            message: 'Success: ' + message,
            position: 'top-right',
            color: 'green',
            timeout: 2000,
            icon: 'check',
            multiLine: true
        });
    }

    private addPhone() {
        if (!this.user.activeUser!.phoneNumbers) {
            Vue.set(this.user.activeUser!, 'phoneNumbers', []);
        }
        this.user.activeUser!.phoneNumbers!.unshift(
            {
                number: '',
                phoneNumberType: {description: ''},
                isActive: true,
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format()
            }
        );
        this.editPhoneNumber = true;
        this.newPhoneNumber = true;
        this.activePhoneNumber = this.user.activeUser!.phoneNumbers![0];
    }

    private editPhone(phoneNumber: any) {
        this.editPhoneNumber = true;
        this.newPhoneNumber = false;
        this.activePhoneNumber = JSON.parse(JSON.stringify(phoneNumber));
        this.activePhoneNumber.updatedBy = authService.getCurrentUser()!.username;
        this.activePhoneNumber.updatedDate = moment().format();
        this.activePhoneNumber.isActive = true;
        this.user.activeUser!.phoneNumbers!.unshift(this.activePhoneNumber);
        phoneNumber.isActive = false;
    }

    private cancelEditPhone() {
        this.editPhoneNumber = false;
        if (this.newPhoneNumber) {
            this.user.activeUser!.phoneNumbers!.shift();
        }
    }

    private deletePhone(phoneNumber: any) {
        phoneNumber.isActive = false;
        phoneNumber.updatedBy = authService.getCurrentUser()!.username;
        phoneNumber.updatedDate = moment().format();
    }

    private get userPhoneNumbers() {
        if (this.$route.name === 'User Config') {
            if (!this.user.activeUser!.phoneNumbers) {
                Vue.set(this.user.activeUser!, 'phoneNumbers', []);
            }
            return this.user.activeUser!.phoneNumbers!.filter( (phoneNumber: any) => phoneNumber.isActive );
        } else if (this.user.activeUser!.phoneNumbers) {
            return this.user.activeUser!.phoneNumbers;
        } else {
            return [];
        }
    }

    private getDate(date: string) {
        return moment(date).format('LL');
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
        this.getPhoneTypes();
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
