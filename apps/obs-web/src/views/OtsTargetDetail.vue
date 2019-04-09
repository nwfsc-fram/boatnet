<template>
    <div>
            <q-card style="minWidth:400px;minHeight:400px">
                <!-- <q-card-section>
                    <div class="text-h6">Edit OTS Target</div>
                </q-card-section>

                <q-card-section>
                <q-select v-model="general.activeTarget.fishery" :options="fisheries" label="Fishery"/>
                <q-select v-model="general.activeTarget.targetType" :options="targetTypes" label="Target Type"/>
                <q-select v-model="general.activeTarget.target" :options="targetOptions" label="Target" />
                <q-input v-model="general.activeTarget.rate" :rules="[val => { return val <= 100 && val >= 0  || 'rate must be between 0 and 100 %'}]" label="Selection Rate (%)"></q-input>

                <q-input :value="formatDate(general.activeTarget.startDate)" mask="date" :rules="['date']" label="Effective Date">
                    <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="general.activeTarget.startDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>

                <q-input :value="formatDate(general.activeTarget.endDate)" mask="date" :rules="['date']" label="Exipration Date">
                    <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                        <q-date v-model="general.activeTarget.endDate" />
                    </q-popup-proxy>
                    </q-icon>
                </template>
                </q-input>
                </q-card-section>

                <q-card-section align="right" class="text-primary">
                <q-btn color="primary" label="Close" @click="edit = false" />
                </q-card-section> -->
            </q-card>
    </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';
import { GeneralState, PermitState, OtsTarget } from '../_store/types/types';

export default class OtsTargeteDetail extends Vue {
    @State('general') private general!: GeneralState;
    
    @Watch('general.activeTarget.targetType')
    private onChange(newVal: any, oldVal: any) {
        console.log(newVal, oldVal)
            if (newVal === 'Fishery') {
                this.general.activeTarget.target = 'fishery wide';
            } else {
                this.general.activeTarget.target = null;
            }
    }
    }
</script>
