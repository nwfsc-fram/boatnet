<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card>
            <q-card-section>
                <!-- {{ this.$store.state.currentTrip.trip_num }} -->
                <p><strong>Trip # {{ trip.trip_num }}</strong></p>

                <q-input filled v-model="trip.start_date" mask="date" :rules="['date']" :dense="true" label="Start Date">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="trip.start_date" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-input filled v-model="trip.end_date" mask="date" :rules="['date']" :dense="true" label="End Date">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="trip.end_date" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-input filled v-model="trip.start_port" type="text" :dense="true" label="Start Port"></q-input>

                <q-input filled v-model="trip.end_port" type="text" :dense="true" label="End Port"></q-input> 
 
                <p><strong>Permits</strong></p>

            <q-select
            v-model="trip.permits"
            filled
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

                <p><strong>Messages</strong></p>
                <div class="q-pa-md" style="max-width: 350px">
                    <q-list bordered separator>
                        <q-item clickable :dense="true" v-ripple v-for="message in trip.messages" :key="message">
                            <q-item-section>{{ message }}</q-item-section>
                        </q-item>
                    </q-list>
                </div>
            </q-card-section>


        </q-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import trip from './Trips.vue'
export default Vue.extend({
    data() {
        return {
            trip: this.$store.state.trips[this.$route.params.id],
            permits: ['one', 'two', 'three','four', 'five', 'six','seven']
        }
    },
    methods: {
        onLeft() {
            console.log('Left action triggered.')
        },
        onRight() {
            console.log('Right action triggered.')
        }
    }
})
</script>

<style scoped>
    p {
        margin-bottom: 5px;
    }

    .q-field {
        padding-bottom: 5px;
    }
</style>
>

</style>

