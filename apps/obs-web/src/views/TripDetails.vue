<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card class="my-card">
            <q-card-section>
                <!-- {{ this.$store.state.currentTrip.trip_num }} -->
                <p><strong>Trip # {{ trip.activeTrip.tripNum }} - <span v-if="trip.activeTrip.fishery">{{ trip.activeTrip.fishery.name }}</span></strong></p>

                <q-input v-model="trip.activeTrip.departureDate" mask="date" :rules="['date']" :dense="true" label="Start Date">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="trip.activeTrip.departureDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-input v-model="trip.activeTrip.returnDate" mask="date" :rules="['date']" :dense="true" label="End Date">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="trip.activeTrip.returnDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-select v-model="trip.activeTrip.departurePort.name" :dense="true" label="Start Port" @filter="filterFn" use-input stack-label :options="portOptions"></q-select>
                <q-select v-model="trip.activeTrip.returnPort.name" :dense="true" label="End Port" @filter="filterFn" use-input stack-label :options="portOptions"></q-select>

                <q-select v-model="trip.activeTrip.fishery.name" :dense="true" label="Fishery" stack-label :options="fisheryOptions"></q-select>
 
                <p><strong>Permits</strong></p>

                <q-select
                v-model="trip.activeTrip.permits"
                bg-color="white"
                color="primary"
                multiple
                use-chips
                use-input
                stack-label
                :options="permits"
                style="width: 100%"
                >
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
                            <q-avatar color="primary" text-color="white" icon="local_offer" />
                            {{ scope.opt.label }}
                        </q-chip>
                    </template>
                </q-select>

                <q-btn round color="primary" icon="add" size="sm" @click="prompt=true" style="float:right"/>

                <p><strong>Messages</strong></p>
                <div v-if="tripMessages.length > 0">
                    <br>
                    <q-list bordered separator class="rounded-borders">
                        <q-item clickable :dense="true" v-for="(message, i) in tripMessages" :key="message.datetime">
                            <q-item-section>
                                <q-item-label class="text-primary">{{ message.author.name }} 
                                    <span style="float:right">
                                    {{ getTimeText(message.datetime) }}
                                    </span>
                                </q-item-label>
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

            <q-card-actions v-if="trip.activeTrip.newTrip" align="right" class="text-primary">
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
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { date } from 'quasar';
import { TripState, PermitState, UserState, GeneralState } from '../_store/types/types';

import moment from 'moment';
import { Port } from '../../../../libs/bn-models';

@Component
export default class TripDetails extends Vue {

    @State('trip') private trip!: TripState;
    @State('permit') private permit!: PermitState;
    @State('user') private user!: UserState;
    @State('general') private general!: GeneralState;

    // private trip = this.$store.state.activeTrip;
    private get permits() {
        return this.permit.permits.map( (permit: any) => ({label: permit.permit_number, value: permit.permit_number})
        );
    }

    private prompt = false;
    private newMessage: string = '';

    private get ports() {
        return this.general.ports.sort();
    }

    private portOptions: string[] = [];

    private get fisheryOptions() {
        return this.general.fisheries;
    }

    constructor() {
        super();

    }

    private addMessage() {
        if (this.trip.activeTrip) {
            this.trip.activeTrip.messages.push({
                                author: this.user.activeUser ,
                                datetime: moment().format() ,
                                text: this.newMessage
                                });
            this.newMessage = '';
            this.prompt = false;
        }
        }

    private get tripMessages() {
        if (this.trip.activeTrip) {
            if (this.trip.activeTrip.messages) {
                return this.trip.activeTrip.messages.reverse();
            } else {
                return [];
                }
            } else {
                return [];
            }
        }

    private filterFn(val: string, update: any) {
        if (val === '') {
            update( () => {
                this.portOptions = this.general.ports;
                });
            return;
        }
        update( () => {
            const searchString = val.toLowerCase();
            this.portOptions = this.portOptions.filter( (v: any) => v.toLowerCase().indexOf(searchString) > -1);
            });
        }

    private deleteTrip() {
        this.trip.trips.pop();
        this.trip.activeTrip = null;
        this.$router.push({path: '/trips/'});
    }

    private createTrip() {
        this.$router.push({path: '/trips/'});
    }

    private goToTrips() {
        this.$router.push({path: '/trips/'});
    }

    private getTimeText(time: any) {
        const difference = moment.duration(moment().diff(moment(time))).asSeconds();
        if (difference < 15) {
            return 'just now';
        } else if (difference >= 15 && difference < 60 ) {
            return Math.floor(difference) + ' seconds ago';
        } else {
            return Math.floor(difference / 60) + ' minutes ago';
        }
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


