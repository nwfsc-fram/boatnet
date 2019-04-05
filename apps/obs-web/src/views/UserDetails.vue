<template>
    <div class="q-pa-md  q-gutter-md">
            <div class="centered-page-item">User Details</div>
        <q-card>
            <q-card-section>
            <q-input dense v-model="user.activeUser.name" label="Name"></q-input>
            <q-select dense v-model="user.activeUser.roles" label="Roles" multiple :options="roles">
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
