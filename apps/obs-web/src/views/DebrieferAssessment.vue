<template>
    <div>
        <q-card class="assessment-section">
            <q-card-section>
                <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;">Fishing Effort:</p>
                <div>
                    # vessels: {{ uniqueVessels }}<br>
                    # Trips: {{ debriefer.trips.length }}<br>
                    # Hauls: {{ totalHauls }}
                </div>
            </q-card-section>
        </q-card>
        <q-card v-for="section of sections" :key="sections.indexOf(section)" class="assessment-section">
            <q-card-section>
                <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;">{{section}}</p>
                <div v-for="question of questions" :key="questions.indexOf(question)">
                    <div v-if="question.section === section" class="row">
                        <span class="col5" style="position: relative; top: 10px; width: 400px;">{{ question.question }}&nbsp; &nbsp;</span>
                        <div class="col">
                            <q-input
                                v-model="assessment[section + ' || ' +  question.question]"
                                autogrow
                                dense
                            >
                            <q-menu anchor="top left" style="cursor: pointer">
                                <q-list dense >
                                    <q-item
                                        v-for="answer of getAnswerSet(question.answerSet)"
                                        :key="getAnswerSet(question.answerSet).indexOf(answer)"
                                        clickable
                                        @click="setQuestionResponse(section + ' || ' +  question.question, answer)"
                                        v-close-popup>
                                        <q-item-section>{{ answer }}</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                            <template v-slot:append>
                                <q-btn
                                    v-if="assessment[section + ' || ' +  question.question]"
                                    icon="clear"
                                    size="xs"
                                    flat
                                    round
                                    @click="setQuestionResponse(section + ' || ' +  question.question, null)"
                                ></q-btn>
                            </template>
                            </q-input>
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  onMounted,
  watch,
  reactive,
  set
} from '@vue/composition-api';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import {  orderBy, uniq } from 'lodash';

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
    const assessment: any = ref({});

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

    const setQuestionResponse = (question: any, answer: any) => {
        set(assessment.value, question, answer);
    };

    onMounted( async () => {
        getQuestions();
        getAnswerSets();
        getUniqueVessels();
    });

    watch(() => state.debriefer.trips, getUniqueVessels);

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

