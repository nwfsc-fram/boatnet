<template>
    <div class="q-pa-md  q-gutter-md">
        <q-btn color="primary" @click="newUser">New User</q-btn>
        <q-list bordered separator>
            <q-item v-for="(user, i) of users" :key="i" @click="userDetails(user)">
                <q-item-section>
                    <q-item-label>{{ user.name }} ({{ user.role }})</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>    
</template>


<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ManageUsers extends Vue {

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