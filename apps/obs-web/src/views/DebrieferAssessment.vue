<template>
    <div>
        <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;">Fishing Effort:</p>
        <div style="margin-left: 20px">
            # vessels: {{ uniqueVessels }}<br>
            # Trips: {{ debriefer.trips.length }}<br>
            # Hauls: {{ totalHauls }}
        </div>
        <div v-for="section of sections" :key="sections.indexOf(section)">
            <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px; margin-top: 1em;">{{section}}</p>
            <div v-for="question of questions" :key="questions.indexOf(question)">
                <div v-if="question.section === section" class="row" style="margin-left: 20px">
                    <span class="col5" style="position: relative; top: 10px; width: 400px">{{ question.question }}&nbsp; &nbsp;</span>
                    <div class="col6">
                        <q-input
                            v-model="assessment[section + ' || ' +  question.question]"
                            autogrow
                            dense
                            style="width: 400px"
                        >
                            <template v-slot:append>
                                <q-btn
                                    v-if="assessment[section + ' || ' +  question.question]"
                                    icon="clear"
                                    size="xs"
                                    flat
                                    round
                                    @click="assessment[section + ' || ' +  question.question] = null"
                                ></q-btn>
                            </template>
                        </q-input>
                    </div>
                    <div class="col1">
                        <q-select
                            v-if="getAnswerSet(question.answerSet).length > 0"
                            v-model="assessment[section + ' || ' +  question.question]"
                            :options="getAnswerSet(question.answerSet)"
                            borderless
                            dense
                            hide-selected
                            options-cover
                            style="width: 10px"
                        >
                        </q-select>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  onMounted,
  watch
} from '@vue/composition-api';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import {  orderBy, uniq } from 'lodash';

export default createComponent({
  props: {
    showData: Boolean,
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
        uniqueVessels
    };
    }
});
</script>

<style scoped>


</style>

