<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card class="my-card">
            <q-card-section>
                <!-- {{ this.$store.state.currentTrip.trip_num }} -->
                <div class="text-h6" style="margin-bottom: 10px;">{{ vessel.activeVessel.vesselName }} Trip # {{ trip.activeTrip.tripNum }} <br><span v-if="trip.activeTrip.fishery">{{ trip.activeTrip.fishery.name }}</span></div>

                <div class="row items-start">

                    <div>
                        <div class="text-subtitle2">Departure Date</div>
                        <q-date
                            v-model="departureDate"
                            color="green"
                            >
                        </q-date>
                    </div>
                    <div>
                        <div class="text-subtitle2">Return Date</div>
                        <q-date
                            v-model="returnDate"
                            color="red"
                            >
                        </q-date>
                    </div>
                </div>

                <q-select v-model="trip.activeTrip.departurePort.name" :dense="true" label="Start Port" @filter="filterFn" use-input stack-label :options="portOptions"></q-select>
                <q-select v-model="trip.activeTrip.returnPort.name" :dense="true" label="End Port" @filter="filterFn" use-input stack-label :options="portOptions"></q-select>

                <q-select v-model="trip.activeTrip.fishery.name" :dense="true" label="Fishery" stack-label :rules="[val => !!val || 'Field is required']" :options="fisheryOptions"></q-select>

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

                <!-- <q-btn round color="primary" icon="add" size="sm" @click="prompt=true" style="float:right"/> -->

                <!-- <p><strong>Messages</strong></p>
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
                </div> -->

                    <!-- <q-dialog v-model="prompt" persistent>
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
                    </q-dialog> -->

            </q-card-section>

            <q-card-actions v-if="trip.newTrip" align="right" class="text-primary">
                <q-btn label="Cancel" @click="goToTrips"/>
                <q-btn label="Create Trip" color="primary" @click="createTrip"/>
            </q-card-actions>
            <q-card-actions v-else align="right" class="text-primary">
                <q-btn label="Cancel" @click="goToTrips"></q-btn>
                <q-btn label="Update" color="primary" @click="updateTrip"></q-btn>
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
import { TripState, PermitState, UserState, GeneralState, VesselState } from '../_store/types/types';
import { AlertState } from '../_store/types/types';

import moment from 'moment';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import {
  WcgopTrip,
  WcgopTripTypeName,
  Port,
  PortTypeName,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  Vessel,
  VesselTypeName
} from '@boatnet/bn-models';

@Component
export default class TripDetails extends Vue {

  @State('trip') private trip!: TripState;
  @State('permit') private permit!: PermitState;
  @State('user') private user!: UserState;
  @State('general') private general!: GeneralState;
  @State('vessel') private vessel!: VesselState;

  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

    // private trip = this.$store.state.activeTrip;
    private get permits() {
        return this.permit.permits.map( (permit: any) => ({label: permit.permit_number, value: permit.permit_number})
        );
    }

    private prompt = false;
    // private newMessage: string = '';

    // private get ports() {
    //     return this.general.ports.sort();
    // }

    private portOptions: string[] = [];

    private get fisheryOptions() {
        return this.general.fisheries;
    }

    constructor() {
        super();

    }

    // private addMessage() {
    //     if (this.trip.activeTrip) {
    //         this.trip.activeTrip.messages.push({
    //                             author: this.user.activeUser ,
    //                             datetime: moment().format() ,
    //                             text: this.newMessage
    //                             });
    //         this.newMessage = '';
    //         this.prompt = false;
    //     }
    //     }

    // private get tripMessages() {
    //     if (this.trip.activeTrip) {
    //         if (this.trip.activeTrip.messages) {
    //             return this.trip.activeTrip.messages.reverse();
    //         } else {
    //             return [];
    //             }
    //         } else {
    //             return [];
    //         }
    //     }

    private filterFn(val: string, update: any, abort: any) {
    update(async () => {
      try {
        const db = pouchService.db;
        const queryOptions: ListOptions = {
          limit: 5,
          start_key: val.toLowerCase(),
          inclusive_end: true,
          descending: false
        };

        const ports = await db.query(
          pouchService.lookupsDBName,
          'optecs_trawl/all_port_names',
          queryOptions
        );
        this.portOptions = ports.rows.map((port: any) => port.value);
        this.portOptions.push("SAME AS START")
      } catch (err) {
        this.errorAlert(err);
      }
    });
        }

    private deleteTrip() {
        this.trip.trips.pop();
        this.trip.activeTrip = null;
        this.$router.push({path: '/trips/'});
    }

    private createTrip() {
        // this is where the pouch code to save the trip goes
        pouchService.db.post(pouchService.userDBName, this.trip.activeTrip);
        this.$router.push({path: '/trips/'});
    }

    private goToTrips() {
        this.$router.push({path: '/trips/'});
    }

    // private getTimeText(time: any) {
    //     const difference = moment.duration(moment().diff(moment(time))).asSeconds();
    //     if (difference < 15) {
    //         return 'just now';
    //     } else if (difference >= 15 && difference < 60 ) {
    //         return Math.floor(difference) + ' seconds ago';
    //     } else {
    //         return Math.floor(difference / 60) + ' minutes ago';
    //     }
    // }

    get departureDate(): string | undefined {
        if (this.trip.activeTrip) {
            return moment(this.trip.activeTrip.departureDate).format('YYYY/MM/DD');
        }
    }

    set departureDate(value) {
        if (this.trip.activeTrip) {
            this.trip.activeTrip.departureDate = value;
        }
    }

    get returnDate(): string | undefined {
        if (this.trip.activeTrip) {
            return moment(this.trip.activeTrip.returnDate).format('YYYY/MM/DD');
        }
    }

    set returnDate(value) {
        if (this.trip.activeTrip) {
            this.trip.activeTrip.returnDate = value;
        }
    }

    private updateTrip() {
        pouchService.db.put(pouchService.userDBName, this.trip.activeTrip);
        this.$router.push({path: '/trips'});
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


