<template>
    <div >
        <div class="q-pa-md q-gutter-md centered-page-item">
        <q-btn color="primary" @click="newTarget">New Selection Target</q-btn>
        </div>
        <div class="centered-page-item">Active Targets</div>
        <q-list bordered separator>
            <q-item v-for="(target, i) of activeTargets" :key="i" @click="editTarget(target)">
                <q-item-section avatar style="font-size:24px">
                    {{ target.rate }}%
                </q-item-section>
                <q-item-section>
                    <q-item-label>
                        <strong>
                        {{ target.fishery }} - {{ target.targetType }} - {{ target.target }}
                        </strong>
                    </q-item-label>
                    <q-item-label caption>Start Date: {{ formatDate(target.startDate) }}</q-item-label>
                </q-item-section>

            </q-item>
        </q-list>
        <div class="centered-page-item">Expired Targets</div>
        <q-list bordered separator>
            <q-item v-for="(target, i) of expiredTargets" :key="i" @click="setActive(target)">
                <q-item-section avatar style="font-size:24px">
                    {{ target.rate }}%
                </q-item-section>
                <q-item-section>
                    <q-item-label>
                        <strong>
                            {{ target.fishery }} - {{ target.targetType }} - {{ target.target }}
                        </strong>
                    </q-item-label>
                    <q-item-label caption>Start Date: {{ formatDate(target.startDate) }} / End Date: {{ formatDate(target.endDate) }}</q-item-label>    
                        
                </q-item-section>
            </q-item>
        </q-list>

        <q-dialog v-model="prompt">
            <q-card style="minWidth:400px;minHeight:400px">
                <q-card-section>
                    <div class="text-h6">New OTS Target</div>
                </q-card-section>

                <q-card-section>
                <q-select v-model="target.fishery" :options="fisheries" :rules="[val =>  !!val || 'Required']" label="Fishery"/>
                <q-select v-model="target.targetType" :options="targetTypes" :rules="[val => !!val || 'Reqired']" label="Target Type" />
                <q-select v-model="target.target" :options="targets" :rules="[val =>  !!val || 'Required']" label="Target" />
                <q-input v-model="target.rate" :rules="[val => { return val <= 100 && val >= 0 && !!val || 'Rate is required, and must be between 0 and 100 %'}]" label="Selection Rate (%)"></q-input>
                <q-input :value="formatDate(target.startDate)" mask="date" :rules="['date']" label="Effective Date">
                    <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="target.startDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>
                <q-input :value="formatDate(target.endDate)" mask="date" :rules="['date']" label="Exipration Date">
                    <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="target.endDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>
                </q-card-section>

                <q-card-section align="right" class="text-primary">
                <q-btn label="Cancel" @click="prompt = false" />
                <q-btn color="primary" label="Create Target" @click="createTarget" />
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="edit">
            <q-card style="minWidth:400px;minHeight:400px">
                <q-card-section>
                    <div class="text-h6">Edit OTS Target</div>
                </q-card-section>

                <q-card-section>
                <q-select v-model="target.fishery" :options="fisheries" label="Fishery"/>
                <q-select v-model="target.targetType" :options="targetTypes" label="Target Type" />
                <q-select v-model="target.target" :options="targets" label="Target" />
                <q-input v-model="target.rate" :rules="[val => { return val <= 100 && val >= 0  || 'rate must be between 0 and 100 %'}]" label="Selection Rate (%)"></q-input>

                <q-input :value="formatDate(target.startDate)" mask="date" :rules="['date']" label="Effective Date">
                    <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="target.startDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-input :value="formatDate(target.endDate)" mask="date" :rules="['date']" label="Exipration Date">
                    <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="target.endDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>
                </q-card-section>

                <q-card-section align="right" class="text-primary">
                <q-btn color="primary" label="Close" @click="edit = false" />
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="reactivate">
            <q-card style="minWidth:400px">
                <q-card-section>
                    <div class="text-h6">Are you sure you want to reactivate this target</div>
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                <q-btn flat label="No" @click="reactivate = false" />
                <q-btn flat label="Yes" @click="Activate" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import moment from 'moment';
import { GeneralState, PermitState } from '../_store/types/types';

@Component
export default class OTSManagement extends Vue {

    @State('general') private general!: GeneralState;
    @State('permit') private permit!: PermitState;

    private target = {fishery: '', targetType: null, target: '', rate: null, startDate: moment(), endDate: null };
    private prompt = false;
    private edit = false;
    private reactivate = false;

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

    private get targets() {
        if (this.target.targetType === 'Vessel') {
            const vessels = new Set();
            const permits = this.permit.permits;
            for (const permit of permits) {
                vessels.add(permit.vessel_name);
            }
            return Array.from(vessels).sort();
        } else if (this.target.targetType === 'Port Group') {
            return this.general.portGroups;
        } else {
            return ['fishery wide'];
        }
    }

    private get activeTargets() {
        return this.general.otsTargets.filter(
            (target) => moment(target.endDate) >= moment()
        ).reverse();
    }

    private get expiredTargets() {
        return this.general.otsTargets.filter(
            (target) => moment(target.endDate) <= moment()
        ).reverse();
    }

    constructor() {
        super();
        }

    private newTarget() {
        this.target = {fishery: '', targetType: null, target: '', rate: null, startDate: moment(), endDate: null};
        this.prompt = true;
    }

    private createTarget() {
        this.otsTargets.push(this.target);
        this.prompt = false;
    }

    private editTarget(target: any) {
        this.target = target;
        this.edit = true;
    }

    private setActive(target: any ) {
        this.target = target;
        this.reactivate = true;
    }

    private Activate() {
        this.target.endDate = null;
        // this.$store.state.otsTargets.push(this.target)
        this.reactivate = false;
    }

  private formatDate(dateStr: string): string {
    return moment(dateStr).format('YYYY/MM/DD');
  }

}
</script>
