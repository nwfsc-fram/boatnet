<template>
    <div class="q-pa-md q-gutter-md relative-position" style="min-height: 200px">
        <br>
        <b style="font-size: 1.5em">Trip #: {{ trip.tripNum }}, Vessel Name: {{ trip.vesselName }}, Vessel Number: {{ trip.vesselNumber }} Source: {{ trip.source }}</b>
        <q-inner-loading :showing="transferring">
            <q-spinner-radio color="primary" size="3em"/>
        </q-inner-loading>

        <q-table
        v-if="!transferring"
        :data="revisionHistory"
        :columns="columns"
        dense
        row-key="id"
        selection="single"
        :selected.sync="selected"
        :pagination.sync="pagination"
        binary-state-sort
        style="table-layout: fixed"
        >
        <template v-slot:header="props">
            <q-tr :props="props">
                <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                >
                    {{ col.label }}
                <q-input dense outlined @input="searchBy" v-model="searchString[col.field]"></q-input>
                </q-th>
            </q-tr>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props">
                <q-td key="revNum" :props="props">{{ props.row.revNum }}</q-td>
                <q-td key="haulNum" :props="props">{{ props.row.haulNum }}</q-td>
                <q-td key="catchIndex" :props="props">{{ props.row.catchIndex }}</q-td>
                <q-td key="level" :props="props">{{ props.row.level }}</q-td>
                <q-td key="species" :props="props" >{{ props.row.species }}</q-td>
                <q-td key="field" :props="props" >{{ props.row.field }}</q-td>
                <q-td key="oldVal" :props="props" >{{ props.row.oldVal }}</q-td>
                <q-td key="newVal" :props="props" >{{ props.row.newVal }}</q-td>
                <q-td key="updatedDate" :props="props" >{{ formatDate(props.row.updatedDate) }}</q-td>
                <q-td key="updatedBy" :props="props" >{{ props.row.updatedBy }}</q-td>
            </q-tr>
        </template>
        </q-table>
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
import {intersection, union, omit, isEqual, reduce, keys, flattenDeep, differenceWith, get, filter as Lfilter, cloneDeep } from 'lodash';
import { authService } from '@boatnet/bn-auth';
import { Catches } from '@boatnet/bn-models';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
    props: {
        id: String,
    },
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const masterDB: Client<any> = couchService.masterDB;
        const columns: any = [
            {name: 'revNum', label: 'Revision #', field: 'revNum', required: false, align: 'left', sortable: true, style: 'max-width: 80px', headerStyle: 'max-width: 80px'},
            {name: 'haulNum', label: 'Haul #', field: 'haulNum', required: false, align: 'left', sortable: true, style: 'max-width: 80px', headerStyle: 'max-width: 80px'},
            {name: 'catchIndex', label: 'Catch Index', field: 'catchIndex', required: false, align: 'left', sortable: true, style: 'max-width: 80px', headerStyle: 'max-width: 80px'},
            {name: 'level', label: 'Level', field: 'level', required: false, align: 'left', sortable: true, style: 'max-width: 50px', headerStyle: 'max-width: 50px'},
            {name: 'species', label: 'Species', field: 'species', required: false, align: 'left', sortable: true, style: 'max-width: 160px', headerStyle: 'max-width: 160px'},
            {name: 'field', label: 'Field', field: 'field', required: false, align: 'left', sortable: true, style: 'max-width: 120px', headerStyle: 'max-width: 120px'},
            {name: 'oldVal', label: 'Old Value', field: 'oldVal', required: false, align: 'left', sortable: true, style: 'max-width: 300px', headerStyle: 'max-width: 300px'},
            {name: 'newVal', label: 'New Value', field: 'newVal', required: false, align: 'left', sortable: true, style: 'max-width: 300px', headerStyle: 'max-width: 300px'},
            {name: 'updatedDate', label: 'Updated Date', field: 'updatedDate', required: false, align: 'left', sortable: true, style: 'max-width: 150px', headerStyle: 'max-width: 150px'},
            {name: 'updatedBy', label: 'Updated By', field: 'updatedBy', required: false, align: 'left', sortable: true, style: 'max-width: 100px', headerStyle: 'max-width: 100px'},
        ];

        const searchBy = () => {
            revisionHistory.value = cloneDeep(allRevisionHistory.value);
            for (const key of Object.keys(searchString.value)) {
                if (searchString.value[key] !== '') {
                    const needle = searchString.value[key].toString().toLowerCase();
                    revisionHistory.value = Lfilter(revisionHistory.value, (object) => {
                        if (object[key]) {
                            return object[key].toString().toLowerCase().indexOf(needle) > -1;
                        }
                    });
                }
            }
        };

        const searchString: any = ref({});

        const id: any = props.id;
        const trip: any = ref({});
        const revisionHistory: any = ref([]);
        const allRevisionHistory: any = ref([]);
        const selected: any = [];
        const pagination = {sortBy: 'revNum', descending: true, rowsPerPage: 100};
        const transferring: any = ref(false);

        const getRevisionHistory = async () => {
            allRevisionHistory.value.length = 0;
            revisionHistory.value.length = 0;
            transferring.value = true;
            trip.value = await masterDB.get(id);
            trip.value.history.push(omit(trip.value, ['history']));
            const ignoreKeys = ['changeLog', 'value', '_rev', '_id', 'updatedBy', 'updatedDate', 'errors', 'history', 'hauls', 'catch', 'updateDate', 'revision', 'resubmission', 'createdBy'];
            for (const version of trip.value.history) {
                if (trip.value.history.indexOf(version) !== (trip.value.history.length - 1)) {
                    const nextVersion = trip.value.history[trip.value.history.indexOf(version) + 1];
                    let allKeys: any = union(keys(version), keys(nextVersion));
                    allKeys = allKeys.filter( (row: any) => {
                        return !ignoreKeys.includes(row);
                    });
                    for (const key of allKeys) {
                        if (!isEqual(version[key], nextVersion[key])) {
                            revisionHistory.value.push(
                                {
                                    revNum: nextVersion.revision,
                                    level: 'trip',
                                    field: key,
                                    oldVal: version[key],
                                    newVal: nextVersion[key],
                                    updatedDate: nextVersion.updatedDate,
                                    updatedBy: nextVersion.updatedBy,
                                    id: nextVersion._rev,
                                }
                            );
                        }
                    }
                    const maxHaulLength = version.hauls.length > nextVersion.hauls.length ? version.hauls.length : nextVersion.hauls.length;
                    const haulKeys = [
                        'haulNum',
                        'gear',
                        'netType',
                        'codendCapacity',
                        'isCodendLost',
                        'gearPerSet',
                        'avgHooksPerSeg',
                        'startDateTime',
                        'startDepth',
                        'startLatitude',
                        'startLongitude',
                        'endDateTime',
                        'endDepth',
                        'endLatitude',
                        'endLongitude',
                        'comments',
                        'targetStrategy',
                        'systemPerformance',
                        'catchHandlingPerformance'
                    ];
                    for (let i = 0; i < maxHaulLength; i++) {
                        if (version.hauls[i] && nextVersion.hauls[i]) {
                            for (const haulKey of haulKeys) {
                                if (!isEqual(version.hauls[i][haulKey], nextVersion.hauls[i][haulKey])) {
                                    revisionHistory.value.push(
                                        {
                                            revNum: nextVersion.revision,
                                            haulNum: nextVersion.hauls[i].haulNum,
                                            level: 'haul',
                                            field: haulKey,
                                            oldVal: version.hauls[i][haulKey],
                                            newVal: nextVersion.hauls[i][haulKey],
                                            updatedDate: nextVersion.updatedDate,
                                            updatedBy: nextVersion.updatedBy,
                                            id: nextVersion._rev,
                                        }
                                    );
                                }
                            }
                            const maxCatchLength = version.hauls[i].catch && nextVersion.hauls[i].catch ?
                                                        (version.hauls[i].catch.length > nextVersion.hauls[i].catch.length ? version.hauls[i].catch.length : nextVersion.hauls[i].catch.length) :
                                                        (version.hauls[i].catch ? version.hauls[i].catch.length : nextVersion.hauls[i].catch.length);
                            const catchKeys = [
                                'catchId',
                                'disposition',
                                'fate',
                                'speciesCode',
                                'speciesWeight',
                                'speciesCount',
                                'speciesLength',
                                'timeOnDeck',
                                'comments',
                                'isWcgopEmPriority',
                                'isProtected'
                            ];
                            for (let j = 0; j < maxCatchLength; j++) {
                                if (version.hauls[i].catch[j] && nextVersion.hauls[i].catch[j]) {
                                    for (const catchKey of catchKeys) {
                                        if (!isEqual(version.hauls[i].catch[j][catchKey], nextVersion.hauls[i].catch[j][catchKey])) {
                                            revisionHistory.value.push(
                                                {
                                                    revNum: nextVersion.revision,
                                                    haulNum: nextVersion.hauls[i].haulNum,
                                                    catchIndex: j,
                                                    level: 'catch',
                                                    species: getSpeciesName(version.hauls[i].catch[j].speciesCode),
                                                    field: catchKey,
                                                    oldVal: version.hauls[i].catch[j][catchKey],
                                                    newVal: nextVersion.hauls[i].catch[j][catchKey],
                                                    updatedDate: nextVersion.updatedDate,
                                                    updatedBy: nextVersion.updatedBy,
                                                    id: nextVersion._rev,
                                                }
                                            );
                                        }
                                    }
                                } else if (version.hauls[i].catch[j] && !nextVersion.hauls[i].catch[j]) {
                                    revisionHistory.value.push(
                                        {
                                            revNum: nextVersion.revision,
                                            haulNum: nextVersion.hauls[i].haulNum,
                                            catchIndex: j,
                                            level: 'catch',
                                            field: 'catch removed from haul',
                                            oldVal: version.hauls[i].catch[j],
                                            newVal: '-',
                                            updatedDate: nextVersion.updatedDate,
                                            updatedBy: nextVersion.updatedBy,
                                            id: nextVersion._rev,
                                        }
                                    );
                                } else if (!version.hauls[i].catch[j] && nextVersion.hauls[i].catch[j]) {
                                    revisionHistory.value.push(
                                        {
                                            revNum: nextVersion.revision,
                                            haulNum: nextVersion.hauls[i].haulNum,
                                            catchIndex: j,
                                            level: 'catch',
                                            field: 'catch added to haul',
                                            oldVal: '-',
                                            newVal: nextVersion.hauls[i].catch[j],
                                            updatedDate: nextVersion.updatedDate,
                                            updatedBy: nextVersion.updatedBy,
                                            id: nextVersion._rev,
                                        }
                                    );
                                }
                            }

                        } else if (version.hauls[i] && !nextVersion.hauls[i]) {
                            revisionHistory.value.push(
                                {
                                    revNum: nextVersion.revision,
                                    haulNum: version.hauls[i].haulNum,
                                    level: 'haul',
                                    field: 'haul removed',
                                    oldVal: version.hauls[i],
                                    newVal: '-',
                                    updatedDate: nextVersion.updatedDate,
                                    updatedBy: nextVersion.updatedBy,
                                    id: nextVersion._rev,
                                }
                            );
                        } else if (!version.hauls[i] && nextVersion.hauls[i]) {
                            revisionHistory.value.push(
                                {
                                    revNum: nextVersion.revision,
                                    haulNum: nextVersion.hauls[i].haulNum,
                                    level: 'haul',
                                    field: 'haul added',
                                    oldVal: '-',
                                    newVal: nextVersion.hauls[i],
                                    updatedDate: nextVersion.updatedDate,
                                    updatedBy: nextVersion.updatedBy,
                                    id: nextVersion._rev,
                                }
                            );
                        }

                    }

                }
            }
            allRevisionHistory.value = cloneDeep(revisionHistory.value);
            transferring.value = false;
        };

        let speciesNames: any = [];

        const getSpeciesNames = async () => {
            transferring.value = true;
            const speciesNamesQuery = await masterDB.view('em-views', 'wcgopCode-to-pacfinCode-map', {include_docs: true} as any);
            speciesNames = speciesNamesQuery.rows.map((row: any) => row.doc);
            transferring.value = false;
        };

        const getSpeciesName = (speciesCode: any) => {
            const speciesLookup: any = speciesNames.find( (row: any) => {
                return row.pacfinSpeciesCode === speciesCode || parseInt(row.wcgopSpeciesCode, 10) === speciesCode;
            });
            if (speciesLookup.type === 'catch-grouping') {
                return speciesLookup.name + ' (' + speciesCode + ')';
            } else {
                return speciesLookup.commonNames[0] + ' (' + speciesCode + ')';
            }
        };

        const formatDate = (date: any) => {
            return moment(date).format('MM/DD/YYYY, HH:mm');
        };

        onMounted( async () => {
            await getSpeciesNames();
            await getRevisionHistory();
        });

        return {
            revisionHistory, columns, selected, pagination, transferring, trip, getSpeciesName, searchBy, searchString, formatDate
        };

    }

});

</script>

<style scoped>
.red {
  color: red;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: rgb(238, 238, 238);
}

* >>> .q-td {
    white-space: pre-wrap !important; /* css-3 */
    white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
    white-space: -pre-wrap !important; /* Opera 4-6 */
    white-space: -o-pre-wrap !important; /* Opera 7 */
    word-wrap: break-word !important; /* Internet Explorer 5.5+ */
}

</style>