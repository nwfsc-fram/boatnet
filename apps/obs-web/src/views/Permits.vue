<template>
    <div>
        <div class="centered-page-item" style="margin: 10px"><strong>Active Permits</strong></div>
        <q-list bordered separator>
            <q-item v-for="(permit, i) of filteredPermits" :key="i">
                <!-- <router-link :to="{ path: '/permits/' + i }" style="text-decoration: none; color: black"> -->
                <q-item-section  @click="permitDetails(permit, i)">
                    <q-item-label ><strong>{{ permit.permit_number }}</strong> <span class="text-primary" style="position: relative; left: 20px">{{ permit.vessel_name }}</span></q-item-label>
                    <!-- <q-item-label caption>{{ permit.vessel_name }}</q-item-label> -->
                </q-item-section>
                <!-- </router-link> -->
            </q-item>
            <div style="background-color: white" class="fixed-bottom q-pa-md q-gutter-sm centered-page-item">
                <q-input v-model="permit.filterText" label="Search" autofocus >
                    <template v-if="permit.filterText">
                        <q-avatar dense icon="clear" @click="permit.filterText = ''"></q-avatar>
                    </template>
                </q-input>
            </div>
        </q-list>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from 'axios';
import { PermitState } from '../_store/types/types';

@Component
export default class Permits extends Vue {

    @State('permit') private permit!: PermitState;
    @Action('updatePermits', { namespace: 'permit' }) private updatePermits: any;

    // private filterText: string = '';
    private keys = ['permit_number', 'vessel_name', 'vessel_registration_number', 'vessel_owner'];
    // private permits = this.$store.state.permits;
    // private permitOptions = this.permit

    constructor() {
        super();
    }

    private getPermits() {
        axios.get('https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500')
            .then( (response) => {
                // this.$store.dispatch('updatePermits', response.data.items);
                this.permit.permits = response.data.items;
                console.log(this.permit.permits);
            });
    }

    private permitDetails(permit: any, i: number) {
        this.permit.activePermit = permit;
        this.$router.push({path: '/permits/' + i});
    }


    private get filteredPermits() {
        if (this.permit.filterText.length > 0) {
            return this.permit.permits.filter( (permit: any) =>
                permit.vessel_name.toLowerCase().includes( this.permit.filterText.toLowerCase() ) ||
                permit.permit_number.toLowerCase().includes( this.permit.filterText.toLowerCase() ) );
        } else {
            return this.permit.permits;
            }
    }

    private created() {
        this.getPermits();
    }

}
</script>

<!--
<script>
import axios from 'axios';
export default {
    data() {
        return {
            filterText: '',
            keys: ['permit_number', 'vessel_name', 'vessel_registration_number', 'vessel_owner']
        }
    },
    methods: {
    // getPermits() {
    //     this.$http.get("https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500")
    //     .then(response => {
    //         return response.json()
    //     })
    //     .then(data => {
    //         const permitArray = []
    //         for (var permit of data.items)
    //             { permitArray.push(permit)}
    //         console.log(permitArray)
    //         this.$store.dispatch('updatePermits', permitArray) 
    //         console.log(this.$store.state.permits)
    //         })
    //     },
    getPermits() {
        axios.get("https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500")
            .then(response => {
                console.log(response.data.items)
                this.$store.dispatch('updatePermits', response.data.items)
            })
    },
    permitDetails(i) {
        this.$router.push({path: '/permits/'+ i})
    }
    },
    computed: {
        permits: {
            get() {
                return this.$store.getters.permits
            },
            set(value) {
                this.$store.dispatch('updatePermits', value)
            }
        },
        filteredPermits() {
            if (this.filterText.length > 0) {
                // implement search - as a mixin? 
                return this.permits;

            } else {
                return this.permits;
            }
        },
    },
}
</script>
-->
