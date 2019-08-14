<template>
    <div>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>

        <div class="q-pa-md  q-gutter-md centered-page-item">

            <q-btn color="primary" @click="newUser">New User</q-btn>

        <q-input v-model="filterText" label="Search" style="width: 95%" autofocus>
            <template v-if="filterText">
                <q-avatar dense icon="clear" @click="filterText = ''"></q-avatar>
            </template>
        </q-input>

        <div style="text-align: center; background-color: white" class="q-pa-md q-gutter-sm">
        </div>
        </div>
        <q-list bordered separator>
            <q-item v-for="(user, i) of filteredUsers" :key="i">
                <q-item-section @click="userDetails(user)">
                    <q-item-label>
                        <strong>{{ user.firstName }} {{ user.lastName }} {{ user.apexUserAdminUserName }}
                        <div v-if="user._id" class="bg-primary text-white" style="border-radius: 5px; display: inline; padding: 2px 4px;">BOATNET</div>

                        <div v-if="user.apexUserAdminUserName && user._id" style="border-radius: 5px; background-color: blue; color: white; display: inline; margin: 4px ;padding: 2px 4px;">LINKED</div>

                        <div v-if="user.type === 'apexUser'" style="border-radius: 5px; background-color: red; color: white; display: inline; margin: 4px; padding: 2px 4px;">APEX</div>
                        </strong>
                    </q-item-label>
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
import { TripState, PermitState, UserState, GeneralState, AlertState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { PersonTypeName } from '@boatnet/bn-models';
import moment from 'moment';
import axios from 'axios';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

@Component
export default class ManageUsers extends Vue {
    @State('user') private user!: UserState;

    @State('alert') private alert!: AlertState;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;

    private filterText: string = '';
    private users: any[] = [];
    private userNames: any[] = [];

    private get userOptions() {
        return this.user.users;
    }

    constructor() {
        super();
        }

    private userDetails(user: any) {
            this.user.activeUser = user;
            this.user.newUser = false;

            // move legacy phone numbers?
            // if (!this.user.activeUser!.phoneNumbers) {
            //     Vue.set(this.user.activeUser!, 'phoneNumbers', []);
            // }
            // if (this.user.activeUser!.workPhone) {
            //     const workPhone = {
            //         number: this.user.activeUser!.workPhone,
            //         phoneNumberType: {description: 'work'},
            //         isActive: true,
            //         createdBy: 'legacy',
            //         createdDate: moment().format()
            //     }
            //     this.user.activeUser!.phoneNumbers!.push(workPhone);
            // }

            const index = this.user.users.indexOf(user);
            this.$router.push({path: '/users/' + index});
        }

    private newUser() {
            const newUser = {
                type: PersonTypeName,
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format(),
                apexUserAdminUserName: ''
            };
            this.user.activeUser = newUser;
            this.user.newUser = true;
            this.$router.push({path: '/users/' + 'new'});
        }

    private get filteredUsers() {
        if (this.filterText.length > 0) {
            return this.user.users.filter( (user: any) => {
                return user.firstName ? user.firstName.toLowerCase().includes( this.filterText.toLowerCase()) : false ||
                user.lastName ? user.lastName.toLowerCase().includes( this.filterText.toLowerCase()) : false ||
                user.apexUserAdminUserName ? user.apexUserAdminUserName.includes(this.filterText.toLowerCase()) : false;
                }
            );
        } else {
            return this.user.users;
            }
    }

//   private async filterUsers(val: string, update: any, abort: any) {

//       update(async () => {
//         try {
//           const masterDB: Client<any> = couchService.masterDB;
//           const queryOptions = {
//             limit: 20,
//             start_key: val.toLowerCase(),
//             inclusive_end: true,
//             descending: false,
//             include_docs: true
//           };
//           const users = await masterDB.view<any>(
//             'obs-web',
//             'all_persons',
//             queryOptions
//           );

//           this.user.users = users.rows.map((row) => row.doc);
//         } catch (err) {
//           this.errorAlert(err);
//         }
//       });
//   }

    private async getUsers() {
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions: ListOptions = {
          start_key: '',
          inclusive_end: true,
          descending: false
        };

        try {
            const users = await masterDB.viewWithDocs<any>(
                'obs-web',
                'all_active_persons',
                queryOptions
                );

            this.user.users = users.rows.map( (user) => user.doc );
            this.userNames = users.rows.map( (user) => user.doc.apexUserAdminUserName );

        } catch (err) {
            this.errorAlert(err);
        }
    }

    private async getApexUsers() {
        this.user.unLinkedApexUsers = [];
        let url = '';

        if (authService.apiUrl) {
            url = authService.apiUrl;
        } else {
            url = '';
        }

        const config = {
            headers: {
                authorization: 'Bearer ' + authService.getCurrentUser()!.jwtToken
                },
            params: {
                applicationName: 'IFQ',
                role: 'VA'
                    }
            };

        // axios.get(url + '/api/v1/users-details', {
        // params: {token: authService.getCurrentUser()!.jwtToken, applicationName: 'IFQ'}
        // })

        axios.get(url + '/api/v1/users-details', config)

        .then((response) => {
            for (const user of response.data.users) {
                if (this.userNames.indexOf(user.user_id) === -1) {
                    user.apexUserAdminUserName = user.user_id;
                    delete user.user_id;
                    user.firstName = user.first_name;
                    delete user.first_name;
                    user.lastName = user.last_name;
                    delete user.last_name;
                    user.workEmail = user.email_address;
                    delete user.email_address;
                    Vue.set(user, 'phoneNumbers', []);
                    user.phoneNumbers.push({
                        number: user.phone,
                        phoneNumberType: {description: 'work'},
                        isActive: true,
                        createdBy: 'apex',
                        createdDate: moment().format()
                    });
                    delete user.phone;
                    user.type = 'apexUser';
                    console.log(user);
                    this.user.users.push(user);
                    this.user.unLinkedApexUsers.push(user);
                }
            }
            console.log(this.user.unLinkedApexUsers);
        });
        }

    private created() {
        this.user.users = [];
        this.getUsers().then(() => {
            this.getApexUsers();
            });
    }

}
</script>

<!--
<script>
export default {
    data() {
        return {
            users: this.$store.getters.users
        }
    },
    methods: {
        userDetails(user) {
            this.$store.state.activeUser = user
            const index = this.$store.state.users.indexOf(user)
            this.$router.push({path: '/users/' + index})
        },
        newUser() {
            this.$store.state.users.push({name: '', role: null, email: null, mobile: null, home: null})
            this.$store.state.activeUser = this.$store.state.users[this.$store.state.users.length -1]
            const index = this.$store.state.users.indexOf(this.$store.state.activeUser)
            this.$router.push({path: '/users/' + index})
        }
    }

}
</script>
-->