<template>
  <div>
    <div class="q-pa-md q-gutter-md centered-page-item">
      <q-btn color="primary" @click="newTarget">New Selection Target</q-btn>
    </div>
    <div class="centered-page-item">Active Targets</div>
    <q-list class="q-pa-md q-gutter-md" bordered separator>
      <q-item clickable v-for="(target, i) of activeTargets" :key="i" @click="editTarget(target)">
        <q-avatar
          size="50px"
          font-size="20px"
          :color="targetColor(target)"
          text-color="white"
        >{{ target.rate }}%</q-avatar>
        <q-item-section style="padding-left: 10px">
          <q-item-label>
            <strong>{{ target.fishery }} - {{ target.targetType }} - {{ target.target }}</strong>
          </q-item-label>
          <q-item-label caption>Start Date: {{ formatDate(target.startDate) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <div class="centered-page-item">Expired Targets</div>
    <q-list bordered separator>
      <q-item clickable v-for="(target, i) of expiredTargets" :key="i" @click="setActive(target)">
        <q-item-section avatar style="font-size:24px">{{ target.rate }}%</q-item-section>
        <q-item-section>
          <q-item-label>
            <strong>{{ target.fishery }} - {{ target.targetType }} - {{ target.target }}</strong>
          </q-item-label>
          <q-item-label
            caption
          >Start Date: {{ formatDate(target.startDate) }} / End Date: {{ formatDate(target.endDate) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-dialog v-model="prompt">
      <q-card style="minWidth:400px;minHeight:400px">
        <q-card-section>
          <div class="text-h6">New OTS Target</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="general.activeTarget.fishery"
            :options="fisheries"
            :rules="[val =>  !!val || 'Required']"
            label="Fishery"
          />
          <q-select
            v-model="general.activeTarget.targetType"
            :options="targetTypes"
            :rules="[val => !!val || 'Reqired']"
            label="Target Type"
          />
          <q-select
            v-model="general.activeTarget.target"
            :options="targetOptions"
            :rules="[val =>  !!val || 'Required']"
            label="Target"
          />
          <q-input
            v-model="general.activeTarget.rate"
            :rules="[val => { return val <= 100 && val >= 0 && !!val || 'Rate is required, and must be between 0 and 100 %'}]"
            label="Selection Rate (%)"
          ></q-input>
          <q-input
            :value="formatDate(general.activeTarget.startDate)"
            mask="date"
            :rules="['date']"
            label="Effective Date"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="general.activeTarget.startDate"/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            :value="formatDate(general.activeTarget.endDate)"
            mask="date"
            :rules="['date']"
            label="Exipration Date"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="general.activeTarget.endDate"/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section align="right" class="text-primary">
          <q-btn label="Cancel" @click="prompt = false"/>
          <q-btn color="primary" label="Create Target" @click="createTarget"/>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="edit">
      <q-card style="minWidth:400px;minHeight:400px">
        <q-card-section>
          <div class="text-h6">Edit OTS Target</div>
        </q-card-section>

        <q-card-section>
          <q-select v-model="general.activeTarget.fishery" :options="fisheries" label="Fishery"/>
          <q-select
            v-model="general.activeTarget.targetType"
            :options="targetTypes"
            label="Target Type"
          />
          <q-select v-model="general.activeTarget.target" :options="targetOptions" label="Target"/>
          <q-input
            v-model="general.activeTarget.rate"
            :rules="[val => { return val <= 100 && val >= 0  || 'rate must be between 0 and 100 %'}]"
            label="Selection Rate (%)"
          ></q-input>

          <q-input
            :value="formatDate(general.activeTarget.startDate)"
            mask="date"
            :rules="['date']"
            label="Effective Date"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="general.activeTarget.startDate"/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            :value="formatDate(general.activeTarget.endDate)"
            mask="date"
            :rules="['date']"
            label="Exipration Date"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="general.activeTarget.endDate"/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section align="right" class="text-primary">
          <q-btn color="primary" label="Close" @click="edit = false"/>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="reactivate">
      <q-card style="minWidth:400px">
        <q-card-section>
          <div class="text-h6">Are you sure you want to reactivate this target</div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="No" @click="reactivate = false"/>
          <q-btn flat label="Yes" @click="Activate"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';
import { GeneralState, PermitState, OtsTarget } from '../_store/types/types';

@Component
export default class OTSManagement extends Vue {
  @State('general') private general!: GeneralState;
  @State('permit') private permit!: PermitState;

  private prompt = false;
  private edit = false;
  private reactivate = false;
  private currentTarget: any;

  private get otsTargets() {
    return this.general.otsTargets;
  }

  private get targetTypes() {
    return this.general.targetTypes;
  }

  private get fisheries() {
    return this.general.fisheries;
  }

  private curDate = moment().format();
  private options = [];

  private get targetOptions() {
    if (this.general.activeTarget.targetType === 'Vessel') {
      const vessels = new Set();
      const permits = this.permit.permits;
      for (const permit of permits) {
        vessels.add(permit.vessel_name);
      }
      return Array.from(vessels).sort();
    } else if (this.general.activeTarget.targetType === 'Port Group') {
      return this.general.portGroups;
    } else {
      return ['fishery wide'];
    }
  }

  private get activeTargets() {
    return this.general.otsTargets
      .filter((target) => {
        if (target.endDate) {
          return moment(target.endDate) >= moment();
        } else {
          return [];
        }
      })
      .reverse();
  }

  private get expiredTargets() {
    return this.general.otsTargets
      .filter((target) => {
        if (target.endDate) {
          return moment(target.endDate) <= moment();
        }
      })
      .reverse();
  }

  constructor() {
    super();
  }

  private newTarget() {
    this.general.activeTarget = {
      fishery: '',
      targetType: 'Fishery',
      target: 'fishery wide',
      rate: null,
      startDate: moment().format(),
      endDate: moment().format('YYYY') + '/12/31'
    };
    this.prompt = true;
  }

  private createTarget() {
    this.otsTargets.push(this.general.activeTarget);
    this.prompt = false;
  }

  private editTarget(target: any) {
    this.general.activeTarget = target;
    this.edit = true;
  }

  private setActive(target: any) {
    this.general.activeTarget = target;
    this.reactivate = true;
  }

  private Activate() {
    this.general.activeTarget.endDate = null;
    this.reactivate = false;
  }

  private formatDate(dateStr: string): string {
    return moment(dateStr).format('YYYY/MM/DD');
  }

  private targetColor(target: OtsTarget) {
    switch (target.targetType) {
      case 'Fishery':
        return 'primary';
      case 'Vessel':
        return 'positive';
      case 'Port Group':
        return 'negative';
    }
  }


  // @Watch('general.activeTarget')
  //     private onActiveTargetChange(newVal: any, oldVal: any) {
  //     }

  @Watch('general.activeTarget.targetType')
  private onChange(newVal: any, oldVal: any) {
    if (newVal === 'Fishery') {
      this.general.activeTarget.target = 'fishery wide';
    } else {
      this.general.activeTarget.target = null;
    }
  }
}
</script>
