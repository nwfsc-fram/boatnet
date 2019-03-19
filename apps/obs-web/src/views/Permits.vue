<template>
    <div>
        <div style="text-align: center" class="q-pa-md q-gutter-sm">
            <q-btn @click="getPermits">
                get permits
            </q-btn>
        </div>
        <q-list bordered separator>
            <q-item v-for="(permit, i) of filteredPermits" :key="i" @click="permitDetails(i)">
                <!-- <router-link :to="{ path: '/permits/' + i }" style="text-decoration: none; color: black"> -->
                <q-item-section>
                    <q-item-label>{{ permit.permit_number }}</q-item-label>
                    <q-item-label caption>{{ permit.vessel_name }}</q-item-label>
                </q-item-section>
                <!-- </router-link> -->
            </q-item>
            <div style="text-align: center; background-color: white" class="fixed-bottom q-pa-md q-gutter-sm">
                <q-input v-model="filterText" label="Search"></q-input>
            </div>
        </q-list>
    </div>
</template>

<script>
export default {
    data() {
        return {
            filterText: '',
            keys: ['permit_number', 'vessel_name', 'vessel_registration_number', 'vessel_owner']
        }
    },
    methods: {
    getPermits() {
        this.$http.get("https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500")
        .then(response => {
            return response.json()
        })
        .then(data => {
            const permitArray = []
            for (var permit of data.items)
                { permitArray.push(permit)}
            console.log(permitArray)
            this.$store.dispatch('updatePermits', permitArray) 
            console.log(this.$store.state.permits)
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
