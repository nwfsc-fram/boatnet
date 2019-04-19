<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card ">

                <q-card-section>
                    <div class="text-h6">Vessel: {{ permit.activePermit.vessel_name }}</div>
                    <div style="margin-left: 10px">
                        <div>Reg. No.: {{ permit.activePermit.vessel_registration_number }}</div>
                        <div>Length: {{ permit.activePermit.vessel_length }}'</div>
                        <div>Owner: {{ permit.activePermit.vessel_owner }}</div>                        
                        <q-select
                        v-model="permit.activePermit.activeCaptains"
                        color="primary"
                    
                        multiple
                        use-chips
                        use-input
                        label="Active Captains"
                        :options="options"
                        @filter="filterFn"
                        style="width: 100%; font-size: 16px"
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
                            <q-avatar color="primary" text-color="white" icon="person" />
                            {{ scope.opt.label }}
                        </q-chip>
                    </template>
                        </q-select>
                    </div>
                </q-card-section>

                <q-card-section>
                    <div class="text-h6">Permit: {{ permit.activePermit.permit_number }}</div>

                    <div style="margin-left: 10px">Endorsed Length: {{ permit.activePermit.endorsed_length }}'</div>

                    <div class="text-h6">Endorsements:</div>
                        <ul style="margin-top: 0">
                            <li v-if="permit.activePermit.trawl_gear === 'Yes'">Trawl Gear</li>
                            <li v-if="permit.activePermit.longline_gear === 'Yes'">Longline Gear</li>
                            <li v-if="permit.activePermit.trap_pot_gear === 'Yes'">Trap Pot Gear</li>
                            <li v-if="permit.activePermit.small_fleet === 'Yes'">Small Fleet</li>
                            <li v-if="permit.activePermit.sablefish_endorsement === 'Yes'">Sablefish Endorsement</li>
                            <li v-if="permit.activePermit.sablefish_tier">Sablefish Tier {{ permit.activePermit.sablefish_tier }}</li>
                            <li v-if="permit.activePermit.cp_endorsement === 'Yes'">Catcher Processor</li>
                            <li v-if="permit.activePermit.ms_endorsement === 'Yes'">Mothership</li>
                            <li v-if="permit.activePermit.mothership_catcher_vessel === 'Yes'">Mothership Catcher</li>
                            <li v-if="permit.activePermit.whiting_percent">Whiting %: {{ permit.activePermit.whiting_percent }}</li>
                            <li v-if="permit.activePermit.whiting_assignment">Whiting Assignment: {{ permit.activePermit.whiting_assignment }}</li>
                            <li v-if="permit.activePermit.owner_on_board_exempt === 'Yes'">Owner On Board Exempt</li>
                        </ul>
                </q-card-section>
            </q-card>
    
    </div>   
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PermitState } from '../_store/types/types';

@Component
export default class PermitDetails extends Vue {
    @State('permit') private permit!: PermitState;

    private captains = [
        {label: 'Seth', value: 1234, eggplant: 'eww'},
        {label: 'Bob', value: 5678, eggplant: 'eww'},
        {label: 'Sally', value: 3234, eggplant: 'eww'},
        {label: 'Betty', value: 9293, eggplant: 'yum'}
    ];

    // private permit = this.$store.state.activePermit;
    private permitCaptains = [];
    private options = this.captains;

    constructor() {
        super();
    }

    private filterFn(val: string, update: any) {
        if (val === '') {
            update(() => {
                this.options = this.captains;
                });
            return;
        }
        update(() => {
            const searchString = val.toLowerCase();
            this.options = this.options.filter( (v) => v.label.toLowerCase().indexOf(searchString) > -1);
            });
        }

}
</script>


<style lang="stylus" scoped>
.my-card
  width 100%
  max-width: 400px

</style>

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