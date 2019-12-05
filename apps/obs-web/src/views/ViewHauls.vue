<template>
    <div>
        <div style="display: flex">

        <div>


        {{ selection }}

        <!-- iterate through reference haul top level attributes -->
        <div v-for="item of Object.keys(refHaul)" :key="Object.keys(refHaul).indexOf(item)">
            <!-- checkbox for each top level attribute -->
            <q-checkbox :label="item" :val="item" v-model="selection" dense></q-checkbox>
            <!-- if value of top level attribute is array -->
            <div v-if="(Array.isArray(refHaul[item]) && item !== 'catches')" style="margin-left: 10px">
                <!-- iterate through the sub level attributes of the first item in the array -->
                <div v-for="subItem of Object.keys(refHaul[item][0])" :key="Object.keys(refHaul[item][0]).indexOf(subItem)">
                    <!-- checkbox for each sub level attribute within an array -->
                    <q-checkbox dense :label="subItem" v-model="selection" :val="item + '[0].' + subItem"></q-checkbox>
                    <!-- if the value of the sub level attribute is an object -->
                    <div v-if="typeof refHaul[item][0][subItem] === 'object' && !Array.isArray(refHaul[item][0][subItem])" style="margin-left: 10px">
                        <!-- iterate through keys of sub level object -->
                        <span v-for="subSubItem of Object.keys(refHaul[item][0][subItem])" :key="Object.keys(refHaul[item][0][subItem]).indexOf(subSubItem)">
                            <!-- checkbox for each key of the sub sub level object -->
                            <q-checkbox dense :label="subSubItem" v-model="selection" :val="item + '[0].' + subItem + '.' + subSubItem"></q-checkbox>
                            <div v-if="Array.isArray(refHaul[item][0][subItem][subSubItem])" style="margin-left: 10px">
                                <!-- handle lat lon array -->
                                <q-checkbox dense label="lat" :val="item + '[0].' + subItem + '.' + subSubItem + '[0]'" v-model="selection"></q-checkbox>
                                <q-checkbox dense label="lon" :val="item + '[0].' + subItem + '.' + subSubItem + '[1]'" v-model="selection"></q-checkbox>
                            </div>
                        </span>
                    </div>
                    <!-- if the value of the sub level attribute is an array -->
                    <div v-if="Array.isArray(refHaul[item][0][subItem])" style="margin-left: 10px">
                        <!-- checkbox for each key of the sub sub level object  -->
                        <q-checkbox dense v-for="subSubItem of Object.keys(refHaul[item][0][subItem][0])" :key="Object.keys(refHaul[item][0][subItem][0]).indexOf(subSubItem)" :label="subSubItem" v-model="selection" :val="item + '.' + subItem + '.' + subSubItem"></q-checkbox>
                    </div>
                </div>
            </div>
            <!-- if value of top level attribute is object -->
            <div v-if="(!Array.isArray(refHaul[item]) && typeof refHaul[item] === 'object')" style="margin-left: 10px">
                <!-- iterate though the sub level atttributes -->
                <div v-for="subItem of Object.keys(refHaul[item])" :key="Object.keys(refHaul[item]).indexOf(subItem)">
                    <!-- checkbox for each key of the sub level attribute -->
                    <q-checkbox dense :label="subItem" v-model="selection" :val="item + '.' + subItem"></q-checkbox>
                    <div v-if="(!Array.isArray(refHaul[item]) && typeof refHaul[item][subItem] === 'object')" style="margin-left: 10px">
                        <q-checkbox dense v-for="subSubItem of Object.keys(refHaul[item][subItem])" :key="Object.keys(refHaul[item][subItem]).indexOf(subSubItem)" :label="subSubItem" v-model="selection" :val="item + '.' + subItem + '.' + subSubItem"></q-checkbox>
                    </div>
                </div>
            </div>

        </div>
        </div>

        <div>
            <div v-for="haul of hauls" :key="hauls.indexOf(haul)">
                <span v-for="(item, i) of selection" :key="i">
                    {{ getValue(haul, item) }}
                </span>
            </div>

            <!-- <div>
                {{ hauls[0].catches.map( (thing)=> thing.catchContent.members[0] ) }}
            </div> -->

            <q-table :data="hauls" :columns="getCols" :pagination="pagination">

            </q-table>

            <!-- <pDataTable v-if="hauls.length > 0" :value="hauls[0].catches" :resizableColumns="true" columnResizeMode="fit">
                <pColumn field="catchNum" header="Catch Num"></pColumn>
                <pColumn field="catchContent.code" header="Code"></pColumn>
                <pColumn field="catchContent.name" header="Name"></pColumn>
                <pColumn field="disposition.description" header="Disposition"></pColumn>
                <pColumn field="weightMethod.description" header="Weight Method"></pColumn>
                <pColumn field="weight.value" header="Weight"></pColumn>
            </pDataTable> -->

            <!-- {{ hauls[0].catches }} -->

        </div>


        <!-- {{ hauls[0] }} -->


        <!-- {{ refHaul.catches[4].children }} -->

        <!-- <div>
            {{ gearType }}
        </div>
        <div>
            {{ locations }}
        </div> -->

        <!-- {{ hauls }} -->
        </div>


    </div>
</template>

<script lang='ts'>

// import { mapState } from 'vuex';
import { State, Action, Getter, Mutation } from 'vuex-class';
import { AlertState } from '../_store/types/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { WcgopTrip } from '@boatnet/bn-models';

import { AuthState, authService } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import axios from 'axios';
import FP from 'lodash';
import _ from 'lodash';

import DataTable from 'primevue/datatable';
Vue.component('pDataTable', DataTable);

import Column from 'primevue/column';
Vue.component('pColumn', Column);

@Component
export default class ViewHauls extends Vue {

    private selection = [];

    private refHaul: any = {
    };
    private paths = [];

    private hauls: any[] = [];
    private pagination = {
        rowsPerPage: 50
    };

    private haulDef = {
        _id: 'string' ,
        _rev: 'string',
        type: 'string',
        createdBy: 'string',
        createdDate: 'string',
        uploadedBy: 'string',
        uploadedDate: 'string',
        operationNum: 'number',
        locations: [
            {
                type: 'string',
                coordinates: [
                    {
                        lat: 'number',
                        lon: 'number'
                    }
                ],
                depth: {
                    measurementType: 'string',
                    value: 'number',
                    units: 'string'
                },
                position: 'string',
                locationDate: 'string',
                _id: 'string',
                createdBy: 'string',
                createdDate: 'string',
                updatedBy: 'string',
                updatedDate: 'string'
            }
        ],
        gearType: {
            description: 'string',
            id: 'string'
        },
        gearPerformance: {
            description: 'string',
            id: 'string'
        },
        isEfpUsed: 'boolean',
        isDataQualityPassing: 'boolean'
    };

        private old = [
        'locations.[type,coordinates[ lat, lon], depth {measurementType, value, units}, position, locationDate, _id, type, createdBy, createdDate, updatedBy, updatedDate, legacy {fishingLocationId, fishingActivityId}]',
        'observerTotalCatch {measurement {measurementType, value, units} , weightMethod {description, _id}}',
        'gearType {description, id}',
        'gearPerformance {description, id}',
        'isEfpUsed',
        'isDataQualityPassing',
        {'catches[]': [
            'type',
            {catchContent: [
                '_id',
                '_rev',
                'type',
                'createdBy',
                'createdDate',
                'uploadedBy',
                'uploadedDate',
                'code',
                'name',
                {'members[]': [
                    '_id',
                    '_rev',
                    'type',
                    'createdBy',
                    'uploadedBy',
                    {taxonomy: [
                        '_id',
                        '_rev',
                        'type',
                        'taxonomyId',
                        'level',
                        'taxonomyName',
                        'scientificName',
                        'parent',
                        'itisTSN',
                        {legacy: [
                            'wcgopSpeciesId',
                            'ashopSpeciesId',
                            'dwId[]'
                        ]},
                        'pacfinSpeciesCode'
                        ]},
                    'alias',
                    'aliasType',
                    'isAshop',
                    'isWcgop',
                    'isHakeSurvey',
                    'isHookAndLineSurvey',
                    'isTrawlSurvey'
                ]},
                'definition',
                {legacy: [
                    'wcgopCatchCategoryCode',
                    'wcgopCatchCategoryId'
                    ]},
                {'children[]': [
                    '_id',
                    'type',
                    {catchContent: [
                    ]}
                ]}
            ]},
            'createdBy',
            'createdDate',
            'uploadedBy',
            'uploadedDate',
            'catchNum',
            {disposition: ['description', '_id'] },
            {weightMethod: ['description', '_id']},
            {weight: ['measurementType', 'value', 'units']},
            {legacy: [
                'catchId',
                'catchCategoryId',
                'catchCategoryName',
                'catchCategoryCode',
                'catchPurity'
                ]}
        ]}
    ];

    private get getCols() {
        const cols: any[] = [];
        for (const sel of this.selection) {
            cols.push(
                {
                name: sel,
                label: sel,
                field: sel,
                align: 'left',
                sortable: true
                }
            );
        }
        return cols;
    }

    private getValue(object: any, item: any) {
        console.log(object, item);
        // if (item.indexOf('[0]') !== -1) {
        //     let returnVal = '';
        //     const arrayLength = this.refHaul[item.split('[0]')[0]].length;

        //     for (const arrayItem in this.refHaul[item.split('[0]')[0]]) {
        //         console.log(arrayItem)
        //         returnVal += _.get(this.refHaul, arrayItem.replace('[0]', '[' + arrayItem + ']'))
        //     }
        // } else {
        return _.get(object, item);
        // }
    }

    private async getRefHaul() {
        const ref = await couchService.masterDB.get('74c40bfdb8408b32113dd1a8c6780e13');
        this.refHaul = ref;
    }

    private async getHauls() {
        const masterDB: Client<any> = couchService.masterDB;
        const options = {
            include_docs: true,
            limit: 10
        };

        const docs = await masterDB.viewWithDocs<any>(
            'MainDocs',
             'all-operations',
            options
        );

        this.hauls = docs.rows.map( (row) => row.doc );
    }

    private get locations() {
        return _.get(this.refHaul, 'locations[0]location.coordinates');
    }

    private get gearType() {
        return _.get(this.refHaul, 'gearType.description');
    }

    private get flatKeys() {

        /* rework this to return structure like:
        paths = [
            _id
            locations: [location: (attr1, attr2, etc)]
            gearType:: (attr1, attr2, etc)
        ]

        */

        const paths: any = [];
        let path = '';
        for (const myKey of Object.keys(this.refHaul)) {
            path = myKey;

            if (FP.isArray(this.refHaul[myKey]) && typeof this.refHaul[myKey][0] === 'object') {
                path += '[';
                for (const subKey of Object.keys(this.refHaul[myKey][0])) {
                    if (FP.isPlainObject(this.refHaul[myKey][0][subKey])) {
                        path += subKey + '.';
                        for (const subSubKey of Object.keys(this.refHaul[myKey][0][subKey])) {
                            path += subSubKey + ', ';
                        }
                        path += ', ';
                    } else {
                        path += subKey + ', ';
                    }
                }
                path += ']';
                paths.push(path);
            } else if (FP.isPlainObject(this.refHaul[myKey])) {
                path = myKey + '(';
                for (const subKey of Object.keys(this.refHaul[myKey])) {
                    path += subKey;
                    if (Object.keys(this.refHaul[myKey]).indexOf(subKey) !== Object.keys(this.refHaul[myKey]).length) {
                        path += ', ';
                    }
                }
                path += ')';
                paths.push(path);
            } else {
                paths.push(myKey);
            }
        }

        return paths;
    }


    private created() {
        this.getRefHaul();
        this.getHauls().then( () => {
            console.log(this.hauls[0]);
        });
    }

}

</script>