<template>
    <div class="q-pa-md  q-gutter-md">
        <q-btn color="primary" @click="newUser">New User</q-btn>
        <q-list bordered separator>
            <q-item v-for="(user, i) of filteredUsers" :key="i" @click="userDetails(user)">
                <q-item-section>
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
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ManageUsers extends Vue {

    private filterText: string = '';
    private userOptions = this.users;

    private get users() {
        return this.$store.getters.users;
    }

    constructor() {
        super();
        }

    private userDetails(user: any) {
            this.$store.state.activeUser = user;
            const index = this.$store.state.users.indexOf(user);
            this.$router.push({path: '/users/' + index});
        }

    private newUser() {
            this.$store.state.users.push({name: '', role: null, email: null, mobile: null, home: null});
            this.$store.state.activeUser = this.$store.state.users[this.$store.state.users.length - 1];
            const index = this.$store.state.users.indexOf(this.$store.state.activeUser);
            this.$router.push({path: '/users/' + index});
        }

    private get filteredUsers() {
        if (this.filterText.length > 0) {
            return this.userOptions.filter( (user: any) =>
                user.name.toLowerCase().includes( this.filterText.toLowerCase() )
                // || user.roles.toLowerCase().includes( this.filterText.toLowerCase() )
                );
        } else {
            return this.$store.state.users;
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