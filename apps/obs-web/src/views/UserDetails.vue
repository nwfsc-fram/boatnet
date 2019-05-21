<template>
    <div>
        <q-card>

            <q-card-section>
                <div class="row">
                    <q-input class="col-md q-pa-sm" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.firstName" label="First Name"></q-input>
                    <q-input class="col-md q-pa-sm" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.lastName" label="Last Name"></q-input>
                    <q-input class="col-md q-pa-sm" :rules="[val => !!val || 'Field is required']" outlined dense v-model="user.activeUser.userName" label="User Name"></q-input>
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
                    <q-select class="col-md q-pa-sm" outlined dense v-model="user.activeUser.port" label="Home Port" @filter="filterPorts" use-input l :options="portOptions"></q-select>

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
            <q-card-section align="right" v-if="this.$route.name === 'User Details'">
                <q-btn color="primary" @click="navigateBack" label="Done"/>
                <q-btn color="red" label="Cancel"></q-btn>
                <q-btn color="primary" label="Save" @click="saveUser"></q-btn>
            </q-card-section>
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

    private portOptions: any = [];
    private usStateOptions: any = [];

    private get ports() {
        return this.general.ports.sort();
    }

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

    private filterPorts(val: string , update: any) {
        if (val === '') {
            update(() => {
                this.portOptions = this.general.ports.sort();
                });
            return;
        }
        update(() => {
            const searchString = val.toLowerCase();
            this.portOptions = this.general.ports.filter(
                (v: any) => v.toLowerCase().indexOf(searchString) > - 1 ).sort();
            });
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
            pouchService.db.post(pouchService.userDBName, this.user.activeUser);
            this.$router.push({path: '/manage-users/'});
        } else {
            this.user.activeUser!.updatedBy = authService.getCurrentUser()!.username;
            this.user.activeUser!.updatedDate = moment().format();
            pouchService.db.put(pouchService.userDBName, this.user.activeUser).then(
                this.$router.push({path: '/manage-users/'})
            );
        }
    }

    private created() {
        this.getVessels();
    }
    // private filterStates(val: string , update: any) {
    //     if (val === '') {
    //         return this.general.usStates;
    //     } else {
    //         return this.general.usStates.filter(
    //             (v: any) => v.toLowerCase().indexOf( val.toLowerCase() )
    //         );
    //     }
    // }

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
