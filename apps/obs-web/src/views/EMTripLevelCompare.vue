<template>
    <div class='q-pa-md  q-gutter-md'>
        <div class="text-h6">Trip {{ apiTrip.tripNum }} - {{ apiTrip.vesselName }} ({{ apiTrip.vesselId }}) - Trip Level Comparison</div>

        <q-table
            :data="tripData"
            :columns="columns"
            dense
            row-key="species"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="pagination"
            class="bg-blue-grey-1"
            binary-state-sort
            hide-bottom
        >

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="_id"></q-td>
                    <q-td key="species" :props="props">{{ props.row.species }}</q-td>
                    <q-td key="logbookDiscard" :props="props">{{ props.row.logbookDiscard }}</q-td>
                    <q-td key="logbookRetained" :props="props">{{ props.row.logbookRetained ? props.row.logbookRetained : 0 }}</q-td>
                    <q-td key="thirdPartyReview" :props="props">{{ props.row.thirdPartyReview }}</q-td>
                    <q-td key="diffReviewLogbook" :props="props" :class="getClass(props.row.diffReviewLogbook)">{{ props.row.diffReviewLogbook }} </q-td>
                    <q-td key="audit" :props="props">{{ props.row.audit }} </q-td>
                    <q-td key="diffAuditReview" :props="props" :class="getClass(props.row.diffAuditReview)">{{ props.row.diffAuditReview }}</q-td>
                </q-tr>
            </template>

        </q-table>
    </div>
</template>

<script lang="ts">

import { createComponent, ref, reactive, computed, watch, onBeforeUnmount, onMounted } from '@vue/composition-api';

export default createComponent({
    setup(props, context) {
        const columns: any = [
            {name: 'species', label: 'Species', field: 'species', required: false, align: 'left', sortable: true },
            {name: 'logbookDiscard', label: 'Logbook Discard (lbs)', field: 'logbookDiscard', required: false, align: 'left', sortable: true },
            {name: 'logbookRetained', label: 'Logbook Retained (lbs)', field: 'logbookRetained', required: false, align: 'left', sortable: true },
            {name: 'thirdPartyReview', label: 'Third Party Review (lbs)', field: 'thirdPartyReview', required: false, align: 'left', sortable: true },
            {name: 'diffReviewLogbook', label: 'Diff Review Logbook', field: 'diffReviewLogbook', required: false, align: 'left', sortable: true },
            {name: 'audit', label: 'NWFSC Audit Discard (lbs)', field: 'audit', required: false, align: 'left', sortable: true },
            {name: 'diffAuditReview', label: 'Diff Audit Review', field: 'diffAuditReview', required: false, align: 'left', sortable: true },
        ];
        const apiTrip: any = {
                        "_id": "77fd968d63e9b5c90a434aa5cd2afb30",
                        "_rev": "1-a74f82244ea465bf1f50ed4f570e9768",
                        "vesselId": "CF9490UV",
                        "vesselName": "Boaty McBoatFace",
                        "departurePort": "seattle",
                        "departureDate": "2019-11-15T04:46:45.623Z",
                        "returnPort": "seattle",
                        "returnDate": "2019-11-15T04:46:45.623Z",
                        "permits": [
                            "GF99999"
                        ],
                        "fisheries": [
                            "EM EFP"
                        ],
                        "type": "trips-api",
                        "tripNum": 100002
                        };
        const apiCatch = [
                        {
                            "_id": "6ec983c88220cad5c56c5a94a3d29f28",
                            "_rev": "2-f322bdfda33c70a5cc5e8a8df0884fc0",
                            "tripNum": 100002,
                            "source": "thirdParty",
                            "hauls": [
                                {
                                "haulNum": 1,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 100
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 544
                                    }
                                ]
                                },
                                {
                                "haulNum": 2,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 324
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 544
                                    }
                                ]
                                },
                                {
                                "haulNum": 3,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 324
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 544
                                    }
                                ]
                                }
                                ],
                                "type": "trips-api-catch"
                            },
                       {
                            "_id": "6ec983c88220cad5c56c5a94a3d29f28",
                            "_rev": "2-f322bdfda33c70a5cc5e8a8df0884fc0",
                            "tripNum": 100002,
                            "source": "logbook",
                            "hauls": [
                                {
                                "haulNum": 1,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 224
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 354
                                    }
                                ]
                                },
                                {
                                "haulNum": 2,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 214
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 500,
                                    "retained": 20000
                                    }
                                ]
                                },
                                {
                                "haulNum": 3,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 300
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 480
                                    }
                                ]
                                }
                                ],
                                "type": "trips-api-catch"
                            },
                       {
                            "_id": "6ec983c88220cad5c56c5a94a3d29f28",
                            "_rev": "2-f322bdfda33c70a5cc5e8a8df0884fc0",
                            "tripNum": 100002,
                            "source": "nwfscAudit",
                            "hauls": [
                                {
                                "haulNum": 1,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 140
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 540
                                    }
                                ]
                                },
                                {
                                "haulNum": 2,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 240
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 540
                                    }
                                ]
                                },
                                {
                                "haulNum": 3,
                                "date": "2019-11-15T04:46:45.623Z",
                                "setTime": "T04:46:45.623Z",
                                "setLoc": "41.40338, 2.17403",
                                "upTime": "T04:46:45.623Z",
                                "upLoc": "41.40338, 2.17403",
                                "targetStrategy": "PCHK",
                                "catch": [
                                    {
                                    "speciesName": "canary rockfish",
                                    "discard": 330
                                    },
                                    {
                                    "speciesName": "pacific halibut",
                                    "discard": 543
                                    }
                                ]
                                }
                                ],
                                "type": "trips-api-catch"
                            }
        ]
        const pagination = {
            sortBy: 'name',
            descending: false,
            page: 1,
            rowsPerPage: 20,
            rowsNumber: 10
            };
        const selected: any = [];
        const tripTotals: any = {};
        const tripData: any = [];

        const getTripData = () => {
            for (const source of apiCatch) {
                for (const haul of source.hauls) {
                    for (const species of haul.catch) {
                            if (!tripTotals[species.speciesName]) {tripTotals[species.speciesName] = {}};
                            if (!tripTotals[species.speciesName][source.source]) {tripTotals[species.speciesName][source.source] = {}};
                            if (!tripTotals[species.speciesName][source.source]['discard']) {tripTotals[species.speciesName][source.source]['discard'] = 0};
                            if (!tripTotals[species.speciesName][source.source]['retained']) {tripTotals[species.speciesName][source.source]['retained'] = 0};
                            tripTotals[species.speciesName][source.source]['discard'] += species.discard;
                            if (source.source === 'logbook') { tripTotals[species.speciesName][source.source]['retained'] += species.retained ? species.retained : 0 }
                    }
                }
            }
            console.log(tripTotals);
            for (const key of Object.keys(tripTotals)) {
                tripData.push(
                    {
                        species: key,
                        logbookDiscard: tripTotals[key]['logbook']['discard'],
                        logbookRetained: tripTotals[key]['logbook']['retained'] ? tripTotals[key]['logbook']['retained']  : 0,
                        thirdPartyReview: tripTotals[key]['thirdParty']['discard'],
                        diffReviewLogbook: getPercentDifference(tripTotals[key]['thirdParty']['discard'], tripTotals[key]['logbook']['discard']),
                        audit: tripTotals[key]['nwfscAudit']['discard'],
                        diffAuditReview: getPercentDifference(tripTotals[key]['nwfscAudit']['discard'], tripTotals[key]['thirdParty']['discard'])
                    }
                )

            }
            console.log(tripData);
        }

        const getPercentDifference = (val1: number, val2: number) => {
            return ((val1 - val2) / ((val1 + val2) / 2) *100).toFixed(2) + '%';
        }

        const getClass = (val: any) => {
            if (parseInt(val.split('.')[0]) > 10) {
                return 'red'
            }

        }

        onMounted(() => {
            getTripData();
        })

        return {
            apiTrip, columns, pagination, selected, tripData, getPercentDifference, getClass
        };


    }
});

</script>

</script>

<style>
.red {
    color: red;
    font-weight: bold;
}

</style>
