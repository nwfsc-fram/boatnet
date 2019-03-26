<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card">
        <q-card-section>
            <div class="text-h6">Active Captains</div>
            <q-select
            v-model="permitCaptains"
            filled
            color="primary"
            multiple
            use-chips
            use-input
            stack-label
            :options="options"
            @filter="filterFn"
            style="width: 100%"
            >
            </q-select>
        </q-card-section>
        <q-card-section>
            <div class="text-h6">Vessel</div>
            <div>Name: {{ permit.vessel_name }}</div>
            <div>Reg. No.: {{ permit.vessel_registration_number }}</div>
            <div>Length: {{ permit.vessel_length }}</div>
            <div>Owner: {{ permit.vessel_owner }}</div>                        
        </q-card-section>

        <q-card-section>
            <div class="text-h6">Permit</div>
            <div>Number: {{ permit.permit_number }}</div>
            <div>Endorsed Length: {{ permit.endorsed_length }}</div>
            <div>Trawl Gear: {{ permit.trawl_gear }}</div>
            <div>Longline Gear: {{ permit.longline_gear }}</div>
            <div>Trap Pot Gear: {{ permit.trap_pot_gear }}</div>
            <div>Small Fleet: {{ permit.small_fleet }}</div>
            <div>Sablefish Endorsement: {{ permit.sabelfish_endorsement }}</div>
            <div>Sablefish Tier: {{ permit.sablefish_tier ? permit.sablefish_tier : 'N/A' }}</div>
            <div>CP Endorsement: {{ permit.cp_endorsement }}</div>
            <div>MS Endorsement: {{ permit.ms_endorsement }}</div>
            <div>MS Catcher Vessel: {{ permit.mothership_catcher_vessel }}</div>
            <div>Whiting Percent: {{ permit.whiting_percent ? permit.whiting_percent : 'N/A' }}</div>
            <div>Whiting Assignment {{ permit.whiting_assignment? permit.whiting_assignment: 'N/A' }}</div>
            <div>Owner On Board Exempt: {{ permit.owner_on_board_exempt ? 'Yes' : 'No' }}</div>
        </q-card-section>
    </q-card>     
    </div>   
</template>

<!--
<script>

const captains = ['seth', 'bob', 'sally', 'betty']

export default {

    data() {
        return {
            permit: this.$store.state.permits[this.$route.params.id],
            permitCaptains: [],
            options: captains            
        }
    },
    methods: {
        filterFn (val, update) {
        if (val === '') {
            update(() => {
            this.options = captains
            })
            return
        }

      update(() => {
        const needle = val.toLowerCase()
        this.options = captains.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    }
    }
}
</script>
-->

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class PermitDetails extends Vue {
    
    private captains = ['seth', 'bob', 'sally', 'betty'];
    
    private permit = this.$store.state.activePermit;

    private permitCaptains = [];
    
    // private options = this.captains;
    private options = this.captains

    constructor() {
        super();
    }
 
    filterFn (val:string, update: any) {
        if (val === '') {
            update(() => {
            this.options = this.captains;
            })
            return
        }
      update(() => {
        const searchString = val.toLowerCase();
        this.options = this.options.filter(v => v.toLowerCase().indexOf(searchString) > -1);
      })
    }
    

}
</script>


<style lang="stylus" scoped>
.my-card
  width 100%
  max-width 450px

</style>