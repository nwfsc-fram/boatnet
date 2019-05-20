<template>
    <div class="">
        <div class="q-pa-md  q-gutter-md centered-page-item">
            <q-btn color="primary" @click="newUser">New User</q-btn>
        </div>
        <q-list bordered separator>
            <q-item v-for="(user, i) of filteredUsers" :key="i">
                <q-item-section @click="userDetails(user)">
                    <q-item-label><strong>{{ user.name }}</strong> (
                        <span v-for="(role, i) in user.roles" :key="role">
                            {{ role }}
                            <span v-if="user.roles.length > 1 && i < user.roles.length - 1">,&nbsp;</span>
                        </span>
                        )
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
        <div style="text-align: center; background-color: white" class="fixed-bottom q-pa-md q-gutter-sm">
            <q-input v-model="filterText" label="Search"></q-input>
        </div>
    </div>
</template>


<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TripState, PermitState, UserState, GeneralState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import moment from 'moment';

@Component
export default class ManageUsers extends Vue {
    @State('user') private user!: UserState;

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
                user.name.toLowerCase().includes( this.filterText.toLowerCase() )
                // || user.roles.toLowerCase().includes( this.filterText.toLowerCase() )
                );
        } else {
            return this.user.users;
            }
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