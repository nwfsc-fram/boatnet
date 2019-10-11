<template>
    <q-page padding>
        <q-btn label="get design docs" @click.native="getDesignDocs"></q-btn>

        <div style="display: flex">

            <div style="border: 2px solid green; border-radius: 5px; margin: 10px; padding: 5px">
                <div class="text-h6">Design Doc</div>
                <q-list>
                    <q-item v-for="doc of designDocs" :key="designDocs.indexOf(doc)" @click.native="getViews(doc)">{{ doc.replace('_design/', '' ) }}</q-item>
                </q-list>
            </div>

            <div style="border: 2px solid blue; border-radius: 5px; margin: 10px; padding: 5px; max-height: 500px">
                <div class="text-h6">Views</div>
                <q-scroll-area style="height: 450px; width: 200px;">
                    <q-list>
                        <q-item v-for="doc of views" :key="views.indexOf(doc)" @click.native="getView(doc)">{{ doc }}</q-item>
                    </q-list>
                </q-scroll-area>
            </div>

            <div style="border: 2px solid red; border-radius: 5px; margin: 10px; padding: 5px" v-if="selectedView">
                <div class="text-h6">Selected View</div>
                <div>
                    {{ viewDocs[selectedView].map }}
                </div>

                <q-btn class="view-button" label="run" color="primary" @click="runView"></q-btn>
                <q-btn class="view-button" label="run with key" @click="runWithKey(viewKey)"></q-btn>
                <q-select v-model="viewKey" :options="options" label="key" emit-value outlined style="width: 200px"></q-select>
                <q-btn class="view-button" label="run with reduce" @click="runWithReduce"></q-btn>
                <q-btn class="view-button" label="edit"></q-btn>
                <q-btn class="view-button" label="duplicate"></q-btn>
            </div>

        </div>

        {{ viewKey }}
        <!-- <div v-for="result of viewResults" :key="viewResults.indexOf(result)"> {{ result.doc ? result.doc : result }} </div> -->
        <div> {{ viewResults[1] }} </div>
        <div> {{ viewResults.length }} </div>
        <q-btn label="get results" @click="getResults"></q-btn>

        <div> {{ queryFishery }} Sea Days: {{ calculatedResult }} for {{ queryRangeStart }} through {{ queryRangeEnd }}</div>

        <div v-if="viewResults" style="display: flex">
            <div>
                <div class="text-h6">Range Start</div>
                <q-date v-model="queryRangeStart" label="query range start"></q-date>
            </div>
            <div>
                <div class="text-h6">Range End</div>
                <q-date type="date" v-model="queryRangeEnd" label="query range end"></q-date>
            </div>
            <div>
                <div class="text-h6">Other Parameters
                </div>
                <div>Query Type: {{ queryType }}</div>
                <div>Fishery: {{ queryFishery }}</div>
            </div>

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
    private options: any = [];

    private queryRangeStart: string = '';
    private queryRangeEnd: string = '';
    private queryType: string = 'Sea Days';
    private queryFishery: string = 'CA Nearshore';
    private calculatedResult: number = 0;

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

        const queryOptions: any = {
            include_docs: false
        };

        try {
            const queryDocs = await couchService.masterDB.view(
                this.selectedDoc.replace('_design/', ''),
                this.selectedView,
                queryOptions
            );

            console.log(queryDocs.rows);
            for (const row of Object.keys(queryDocs.rows)) {
                this.viewResults.push(queryDocs.rows[row]);
            }
        } catch (err) {
            console.log(err);
        }
    }

    private async runWithKey(key: string) {

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

    private getResults() {
        for (const result of this.viewResults) {

            // console.log( moment(result.value.returnDate).format() )
            // console.log( moment(result.value.returnDate) >= moment(this.queryRangeStart) );
            // console.log( moment(result.value.returnDate) <= moment(this.queryRangeEnd ) );
            // console.log( result.value.fishery === this.queryFishery );

            if ( moment(result.value.returnDate) >= moment(this.queryRangeStart) && moment(result.value.returnDate) <= moment(this.queryRangeEnd ) && result.value.fishery === this.queryFishery ) {
                console.log(moment(result.value.returnDate).diff(moment(result.value.departureDate), 'days'));
                this.calculatedResult += moment(result.value.returnDate).diff(moment(result.value.departureDate), 'days') + 1;
            }

        }
    }

}

</script>

<style>
    .view-button {
        margin: 5px;
    }
</style>