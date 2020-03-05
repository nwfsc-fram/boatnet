<template>
    <div class="q-pa-md q-gutter-md" style="width: 90%; margin-left: 5%">
        <pChart type="bar" :data="basicData" :options="options"/>

        <div @click="saveAndLoad">
            <!-- <div class="row">
                <div class="col" style="padding: 2%">
                    <div class="text-h6">Review Rate</div><br>
                    <q-slider v-model="emRates.reviewRate" :min="0" :max="100" label label-always color="primary" ></q-slider>

                    <div class="text-h6">Hauls Review Rate</div><br>
                    <q-slider v-model="emRates.haulsReviewRate" :min="0" :max="100" label label-always color="primary"></q-slider>

                    <div class="text-h6">IFQ - Use Review Rate Threshold</div><br>
                    <q-slider v-model="emRates.ifqReviewThreshold" :min="0" :max="100" label label-always color="primary"></q-slider>
                </div>
                <div class="col" style="padding: 2%">
                    <div class="text-h6">Audit Rate</div><br>
                    <q-slider v-model="emRates.auditRate" :min="0" :max="100" label label-always color="primary"></q-slider>

                    <div class="text-h6">IFQ - Use Audit Rate Threshold</div><br>
                    <q-slider v-model="emRates.ifqAuditThreshold" :min="0" :max="100" label label-always color="primary"></q-slider>
                </div>
            </div> -->

            <!-- <ul class="chart" style="text-align: center">
                <li >
                    <span v-bind:style="{height: emRates.reviewRate + '%'}">Review Rate</span>
                </li>
                <li>
                    <span v-bind:style="{height: emRates.haulsReviewRate + '%'}">Hauls Review Rate</span>
                </li>
                <li>
                    <span v-bind:style="{height: emRates.auditRate + '%'}">Audit Rate</span>
                </li>
                <li>
                    <span v-bind:style="{height: emRates.ifqAuditThreshold + '%'}">IFQ - Use Audit Rate Threshold</span>
                </li>
                <li>
                    <span v-bind:style="{height: emRates.ifqReviewThreshold + '%'}">IFQ - Use Review Rate Threshold</span>
                </li>
            </ul> -->

        <div class="row" style="text-align: center">
            <div class="col">
                <div class="text-h6">Review<br>Rate (%)</div>
                <q-input outlined v-model="emRates.reviewRate">
                    <template v-slot:append>
                        <q-btn color="primary" round icon="add" size="sm" @mousedown="start('up', 'reviewRate')" @mouseleave="end" @mouseup="end"/>&nbsp;
                        <q-btn color="primary" round icon="remove" size="sm" @mousedown="start('down', 'reviewRate')" @mouseleave="end" @mouseup="end"/>
                    </template>
                </q-input>
            </div>
            <div class="col">
                <div class="text-h6">Audit<br>Rate (%)</div>
                <q-input outlined v-model="emRates.auditRate">
                    <template v-slot:append>
                        <q-btn color="primary" round icon="add" size="sm" @mousedown="start('up', 'auditRate')" @mouseleave="end" @mouseup="end"/>&nbsp;
                        <q-btn color="primary" round icon="remove" size="sm" @mousedown="start('down', 'auditRate')" @mouseleave="end" @mouseup="end"/>
                    </template>
                </q-input>
            </div>
            <div class="col">
                <div class="text-h6">Hauls Review<br>Rate (%)</div>
                <q-input outlined v-model="emRates.haulsReviewRate">
                    <template v-slot:append>
                        <q-btn color="primary" round icon="add" size="sm" @mousedown="start('up', 'haulsReviewRate')" @mouseleave="end" @mouseup="end"/>&nbsp;
                        <q-btn color="primary" round icon="remove" size="sm" @mousedown="start('down', 'haulsReviewRate')" @mouseleave="end" @mouseup="end"/>
                    </template>
                </q-input>
            </div>
            <div class="col">
                <div class="text-h6">IFQ - Use Review<br>Threshold (+/- %)</div>
                <q-input outlined v-model="emRates.ifqReviewThreshold">
                    <template v-slot:append>
                        <q-btn color="primary" round icon="add" size="sm" @mousedown="start('up', 'ifqReviewThreshold')" @mouseleave="end" @mouseup="end"/>&nbsp;
                        <q-btn color="primary" round icon="remove" size="sm" @mousedown="start('down', 'ifqReviewThreshold')" @mouseleave="end" @mouseup="end"/>
                    </template>
                </q-input>
            </div>
            <div class="col">
                <div class="text-h6">IFQ - Use Audit<br>Threshold (+/- %)</div>
                <q-input outlined v-model="emRates.ifqAuditThreshold">
                    <template v-slot:append>
                        <q-btn color="primary" round icon="add" size="sm" @mousedown="start('up', 'ifqAuditThreshold')" @mouseleave="end" @mouseup="end"/>&nbsp;
                        <q-btn color="primary" round icon="remove" size="sm" @mousedown="start('down', 'ifqAuditThreshold')" @mouseleave="end" @mouseup="end"/>
                    </template>
                </q-input>
            </div>
        </div>

            <div style="padding: 2%">
                <div class="text-h6">Change Log:</div>
                <div v-for="item in emRates.changeLog" :key="emRates.changeLog.indexOf(item)"> {{ item.updatedDate }} - {{ item.updatedBy }} - {{ item.changes }} </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';

import { Notify } from 'quasar';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import Chart from 'primevue/chart';
Vue.component('pChart', Chart);

import { getTripsApiTrip, getCatchApiCatch } from '../helpers/trips-api';
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
    setup(props, context) {
        const emRates: any = reactive(
            {
                reviewRate: 0,
                auditRate: 0,
                haulsReviewRate: 0,
                ifqReviewThreshold: 0,
                ifqAuditThreshold: 0
            }
        );
        let interval: any = false;
        let oldRates: any;

        const basicData = computed( () => {
            return {
                labels: ['Review Rate', 'Audit Rate', 'Hauls Review Rate', 'IFQ - Use Review Threshold', 'IFQ - Use Audit Threshold'],
                datasets: [
                    {
                        label: 'Set Rate',
                        backgroundColor: '#007EC6',
                        data: [emRates.reviewRate, emRates.auditRate, emRates.haulsReviewRate, emRates.ifqReviewThreshold, emRates.ifqAuditThreshold]
                    },
                    {
                        label: 'Actual',
                        backgroundColor: '#153547',
                        data: [30, 10, 100, 10, 10, 0]
                    }
                ]
            };
        });

        const options = {
            responsive: true,
            update: 0,
            hoverMode: 'index',
            stacked: false,
            scales: {
                yAxes: [{
                    type: 'linear',
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                },
                {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    gridLines: {
                        drawOnChartArea: true
                    }
                }]
            }
        };

        const masterDb: Client<any> = couchService.masterDB;

        const getEmRates = async () => {
            const queryOptions = {
                reduce: false,
                include_docs: true,
                key: 'em-rate-config'
            };
            const emRateConfig: any = await masterDb.view(
                'obs_web',
                'all_doc_types',
                queryOptions
            );

            if (emRateConfig.rows[0]) {
                const rates = emRateConfig.rows[0].doc;
                for (const attrib of Object.keys(rates)) {
                    Vue.set(emRates, attrib, rates[attrib]);
                }
                oldRates = rates;
            }
        };

        const increment = (attrib: any) => {
            if (emRates[attrib] < 100) {
                emRates[attrib] += 1;
            }
        };

        const decrement = (attrib: any) => {
            if (emRates[attrib] > 0) {
                emRates[attrib] -= 1;
            }
        };

        const start = (direction: any, attrib: any) => {
            if (!interval) {
                if (direction === 'up') {
                    interval = setInterval(() => increment(attrib), 20);
                } else {
                    interval = setInterval(() => decrement(attrib), 20);
                }
            }
        };

        const end = () => {
            clearInterval(interval);
            interval = false;
        };

        onMounted( () => {
            getEmRates();
        });

        const saveAndLoad = async () => {
                if (!emRates.changeLog) {
                    emRates.changeLog = [];
                }
                const updates: any = {
                    updatedBy: authService.getCurrentUser()!.username,
                    updatedDate: moment().format()
                };
                if (emRates.reviewRate !== oldRates.reviewRate) {
                    updates.changes = 'reviewRate changed from ' + oldRates.reviewRate + ' to ' + emRates.reviewRate;
                } else if (emRates.auditRate !== oldRates.auditRate) {
                    updates.changes = 'auditRate changed from ' + oldRates.auditRate + ' to ' + emRates.auditRate;
                } else if (emRates.haulsReviewRate !== oldRates.haulsReviewRate) {
                    updates.changes = 'haulsReviewRate changed from ' + oldRates.haulsReviewRate + ' to ' + emRates.haulsReviewRate;
                } else if (emRates.ifqReviewThreshold !== oldRates.ifqReviewThreshold) {
                    updates.changes = 'ifqReviewThreshold changed from ' + oldRates.ifqReviewThreshold + ' to ' + emRates.ifqReviewThreshold;
                } else if (emRates.ifqAuditThreshold !== oldRates.ifqAuditThreshold) {
                    updates.changes = 'ifqAuditThreshold changed from ' + oldRates.ifqAuditThreshold + ' to ' + emRates.ifqAuditThreshold;
                } else {
                    return;
                }
                emRates.changeLog.unshift(updates);
                await masterDb.put(
                    emRates._id,
                    emRates,
                    emRates._rev
                ).then(
                    () => {
                        getEmRates();
                    }
                );
        };

        return {
            emRates, saveAndLoad, increment, decrement, start, end, basicData, options
        };


    }
});

</script>

<style scoped>

    /* .chart{
        display:table;
        table-layout: fixed;
        width:60%;
        max-width:700px;
        height:200px;
        margin:0 auto;
    }

    .chart li {
        position:relative;
        display:table-cell;
        vertical-align:bottom;
        height:200px;
    }

    .chart span {
        margin:0 1em;
        display: block;
        background: #007EC6;
        animation: draw 1s ease-in-out;
        color: white
    } */

    .title {
        display: inline;
    }

    .col {
        margin: 1%
    }


</style>