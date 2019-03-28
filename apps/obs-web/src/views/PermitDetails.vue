<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card ">

                <q-card-section>
                    <div class="text-h6">Vessel: {{ permit.vessel_name }}</div>
                    <div style="margin-left: 10px">
                        <div>Reg. No.: {{ permit.vessel_registration_number }}</div>
                        <div>Length: {{ permit.vessel_length }}'</div>
                        <div>Owner: {{ permit.vessel_owner }}</div>                        
                        <q-select
                        v-model="permitCaptains"
                        color="primary"
                    
                        multiple
                        use-chips
                        use-input
                        label="Active Captains"
                        :options="options"
                        @filter="filterFn"
                        style="width: 100%; font-size: 16px"
                        >
                        </q-select>
                    </div>
                </q-card-section>

                <q-card-section>
                    <div class="text-h6">Permit: {{ permit.permit_number }}</div>

                    <div style="margin-left: 10px">Endorsed Length: {{ permit.endorsed_length }}'</div>

                    <div class="text-h6">Endorsements:</div>
                        <ul style="margin-top: 0">
                            <li v-if="permit.trawl_gear">Trawl Gear</li>
                            <li v-if="permit.longline_gear">Longline Gear</li>
                            <li v-if="permit.trap_pot_gear">Trap Pot Gear</li>
                            <li v-if="permit.small_fleet">Small Fleet</li>
                            <li v-if="permit.sablefish_endorsement">Sablefish Endorsement</li>
                            <li v-if="permit.sablefish_tier">Sablefish Tier {{ permit.sablefish_tier }}</li>
                            <li v-if="permit.cp_endorsement">Catcher Processor</li>
                            <li v-if="permit.ms_endorsement">Mothership</li>
                            <li v-if="permit.mothership_catcher_vessel">Mothership Catcher</li>
                            <li v-if="permit.whiting_percent">Whiting %: {{ permit.whiting_percent }}</li>
                            <li v-if="permit.whiting_assignment">Whiting Assignment: {{ permit.whiting_assignment }}</li>
                            <li v-if="permit.owner_on_board_exempt">Owner On Board Exempt</li>
                        </ul>
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
    
    private captains = [
        {label: 'Seth', value: 1234, eggplant: 'eww'},
        {label: 'Bob', value: 5678, eggplant: 'eww'},
        {label: 'Sally', value: 3234, eggplant: 'eww'},
        {label: 'Betty', value: 9293, eggplant: 'yum'}
    ];
    
    private permit = this.$store.state.activePermit;

    private permitCaptains = [];
    
    // private options = this.captains;
    private options = this.captains

    constructor() {
        super();
    }
 
    private filterFn (val:string, update: any) {
        if (val === '') {
            update(() => {
            this.options = this.captains;
            })
            return
        }
      update(() => {
        const searchString = val.toLowerCase();
        this.options = this.options.filter(v => v.label.toLowerCase().indexOf(searchString) > -1);
      })
    }
    

}
</script>


<style lang="stylus" scoped>
.my-card
  width 100%
  max-width: 400px

</style>