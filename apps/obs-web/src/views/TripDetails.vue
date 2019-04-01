<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card class="my-card">
            <q-card-section>
                <!-- {{ this.$store.state.currentTrip.trip_num }} -->
                <p><strong>Trip # {{ trip.trip_num }} - <span v-if="trip.permits.length > 0">{{ trip.permits[0].fishery }}</span></strong></p>

                <q-input v-model="trip.start_date" mask="date" :rules="['date']" :dense="true" label="Start Date">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="trip.start_date" />
                    </q-popup-proxy>
                    </q-icon>
                    <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-time v-model="trip.start_time" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-input v-model="trip.end_date" mask="date" :rules="['date']" :dense="true" label="End Date">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="trip.end_date" />
                    </q-popup-proxy>
                    </q-icon>
                    <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-time v-model="trip.end_time" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-select v-model="trip.start_port" :dense="true" label="Start Port" @filter="filterFn" use-input stack-label :options="portOptions"></q-select>
                <q-select v-model="trip.end_port" :dense="true" label="End Port" @filter="filterFn" use-input stack-label :options="portOptions"></q-select>
 
                <p><strong>Permits</strong></p>

                <q-select
                v-model="trip.permits"
                bg-color="white"
                color="primary"
                multiple
                use-chips
                use-input
                stack-label
                :options="permits"
                style="width: 100%"
                >
                </q-select>

                <q-btn round color="primary" icon="message" size="sm" @click="prompt=true" style="float:right"/>

                <p><strong>Messages</strong></p>
                <div v-if="tripMessages.length > 0">
                    <br>
                    <q-list bordered separator class="rounded-borders">
                        <q-item clickable :dense="true" v-for="message in tripMessages" :key="message.datetime">
                            <q-item-section>
                                <q-item-label class="text-primary">{{ message.author }} <span style="float:right"> 5 minutes ago </span></q-item-label>
                                <q-item-label><strong>{{ message.text }}</strong></q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                    <q-dialog v-model="prompt" persistent>
                    <q-card style="min-width: 300px">
                        <q-card-section>
                        <div class="text-h6">New Message</div>
                        </q-card-section>

                        <q-card-section>
                        <q-input dense v-model="newMessage" autofocus @keyup.enter="addMessage" />
                        </q-card-section>

                        <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Cancel" @click="prompt = false" />
                        <q-btn flat label="Add" @click="addMessage" />
                        </q-card-actions>
                    </q-card>
                    </q-dialog>

            </q-card-section>

            <q-card-actions v-if="newTrip" align="right" class="text-primary">
                <q-btn label="Cancel" @click="deleteTrip"/>
                <q-btn label="Create Trip" color="primary" @click="createTrip"/>
            </q-card-actions>
            <q-card-actions v-else align="right" class="text-primary">
                <q-btn label="Done" color="primary" @click="goToTrips"></q-btn>
            </q-card-actions>
        </q-card>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { date } from 'quasar';

@Component
export default class TripDetails extends Vue {

    private trip =  this.$store.state.activeTrip;
    // private permits = [
    //     {label: 'permit one', value: 42},
    //     {label: 'permit two', value: 17},
    //     {label: 'permit three', value: 7},
    //     ];
    private permits = this.$store.state.permits.map( (permit: any) =>
        ({label: permit.permit_number, value: permit.vessel_name}) );
    private prompt = false;
    private newMessage: string = '';
    private ports = this.$store.state.ports.sort();
    private portOptions = this.ports;
    private newTrip = this.$store.state.newTrip;

    constructor() {
        super();
    }

    private addMessage() {
            this.trip.messages.push({
                                    author: this.$store.state.activeUser.name ,
                                    datetime: Date.now() ,
                                    text: this.newMessage
                                    });
            this.newMessage = '';
            this.prompt = false;
        }

    private get tripMessages() {
        return this.trip.messages.reverse();
        }

    private filterFn(val: string, update: any) {
        if (val === '') {
            update( () => {
                this.portOptions = this.ports;
                });
            return;
        }
        update( () => {
            const searchString = val.toLowerCase();
            this.portOptions = this.portOptions.filter( (v: any) => v.toLowerCase().indexOf(searchString) > -1);
            });
        }

    private deleteTrip() {
        this.$store.state.trips.pop();
        this.$store.state.activeTrip = null;
        this.$router.push({path: '/trips/'});
    }

    private createTrip() {
        this.$router.push({path: '/trips/'});
    }

    private goToTrips() {
        this.$router.push({path: '/trips/'});
    }

}

</script>

<style lang="stylus" scoped>
.my-card
    width 95%

</style>

<!--
<script>
import Vue from 'vue';
export default {
    data() {
        return {
            trip: this.$store.state.activeTrip,
            permits: ['one', 'two', 'three','four', 'five', 'six','seven'],
            prompt: false,
            newMessage: ''
        }
    },
    methods: {
        addMessage() {
            this.trip.messages.push({author: this.$store.state.activeUser.name ,datetime: Date.now() ,text: this.newMessage});
            this.newMessage = '';
            this.prompt = false;
        }
    },
    computed: {
        tripMessages() {
                return this.trip.messages.reverse()
        }
    }
}
</script>
-->

<style scoped>
    p { margin-bottom: 5px; }
    .q-field { padding-bottom: 5px; }
</style>


