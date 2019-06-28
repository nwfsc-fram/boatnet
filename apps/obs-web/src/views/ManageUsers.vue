<template>
    <div class="">
        <div class="q-pa-md  q-gutter-md centered-page-item">

            <q-btn color="primary" @click="newUser">New User</q-btn>

        <q-input v-model="filterText" label="Search" style="width: 100%" autofocus>
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
                    <q-item-label><strong>{{ user.firstName }} {{ user.lastName }}</strong>
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
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

@Component
export default class ManageUsers extends Vue {
    @State('user') private user!: UserState;

    @State('alert') private alert!: AlertState;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;

    private filterText: string = '';

    private get userOptions() {
        return this.user.users;
    }

    constructor() {
        super();
        }

    private userDetails(user: any) {
            this.user.activeUser = user;
            this.user.newUser = false;
            const index = this.user.users.indexOf(user);
            this.$router.push({path: '/users/' + index});
        }

    private newUser() {
            const newUser = {
                type: PersonTypeName,
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format()
            };
            this.user.activeUser = newUser;
            this.user.newUser = true;
            this.$router.push({path: '/users/' + 'new'});
        }

    private get filteredUsers() {
        if (this.filterText.length > 0) {
            return this.user.users.filter( (user: any) =>
                user.firstName.toLowerCase().includes( this.filterText.toLowerCase()) || user.lastName.toLowerCase().includes( this.filterText.toLowerCase() )
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
                'all_persons',
                queryOptions
                );

            this.user.users = users.rows.map( (user) => user.doc );


        } catch (err) {
            this.errorAlert(err);
        }
    }

    private created() {
        this.getUsers();
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