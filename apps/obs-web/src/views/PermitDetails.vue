<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card bg-blue-grey-1">
      <q-card-section>
        <div class="text-h6">Vessel: {{ permit.activePermit.vessel.vesselName }}</div>
        <div style="margin-left: 10px">
          <div>Reg. No.: {{ permit.activePermit.vessel.coastGuardNumber ? permit.activePermit.vessel.coastGuardNumber : permit.activePermit.vessel.stateRegulationNumber }}</div>
          <div>Length: {{ permit.activePermit.vessel.registeredLength.value }}'</div>
          <!-- <div>Owner: {{ permit.activePermit.vessel_owner }}</div> -->
          <q-select
            v-model="permit.activePermit.captains"
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
                <q-avatar color="primary" text-color="white" icon="person"/>
                {{ scope.opt.label }}
              </q-chip>
            </template>
          </q-select>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-h6">Permit: {{ permit.activePermit.permitNumber }}</div>

        <div style="margin-left: 10px">Endorsed Length: {{ permit.activePermit.endorsedLength }}'</div>

        <div class="text-h6">Endorsements:</div>
        <ul style="margin-top: 0">
          <li v-if="permit.activePermit.isTrawlGear">Trawl Gear</li>
          <li v-if="permit.activePermit.isLonglineGear">Longline Gear</li>
          <li v-if="permit.activePermit.isTrapPotGear">Trap Pot Gear</li>
          <li v-if="permit.activePermit.isSmallFleet">Small Fleet</li>
          <li v-if="permit.activePermit.isSableFishEndorsed">Sablefish Endorsement</li>
          <li
            v-if="permit.activePermit.sableFishTier"
          >Sablefish Tier {{ permit.activePermit.sableFishTier }}</li>
          <li v-if="permit.activePermit.isCpEndorsed">Catcher Processor</li>
          <li v-if="permit.activePermit.isMsEndorsed">Mothership</li>
          <li v-if="permit.activePermit.isMothershipCatcherVessel">Mothership Catcher</li>
          <li
            v-if="permit.activePermit.whitingPercent"
          >Whiting %: {{ permit.activePermit.whitingPercent }}</li>
          <li
            v-if="permit.activePermit.whitingAssignment"
          >Whiting Assignment: {{ permit.activePermit.whitingAssignment }}</li>
          <li v-if="permit.activePermit.isOwnerOnBoardExempt === 'Yes'">Owner On Board Exempt</li>
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
    { label: 'Seth', value: 1234, eggplant: 'eww' },
    { label: 'Bob', value: 5678, eggplant: 'eww' },
    { label: 'Sally', value: 3234, eggplant: 'eww' },
    { label: 'Betty', value: 9293, eggplant: 'yum' }
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
      this.options = this.options.filter(
        (v) => v.label.toLowerCase().indexOf(searchString) > -1
      );
    });
  }
}
</script>


<style lang="stylus" scoped>
.my-card {
  width: 100%;
  max-width: 400px;
}
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