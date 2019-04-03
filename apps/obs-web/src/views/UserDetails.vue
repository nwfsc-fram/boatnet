<template>
    <div class="q-pa-md  q-gutter-md">
            <div class="centered-page-item">User Details</div>
        <q-card>
            <q-card-section>
            <q-input dense v-model="user.activeUser.name" label="Name"></q-input>
            <q-select dense v-model="user.activeUser.roles" label="Roles" bg-color="white" color="primary" multiple use-chips :options="roles"></q-select>
            <q-input dense v-model="user.activeUser.email" label="Email Address" type="email"></q-input>
            <q-input dense v-model="user.activeUser.mobile" label="Mobile Number" type="tel"></q-input>
            <q-input dense v-model="user.activeUser.home" label="Home Number" type="tel"></q-input>
            <q-input dense v-model="user.activeUser.address" label="Address" type="street-address"></q-input>  
            <div style="display: flex;">
                <q-input dense v-model="user.activeUser.city" label="City" type="address-level2"></q-input>
                <q-select style="width: 100px" dense v-model="user.activeUser.state" label="State" type="address-level1" @filter="filterStates" use-input stack-label :options="usStateOptions"></q-select>
            </div>

            <q-input dense v-model="user.activeUser.zipcode" label="Zip Code" type="postal-code"></q-input>
            <q-select dense v-model="user.activeUser.homeport" label="Home Port" @filter="filterPorts" use-input stack-label :options="portOptions"></q-select>
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
import { State, Action, Getter } from 'vuex-class';
import { GeneralState, UserState, VesselState } from '../_store/types/types';

@Component
export default class UserDetails extends Vue {
    @State('general') private general!: GeneralState;
    @State('user') private user!: UserState;

    private get ports() {
        return this.general.ports.sort();
    }

    private get portOptions() {
        return this.general.ports;
    }

    private get usStateOptions() {
        return this.general.usStates;
    }

    private get usStates() {
        return this.general.usStates;
    }

    private get roles() {
        return this.general.roles.sort();
    }

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
