<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card>
            <q-card-section>
            <q-card-title class="text-h6">User Details</q-card-title>
            <q-input dense v-model="user.name" label="Name"></q-input>
            <q-select dense v-model="user.roles" label="Roles" multiple use-chips :options="roles"></q-select>
            <q-input dense v-model="user.email" label="Email Address" type="email"></q-input>
            <q-input dense v-model="user.mobile" label="Mobile Number" type="tel"></q-input>
            <q-input dense v-model="user.home" label="Home Number" type="tel"></q-input>
            <q-input dense v-model="user.address" label="Address" type="street-address"></q-input>  
            <div style="display: flex;">
                <q-input dense v-model="user.city" label="City" type="address-level2"></q-input>
                <q-select style="width: 100px" dense v-model="user.state" label="State" type="address-level1" @filter="filterStates" use-input stack-label :options="usStateOptions"></q-select>
            </div>

            <q-input dense v-model="user.zipcode" label="Zip Code" type="postal-code"></q-input>
            <q-select dense v-model="user.homeport" label="Home Port" @filter="filterPorts" use-input stack-label :options="portOptions"></q-select>
            </q-card-section>
            <q-card-section align="right" v-if="this.$route.name === 'User Details'">
                <q-btn color="primary" @click="navigateBack" label="Done"/>
            </q-card-section>
        </q-card>
    </div>
</template>


<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class UserDetails extends Vue {

    private ports = this.$store.state.ports.sort();
    private portOptions = this.ports;
    private usStates = this.$store.state.usStates.sort();
    private usStateOptions = this.usStates;
    private user = this.$store.state.activeUser;
    private roles = this.$store.state.roles.sort();

    constructor() {
        super();
    }

    private filterPorts(val: string, update: any) {
        if (val === '') {
            update(() => {
                this.portOptions = this.ports;
                });
            return;
        }
        update(() => {
            const searchString = val.toLowerCase();
            this.portOptions = this.portOptions.filter( (v: any) => v.toLowerCase().indexOf(searchString) > - 1 );
            });
    }

    private filterStates(val: string , update: any) {
        if (val === '') {
            update(() => {
                this.usStateOptions = this.usStates;
                });
            return;
        }
        update(() => {
            const searchString = val.toLowerCase();
            this.usStateOptions = this.usStateOptions.filter( (v: any) => v.toLowerCase().indexOf(searchString) > - 1 );
            });
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
