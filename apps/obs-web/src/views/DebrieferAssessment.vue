<template>
    <div>
        <div v-if="assessment">
            <q-card class="assessment-section" v-if="debriefer.program === 'wcgop'">
                <q-card-section>
                    <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;" class="text-primary">Fishing Effort:</p>
                    <div>
                        Vessels: <b>{{ uniqueVessels }}</b>&nbsp;
                        Trips: <b>{{ debriefer.trips.length }}</b>&nbsp;
                        Hauls: <b>{{ totalHauls }}</b>&nbsp;
                        Programs:<b> {{ getArrayValues(observedPrograms) }} </b>&nbsp;
                        Fisheries:<b> {{ getArrayValues(observevedFisheries) }} </b>
                    </div>
                </q-card-section>
            </q-card>
            <span v-for="section of sections" :key="sections.indexOf(section)">
                <q-card
                    class="assessment-section"
                    v-if="
                        (section !== 'Requirements for Return (Exit/Year-end only)')
                    || (section === 'Requirements for Return (Exit/Year-end only)' && ['Exit Debrief', 'Year-end Debrief'].includes(debriefer.evaluationPeriod.type))"
                >
                    <q-card-section>
                        <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;" class="text-primary">{{section}}
                            <span style="float: right" v-if="!['Requirements for Return (Exit/Year-end only)', 'Summary'].includes(section)">
                                <q-btn v-if="!observerMode" size="sm" color="primary" icon="check" round @click="setAllOk(section)"></q-btn>&nbsp;
                                <q-btn v-if="!observerMode" size="sm" color="primary" icon="clear" round @click="setAllNull(section)"></q-btn>
                            </span>
                        </p>
                        <div v-for="(assessmentResponse, i) of assessment.assessmentResponses" :key="i">
                            <div v-if="assessmentResponse.question.section === section" >
                                <div v-if="section === 'OTC Sampling Procedures' && samplingProcedures.includes(assessmentResponse.question.question.slice(assessmentResponse.question.question.indexOf('-') + 2 ).toLowerCase()) ||
                                        section === 'Weight Methods' && (isNaN(assessmentResponse.question.question.charAt(0)) || weightMethods.includes(assessmentResponse.question.question.slice(assessmentResponse.question.question.indexOf('-') + 2 ).toLowerCase())) ||
                                        !['OTC Sampling Procedures', 'Weight Methods'].includes(section)" class="row">
                                    <span class="col5" style="position: relative; top: 10px; max-width: 800px;">{{ assessmentResponse.question.question }}&nbsp; &nbsp;</span>
                                    <div class="col">
                                        <q-input
                                            v-model="assessmentResponse.response"
                                            autogrow dense
                                            :readonly="observerMode || assessment.status === 'Receipt Acknowledged'"
                                            debounce="1000"
                                        >
                                            <q-menu v-if="!observerMode && getAnswerSet(assessmentResponse.question.answerSet).length" anchor="top left" style="cursor: pointer">
                                                <q-list dense >
                                                    <q-item
                                                        v-for="answer of getAnswerSet(assessmentResponse.question.answerSet)"
                                                        :key="getAnswerSet(assessmentResponse.question.answerSet).indexOf(answer)"
                                                        clickable
                                                        @click="setQuestionResponse(i, answer)"
                                                        v-close-popup
                                                        style="max-width: 500px">
                                                        <q-item-section>{{ answer }}</q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-menu>
                                            <template v-slot:append>
                                                <q-btn
                                                    v-if="assessment.assessmentResponses[i].response && !observerMode"
                                                    icon="clear" size="xs" flat round
                                                    @click="setQuestionResponse(i, null)"
                                                ></q-btn>
                                            </template>
                                        </q-input>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </span>
            <div style="float: right; margin: 5px">
                <b>Assessment Status: {{ assessment.status ? assessment.status : 'none' }} &nbsp;</b>
                <span v-if="!observerMode">
                    <q-btn v-if="['Finalized', 'Receipt Acknowledged'].includes(assessment.status)" color="red" @click="unlockAssessment">unlock assessment</q-btn>
                    <q-btn v-else @click="finalize" color="primary">Finalize Assessment</q-btn>
                </span>
                <span v-else>
                    <q-btn v-if="assessment.status === 'Finalized'" @click="acknowledgeReceipt" color="primary">Acknowledge Receipt</q-btn>
                </span>
            </div>
        </div>
        <div v-else>
            <span v-if="observerMode">
                <span v-if="debriefer.program === 'wcgop'">
                    Please select an evaluation period.
                </span>
                <span v-else>
                    Please select a cruise.
                </span>
            </span>
            <span v-else>
                <span v-if="debriefer.program === 'wcgop'">
                    Please select an observer and evaluation period.
                </span>
                <span v-else>
                    Please select a cruise.
                </span>
            </span>
        </div>
        <q-btn color="primary" @click="exportPdf" style="margin-top: 5px">export pdf</q-btn>
    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  onMounted,
  watch,
  set
} from '@vue/composition-api';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { orderBy, uniq, flatten, sortBy } from 'lodash';
import moment from 'moment';
import { authService } from '@boatnet/bn-auth';
import axios from 'axios';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


export default createComponent({
  props: {
    infoTab: Boolean,
    isFullSize: Boolean,
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const debriefer = state.debriefer;
    const uniqueVessels: any = ref(0);
    const observedPrograms: any = ref([]);
    const observevedFisheries: any = ref([]);
    const totalHauls: any = ref(0);

    const questions: any = ref([]);
    const answerSets: any = ref([]);

    const samplingProcedures: any = ref([]);
    const weightMethods: any = ref([]);

    const jp = require('jsonpath');

    const getTripProcedures: any = async () => {
        let operationIDs = jp.query(debriefer.trips, '$..operationIDs');
        operationIDs = flatten(operationIDs);
        const operations = await masterDB.view(
            'wcgop',
            'all-operations',
            {include_docs: true, keys: operationIDs} as any
        );
        const operationDocs = operations.rows.map( (row: any) => row.doc );
        samplingProcedures.value = jp.query(operationDocs, '$..observerTotalCatch.weightMethod.description');
        samplingProcedures.value = uniq(samplingProcedures.value.map( (row: any) => row.toLowerCase().trim() ));
        if (samplingProcedures.value.find( (row: any) => row === 'extrapolation (ll)' )) {
            samplingProcedures.value.push('extrapolation');
        }

        weightMethods.value = jp.query(operationDocs, '$..catches[*].weightMethod.description');
        weightMethods.value = uniq(weightMethods.value.map( (row: any) => row.toLowerCase().trim() ));
        if (weightMethods.value.find( (row: any) => row === 'length/weight' )) {
            weightMethods.value.push('phlb l/w conversion');
        }
        if (weightMethods.value.find( (row: any) => row === 'extrapolation (ll)' )) {
            weightMethods.value.push('extrapolation');
        }
        if (weightMethods.value.find( (row: any) => row === 'phlb length weight extrapolation' )) {
            weightMethods.value.push('phlb l/w extrapolation');
        }
        if (weightMethods.value.find( (row: any) => row === 'actual weight  - whole haul' )) {
            weightMethods.value.push('actual weight - whole haul');
        }
    };

    const observerMode = !state.user.userRoles.includes('debriefer') || state.user.observerMode;

    const sections: any = ref([]);
    const getSections = async () => {
          const result: any = await masterDB.view(
            'obs_web',
            'assessment-sections',
            {include_docs: true, key: debriefer.program} as any
          );
          sections.value = result.rows[0].doc.sections;
    };

    const assessment: any = ref(null);

    const getAnswerSet = (setName: string) => {
        const answerSet = answerSets.value.find( (row: any) => row.name === setName );
        return answerSet ? answerSet.options : [];
    };

    const getQuestions = async () => {
        questions.value.length = 0;
        const questionsQuery: any = await masterDB.view(
            'obs_web',
            'assessment-question',
            {include_docs: true, reduce: false} as any
        );
        const queryDocs = questionsQuery.rows.map( (row: any) => row.doc);
        questions.value.push.apply(questions.value, queryDocs.filter( (row: any) => debriefer.program === 'wcgop' ? row.isWcgop : row.isAshop));
        questions.value = orderBy(questions.value, ['section', 'order'], ['asc', 'asc']);
    };

    const getAnswerSets = async () => {
        const answerSetQuery: any = await masterDB.view(
            'obs_web',
            'assessment-answer-set',
            {include_docs: true, reduce: false} as any
        );
        const answerSetDocs = answerSetQuery.rows.map( (row: any) => row.doc);
        answerSets.value.push.apply(answerSets.value, answerSetDocs.filter(
            (row: any) => {
                return row.isActive && debriefer.program === 'wcgop' ? row.isWcgop : row.isAshop;
            }
        ));
    };

    const getTotalHauls = () => {
        let allOperations = 0;
        for (const trip of debriefer.trips) {
            if (trip.operationIDs) {
                allOperations = allOperations + trip.operationIDs.length;
            }
        }
        totalHauls.value = allOperations;
    };

    const getArrayValues = (strArray: string[]) => {
        let returnVal = '';
        for (const str of sortBy(strArray)) {
            if (returnVal !== '') {
                returnVal += ', ';
            }
            returnVal += str;
        }
        return returnVal;
    };

    const getUniqueVessels = () => {
        const vessels = debriefer.trips.map( (trip: any) => {
            return trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber;
        });
        uniqueVessels.value = uniq(vessels).length;
        observedPrograms.value = uniq(debriefer.trips.map( (trip: any) => {
            return trip.program.description;
        }));
        observevedFisheries.value = uniq(debriefer.trips.map( (trip: any) => {
            return trip.fishery.description;
        }));

        getTotalHauls();
    };

    const getOrCreateAssesment = async () => {
        if (
            (debriefer.evaluationPeriod && debriefer.evaluationPeriod.id) ||
            (debriefer.selectedCruises.length === 1 && debriefer.selectedCruises[0]._id)
            ) {
            const assessmentKey = debriefer.program === 'wcgop' ? debriefer.evaluationPeriod.id : debriefer.selectedCruises[0]._id;
            const assessmentQuery: any = await masterDB.view(
                'obs_web',
                'observer-assessments',
                {include_docs: true, key: assessmentKey} as any
            );
            const assessments = assessmentQuery.rows.map( (row: any) => row.doc);
            if (assessments[0]) {
                getQuestions().then( () => {
                    assessment.value = assessments[0];
                });
            } else {
                const newAssessment: any = {
                    type: 'observer-assessment',
                    evaluationPeriod: assessmentKey,
                    createdBy: authService.getCurrentUser() ? authService.getCurrentUser()!.username : '',
                    createdDate: moment().format(),
                    assessmentResponses: []
                };
                getQuestions().then( async () => {

                    for (const question of questions.value) {
                        newAssessment.assessmentResponses.push(
                            {
                                question,
                                response: null
                            }
                        );
                    }
                    await masterDB.post(
                        newAssessment
                    ).then( async (response) => {
                        assessment.value = await masterDB.get(response.id);
                    });
                });
            }
        } else {
            assessment.value = null;
        }
    };

    const save = async () => {
        assessment.value.updatedBy = authService.getCurrentUser()!.username;
        assessment.value.updaedDate = moment().format();
        if (debriefer.program === 'wcgop') {
            assessment.value.vesselCount = uniqueVessels.value;
            assessment.value.tripCount = debriefer.trips.length;
            assessment.value.haulCount = totalHauls.value;
            assessment.value.fisheries = observevedFisheries.value;
            assessment.value.programs = observedPrograms.value;
        }

        await masterDB.put(
            assessment.value._id,
            assessment.value,
            assessment.value._rev
        ).then(
            (response) => {
                assessment.value._rev = response.rev;
            }
        );
    };

    const setAllOk = (section: any) => {
        for (const response of assessment.value.assessmentResponses ) {
            if (response.question.section === section && ['expectations met', 'improvement range', 'expectations met (A-SHOP)'].includes(response.question.answerSet)) {
                set(response, 'response', getAnswerSet(response.question.answerSet)[0]);
            }
        }
    };

    const setAllNull = (section: any) => {
        for (const response of assessment.value.assessmentResponses ) {
            if (response.question.section === section && ['expectations met', 'improvement range', 'expectations met (A-SHOP)'].includes(response.question.answerSet)) {
                set(response, 'response', null);
            }
        }
    };

    const setQuestionResponse = (index: number, answer: any) => {
        set(assessment.value.assessmentResponses[index], 'response', answer);
    };

    const finalize = () => {
        set(assessment.value, 'status', 'Finalized');
        save();
        // notify observer;
    };

    const acknowledgeReceipt = () => {
        set(assessment.value, 'status', 'Receipt Acknowledged');
        save();
        // send observer pdf;
    };

    const unlockAssessment = () => {
        set(assessment.value, 'status', null);
        save();
    };

    const exportPdf = async () => {
        let observer = null;
        if (debriefer.program === 'wcgop') {
            observer = await masterDB.get(debriefer.observer);
        } else {
            observer = {}
        }

        // const config = {
        //     headers: {
        //         authorization: 'Bearer ' + authService.getCurrentUser()!.jwtToken
        //     },
        //     params: {
        //         username: authService.getCurrentUser()!.username,
        //     }
        //   };
        // let observerEmail = '';
        // axios.get(authService.apiUrl + '/api/v1/user-details', config)
        // .then( async (response) => {
        //     console.log(response);
        //     if (response.data) {
        //         observerEmail = response.data.columns.find( (row: any) => row.column_name === 'email_address').value;
        //     }
        // });
        const evaluationPeriod = await masterDB.get(assessment.value.evaluationPeriod);
        const pdfHeader: any = {
            wcgop: [
                {image: 'data:image/png;base64,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', alignment: 'right', width: 200, height: 70, margin: [0, 0, 0, 10]},
                {text: 'West Coast Groundfish Observer Program', alignment: 'right'},
                {text: observer.firstName + ' ' + observer.lastName + ' - ' + evaluationPeriod.evalType + ' Assessment', style: 'header', alignment: 'right'},
                {text: moment(evaluationPeriod.startDate).format('MMM, DD, YYYY') + ' - ' + moment(evaluationPeriod.endDate).format('MMM, DD, YYYY'), alignment: 'right'},
                ' ', ' ',
            ],
            ashop: [
                {image: 'data:image/png;base64,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', alignment: 'right', width: 200, height: 70, margin: [0, 0, 0, 10]},
                {text: 'At Sea Hake Observer Program', alignment: 'right'},
                {text: 'Placeholder - Cruise Observer TBD', style: 'header', alignment: 'right'},
                {text: moment().format('MMM, DD, YYYY'), alignment: 'right'},
                ' ', ' ',
            ]
        };
        const contents = [];
        contents.push(
            pdfHeader[debriefer.program]
        );
        for (const section of sections.value) {
            if (assessment.value.assessmentResponses.find( (row: any) => row.question.section === section && row.response )) {
                contents.push(' ', {text: section, style: 'header'}, ' ');
            }
            for (const response of assessment.value.assessmentResponses) {
                if (response.question.section === section && response.response) {
                    contents.push(
                        {
                            text:
                                [
                                    {text: response.question.question + ' : '},
                                    {text: response.response, bold: true }
                                ],
                            margin: [10, 3, 5, 6],
                            style: 'default'
                        }
                    );
                }
            }
        }
        pdfMake.createPdf(
            {
                info: {
                    title: observer.firstName + ' ' + observer.lastName + ' - Assessment',
                    author: 'NOAA Fisheries'
                },
                content: contents,
                styles: {
                    header: {
                        fontSize: 14,
                        bold: true
                    },
                    default: {
                        fontSize: 10
                    }
                }
            }
        ).open();
    };

    onMounted( async () => {
        if (debriefer.program === 'wcgop' && !debriefer.observer) {
            store.dispatch('debriefer/updateEvaluationPeriod', {});
        }
        if (state.debriefer.program === 'wcgop') {
            getUniqueVessels();
        }
        getAnswerSets();
        getSections();
    });

    watch(() => state.debriefer.trips, () => {
        if (state.debriefer.program === 'wcgop') {
            getUniqueVessels();
            getTripProcedures();
        }
    });

    watch(() => assessment.value.assessmentResponses, (newVal, oldVal) => {
      if (oldVal) {
        save();
      }
    },
    {lazy: true, deep: true});

    watch(() => state.debriefer.evaluationPeriod, (newVal, oldVal) => {
        if (state.debriefer.program === 'wcgop') {
            getOrCreateAssesment();
        }
    }, {deep: true});

    watch(() => state.debriefer.selectedCruises, (newVal, oldVal) => {
        if (state.debriefer.program === 'ashop' && state.debriefer.selectedCruises.length === 1) {
            getOrCreateAssesment();
        }
    }, {deep: true});

    return {
        acknowledgeReceipt,
        answerSets,
        assessment,
        debriefer,
        exportPdf,
        finalize,
        getAnswerSet,
        getArrayValues,
        observevedFisheries,
        observedPrograms,
        observerMode,
        questions,
        samplingProcedures,
        sections,
        setAllOk,
        setAllNull,
        setQuestionResponse,
        totalHauls,
        uniqueVessels,
        unlockAssessment,
        weightMethods
    };
    }
});
</script>

<style scoped>

    .assessment-section {
    width: 100%;
    margin: 5px 0 5px 0
    }

</style>

