<template>
    <q-page padding>
        <div style="display: flex">

            <q-select v-model="selectedDoc" outlined dense :options="designDocs" label="Design Doc" @input="getViews(selectedDoc)" :option-label="(doc) => doc.replace('_design/', '')" style="width: 200px; margin: 10px"></q-select>
            <q-select v-model="selectedView" outlined dense :options="views" label="View" @input="getView(selectedView)" style="width: 200px; margin: 10px"></q-select>

        </div>

        <div style="display: flex">

            <div style="border: 2px solid #1675d1; border-radius: 5px; margin: 10px; padding: 10px" v-if="designDocs.length > 0">
                <div class="text-h6">Design Docs</div>
                <q-list>
                    <q-item clickable :active="selectedDoc === doc" active-class="active-item" v-for="doc of designDocs" :key="designDocs.indexOf(doc)" @click.native="getViews(doc)">{{ doc.replace('_design/', '' ) }}</q-item>
                </q-list>
            </div>

            <div style="border: 2px solid #1675d1; border-radius: 5px; margin: 10px; padding: 10px; max-height: 400px" v-if="views.length > 0">
                <div class="text-h6">Views</div>
                <q-scroll-area style="height: 350px; width: 200px;">
                    <q-list>
                        <q-item clickable :active="selectedView === doc" active-class="active-item" v-for="doc of views" :key="views.indexOf(doc)" @click.native="getView(doc)">{{ doc }}</q-item>
                    </q-list>
                </q-scroll-area>
            </div>


            <div style="border: 2px solid #1675d1; border-radius: 5px; margin: 10px; padding: 10px; width: 400px" v-if="selectedView">
                <div class="text-h6">Selected View: {{ selectedView.toUpperCase() }}</div>
                <div>
                    {{ viewDocs[selectedView].map }}
                </div>

                <q-btn class="view-button" label="run" color="primary" @click="runView"></q-btn>
                <q-toggle v-model="includeDocs" color="primary" label="include docs"></q-toggle>
                <q-btn v-if="viewDocs[selectedView].reduce" class="view-button" label="run with reduce" @click="runWithReduce"></q-btn>
                <q-select v-if="options.length > 0" v-model="viewKey" :options="options" label="key" emit-value outlined style="width: 200px"></q-select>
                <q-btn v-if="options.length > 0" class="view-button" label="run with key" @click="runWithKey(viewKey)"></q-btn>
                <br><br>
                <q-btn class="view-button" label="edit"></q-btn>
                <q-btn class="view-button" label="duplicate"></q-btn>
            </div>

            <div v-if="viewResults.length > 0" style="border: 2px solid #1675d1; border-radius: 5px; margin: 10px; padding: 10px">
                <div>Loaded Docs: {{ viewResults.length }} </div>

                <q-btn label="get results" @click="getResults" :loading="loading" wait-for-ripple></q-btn>

                <div v-if="displayResults && selectedView === 'trips-query'"> {{ queryFishery }} {{ queryType }}: {{ calculatedResult }} for {{ queryRangeStart }} through {{ queryRangeEnd }} for vessel {{ queryVessel }}</div>
            </div>

        </div>

        <div class="fixed-bottom" style="text-align: center; margin: 80px; z-index: 999" v-if="loading">
            <q-spinner
                color="primary"
                size="10em"
                :thickness="10"
            />
        </div>


        <div v-if="viewResults.length > 0 && selectedView === 'trips-query'" style="display: flex">
            <div>
                <div class="text-h6" style="margin-left: 10px">Range Start</div>
                <q-date v-model="queryRangeStart" label="query range start"></q-date>
            </div>
            <div>
                <div class="text-h6" style="margin-left: 10px">Range End</div>
                <q-date type="date" v-model="queryRangeEnd" label="query range end"></q-date>
            </div>
            <div>
                <div class="text-h6" style="margin-bottom: 10px">Options</div>
                <q-select v-model="queryType" :options="queryTypes" label="Query Type" outlined style="width: 200px" @input="resetResult"></q-select>
                <q-select v-model="queryProgram" :options="programOptions" label="Program" outlined style="width: 200px" @input="resetResult"></q-select>
                <q-select v-model="queryFishery" :options="fisheryOptions" label="Fishery" emit-value outlined style="width: 200px" @input="resetResult"></q-select>
                <q-select v-model="queryVessel" :options="vesselOptions" label="Vessel" emit-value outlined style="width: 200px" @input=resetResult></q-select>
            </div>


        </div>

            <div v-if="viewResults.length > 0 && selectedView !== 'trips-query'">
                <q-list>
                    <q-item v-for="result of viewResults" :key="viewResults.indexOf(result)"> {{ result }} </q-item>
                </q-list>
            </div>


    </q-page>
</template>

<script lang='ts'>

// import { mapState } from 'vuex';
import { State, Action, Getter, Mutation } from 'vuex-class';
import { AlertState } from '../_store/types/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { WcgopTrip } from '@boatnet/bn-models';

import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import axios from 'axios';

@Component
export default class CouchViews extends Vue {

    private designDocs: any[] = [];
    private views: any[] = [];
    private selectedDoc: any = '';
    private selectedView: any = '';
    private viewDocs: any = {};
    private viewResults: any = [];
    private viewKey: string = '';
    private includeDocs: boolean = false;
    private options: any = [];
    private fisheryOptions: any[] = [];
    private vesselOptions: any[] = [];
    private programOptions: any[] = [];

    private queryRangeStart: string = '2000/01/01';
    private queryRangeEnd: string = moment().format('YYYY/MM/DD');
    private queryType: string = 'Sea Days';
    private queryFishery: string = 'All';
    private queryVessel: string = 'All';
    private queryProgram: string = 'All';
    private calculatedResult: number = 0;
    private displayResults: any = false;

    private queryTypes = ['Sea Days', 'Observers', 'Trips', 'Vessel'];

    private loading: boolean = false;

    constructor() {
        super();
    }

    private async getDesignDocs() {
        const queryDocs = await couchService.masterDB.get('_design_docs');

        this.designDocs = [];
        this.views = [];
        this.selectedView = '';
        this.selectedDoc = '';
        this.viewResults = [];
        this.viewKey = '';
        this.options = [];
        for (const row of queryDocs.rows) {
            if (row.id !== '_design/replication_filters' && row.id !== '_design/validation') {
                this.designDocs.push(row.id);
            }
        }
    }

    private async getViews(doc: any) {
        this.selectedDoc = doc;
        const queryDocs = await couchService.masterDB.get(doc);

        this.viewDocs = queryDocs.views;
        this.views = Object.keys(queryDocs.views);
        this.selectedView = '';
        this.viewResults = [];
        this.viewKey = '';
        this.options = [];
    }

    private getView(doc: any) {

        this.selectedView = doc;
        this.viewResults = [];
        this.viewKey = '';
        this.options = [];
    }

    private async runView() {

        this.viewResults = [];

        const queryOptions: any = {
            include_docs: this.includeDocs
        };

        try {
            this.loading = true;
            const queryDocs = await couchService.masterDB.view(
                this.selectedDoc.replace('_design/', ''),
                this.selectedView,
                queryOptions
            );

            console.log(queryDocs.rows);
            for (const row of Object.keys(queryDocs.rows)) {
                this.viewResults.push(queryDocs.rows[row]);
            }
            this.getFisheriesAndVessels();
            this.loading = false;
        } catch (err) {
            console.log(err);
        }
    }

    private async runWithKey(key: string) {

        this.viewResults = [];

        const queryOptions: any = {
            include_docs: true,
            reduce: false,
            key
        };

        try {
            const queryDocs = await couchService.masterDB.view(
                this.selectedDoc.replace('_design/', ''),
                this.selectedView,
                queryOptions
            );

            this.viewResults = queryDocs.rows;
        } catch (err) {
            console.log(err);
        }
    }

    private async runWithReduce() {

        this.viewResults = [];

        const queryOptions: any = {
            include_docs: false,
            reduce: true,
            group_level: 1
        };

        try {
            const queryDocs = await couchService.masterDB.view(
                this.selectedDoc.replace('_design/', ''),
                this.selectedView,
                queryOptions
            );

            this.viewResults = queryDocs.rows;

            this.options = queryDocs.rows.map( (row: any) => ( {label: row.key, value: row.key} ) );

        } catch (err) {
            console.log(err);
        }
    }

    private getFisheriesAndVessels() {
        const fisheries: any[] = [];
        const vessels: any[] = [];
        const programs: any[] = [];

        this.fisheryOptions = [];
        this.vesselOptions = [];
        this.programOptions = [];

        for (const result of this.viewResults) {
            if (fisheries.indexOf(result.value.fishery) === -1) {
                this.fisheryOptions.push({label: result.value.fishery, value: result.value.fishery});
                fisheries.push(result.value.fishery);
            }

            if (vessels.indexOf(result.value.vesselName) === -1) {
                this.vesselOptions.push({label: result.value.vesselName, value: result.value.vesselName});
                vessels.push(result.value.vesselName);
            }

            if (programs.indexOf(result.value.programName) === -1) {
                this.programOptions.push({label: result.value.programName, value: result.value.programName});
                programs.push(result.value.programName);
            }
        }

        this.fisheryOptions.sort( (a: any, b: any) => {
            if (a.label > b.label) {
                return 1;
            }
            if (a.label < b.label) {
                return -1;
            } else {
                return 0;
            }
        } );

        this.vesselOptions.sort( (a: any, b: any) => {
            if (a.label > b.label) {
                return 1;
            }
            if (a.label < b.label) {
                return -1;
            } else {
                return 0;
            }
        } );

        this.programOptions.sort( (a: any, b: any) => {
            if (a.label > b.label) {
                return 1;
            }
            if (a.label < b.label) {
                return -1;
            } else {
                return 0;
            }
        } );

        this.vesselOptions.unshift({label: 'All', value: 'All'});
        this.fisheryOptions.unshift({label: 'All', value: 'All'});
        this.programOptions.unshift({label: 'All', value: 'All'});
    }

    private resetResult() {
        this.calculatedResult = 0;
        this.displayResults = false;
    }

    private getResults() {
        this.calculatedResult = 0;
        this.displayResults = true;

        for (const result of this.viewResults) {

            // console.log( moment(result.value.returnDate).format() )
            // console.log( moment(result.value.returnDate) >= moment(this.queryRangeStart) );
            // console.log( moment(result.value.returnDate) <= moment(this.queryRangeEnd ) );
            // console.log( result.value.fishery === this.queryFishery );

            if ( moment(result.value.returnDate) >= moment(this.queryRangeStart) && moment(result.value.returnDate) <= moment(this.queryRangeEnd ) ) {

                if (this.queryFishery === 'All') {
                    if (this.queryVessel === 'All') {
                        this.calculatedResult += moment(result.value.returnDate).diff(moment(result.value.departureDate), 'days') + 1;
                    } else {
                        if (this.queryVessel === result.value.vesselName) {
                            this.calculatedResult += moment(result.value.returnDate).diff(moment(result.value.departureDate), 'days') + 1;
                        }
                    }
                } else {
                    if (this.queryFishery === result.value.fishery) {
                        if (this.queryVessel === 'All') {
                            this.calculatedResult += moment(result.value.returnDate).diff(moment(result.value.departureDate), 'days') + 1;
                        } else {
                            if (this.queryVessel === result.value.vesselName) {
                                this.calculatedResult += moment(result.value.returnDate).diff(moment(result.value.departureDate), 'days') + 1;
                            }
                        }
                    }
                }

            }

        }
    }

    private created() {
        this.getDesignDocs();
    }

}

</script>

<style>
    .view-button {
        margin: 5px;
    }

    .active-item {
        color: #1675d1 !important;
        font-weight: bold;
        text-transform: uppercase;
    }
</style>