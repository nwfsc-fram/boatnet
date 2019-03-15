<template>
    <div>
        {{ trip.trip_num }}
        {{ trip.vessel }}
        {{ trip.start_date }}
        {{ trip.start_port }}
        {{ trip.end_date }}
        {{ trip.end_port }}
        {{ trip.messages }}
        {{ trip.permits }}
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import trip from './Trips.vue'
export default Vue.extend({
    data() {
        return {
            trip: this.$store.state.trips[this.$route.params.id],
        }
    }
});
</script>

