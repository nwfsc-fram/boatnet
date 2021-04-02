<template>
    <div>
        <div v-if="assessment">
            <q-card class="assessment-section">
                <q-card-section>
                    <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;" class="text-primary">Fishing Effort:</p>
                    <div>
                        Vessels: <b>{{ uniqueVessels }}</b>&nbsp;
                        Trips: <b>{{ debriefer.trips.length }}</b>&nbsp;
                        Hauls: <b>{{ totalHauls }}</b>
                    </div>
                </q-card-section>
            </q-card>
            <q-card v-for="section of sections" :key="sections.indexOf(section)" class="assessment-section">
                <q-card-section>
                    <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;" class="text-primary">{{section}}</p>
                    <div v-for="(assessmentResponse, i) of assessment.assessmentResponses" :key="i">
                        <div v-if="assessmentResponse.question.section === section" class="row">
                            <span class="col5" style="position: relative; top: 10px; width: 400px;">{{ assessmentResponse.question.question }}&nbsp; &nbsp;</span>
                            <div class="col">
                                <q-input
                                    v-model="assessmentResponse.response"
                                    autogrow dense
                                >
                                    <q-menu anchor="top left" style="cursor: pointer">
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
                                            v-if="assessment.assessmentResponses[i].response"
                                            icon="clear" size="xs" flat round
                                            @click="setQuestionResponse(i, null)"
                                        ></q-btn>
                                    </template>
                                </q-input>
                            </div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
        <div v-else>
            Please select an observer and evaluation period.
        </div>
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
import { orderBy, uniq } from 'lodash';
import moment from 'moment';
import { authService } from '@boatnet/bn-auth';

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
    const totalHauls: any = ref(0);

    const questions: any = ref([]);
    const answerSets: any = ref([]);

    const sections: any = [
        'OTC Sampling Procedures',
        'Catch Categories',
        'Biological Sampling',
        'Sample Size',
        'Data Forms',
        'Database Entry',
        'Calculations',
        'Observer Logbook',
        'Species ID',
        'Communication/Attitude/Reliability',
        'Requirements for Return (Exit/Year-end only)',
        'Summary'
    ];
    const assessment: any = ref(null);

    const getAnswerSet = (setName: string) => {
        const answerSet = answerSets.value.find( (row: any) => row.name === setName );
        return answerSet ? answerSet.options : [];
    };

    const getQuestions = async () => {
        const questionsQuery: any = await masterDB.view(
            'obs_web',
            'assessment-question',
            {include_docs: true, reduce: false} as any
        );
        const queryDocs = questionsQuery.rows.map( (row: any) => row.doc);
        questions.value.push.apply(questions.value, queryDocs.filter( (row: any) => row.isActive && row.isWcgop));
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
                return row.isActive && row.isWcgop;
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

    const getUniqueVessels = () => {
        const vessels = debriefer.trips.map( (trip: any) => {
            return trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber;
        });
        uniqueVessels.value = uniq(vessels).length;
        getTotalHauls();
    };

    const getOrCreateAssesment = async () => {
        if (debriefer.evaluationPeriod && debriefer.evaluationPeriod.id) {
            const assessmentQuery: any = await masterDB.view(
                'obs_web-new',
                'observer-assessments',
                {include_docs: true, key: debriefer.evaluationPeriod.id} as any
            );
            const assessments = assessmentQuery.rows.map( (row: any) => row.doc);
            if (assessments[0]) {
                assessment.value = assessments[0];
            } else {
                const newAssessment: any = {
                    type: 'observer-assessment',
                    evaluationPeriod: debriefer.evaluationPeriod.id,
                    createdBy: authService.getCurrentUser() ? authService.getCurrentUser()!.username : '',
                    createdDate: moment().format(),
                    assessmentResponses: []
                };
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
            }
        } else {
            assessment.value = null;
        }
    };

    const save = async () => {
        assessment.value.updatedBy = authService.getCurrentUser()!.username;
        assessment.value.updaedDate = moment().format();
        assessment.value.vesselCount = uniqueVessels.value;
        assessment.value.tripCount = debriefer.trips.length;
        assessment.value.haulCount = totalHauls.value;

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

    const setQuestionResponse = (index: number, answer: any) => {
        set(assessment.value.assessmentResponses[index], 'response', answer);
    };

    onMounted( async () => {
        if (!debriefer.observer) {
            store.dispatch('debriefer/updateEvaluationPeriod', {});
        }
        getUniqueVessels();
        getQuestions().then(
            () => getOrCreateAssesment()
        );
        getAnswerSets();
    });

    watch(() => state.debriefer.trips, getUniqueVessels);
    watch(() => assessment.value.assessmentResponses, (newVal, oldVal) => {
      if (oldVal) {
        save();
      }
    },
    {lazy: true, deep: true});
    watch(() => state.debriefer.evaluationPeriod, getOrCreateAssesment, {deep: true});

    return {
        answerSets,
        assessment,
        debriefer,
        getAnswerSet,
        questions,
        sections,
        totalHauls,
        uniqueVessels,
        setQuestionResponse
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

