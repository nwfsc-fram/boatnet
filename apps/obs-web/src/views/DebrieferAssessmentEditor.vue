<template>
    <div class="q-pa-md q-gutter-md">

        <q-table
          title="SECTIONS"
          :data="sections"
          :columns="sectionsColumns"
          row-key="_id"
          binary-state-sort
          dense
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="sections" :props="props">
                {{ getArrayString(props.row.sections) }}
                <q-popup-edit v-model="props.row.sections" buttons @save="save(props.row)">
                  <div v-for="section of props.row.sections" :key="props.row.sections.indexOf(section)">
                    <q-input v-model="props.row.sections[props.row.sections.indexOf(section)]" dense>
                      <template v-slot:append>
                        <q-btn icon="clear" flat @click="props.row.sections.splice(props.row.sections.indexOf(section), 1)"></q-btn>
                      </template>
                    </q-input>
                  </div>
                    <q-btn flat style="float: right; margin-top: 10px" @click="props.row.sections.push('')">add section</q-btn>
                </q-popup-edit>
              </q-td>
              <q-td key="isWcgop" :props="props">
                {{ props.row.isWcgop }}
                <q-popup-edit v-model="props.row.isWcgop" buttons @save="save(props.row)">
                    <q-select v-model="props.row.isWcgop" :options="[true, false]" dense></q-select>
                </q-popup-edit>
              </q-td>
              <q-td key="isAshop" :props="props">
                {{ props.row.isAshop }}
                <q-popup-edit v-model="props.row.isAshop" buttons @save="save(props.row)">
                    <q-select v-model="props.row.isAshop" :options="[true, false]" dense></q-select>
                </q-popup-edit>
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <q-table
          title="QUESTIONS"
          :data="questions"
          :columns="questionColumns"
          row-key="_id"
          binary-state-sort
          dense
          :pagination.sync="questionsPagination"
        >
        <template v-slot:top :props="props">
          <div style="width: 100%; font-size: 1.5em; margin-top: 5px">
            <b style="color: #007EC6">QUESTIONS</b>
            <span style="color: #007EC6; font-size: .6em; vertical-align: middle; margin-left: 10px; font-style: italic">default sort order: program/section/order</span>
            <q-btn style="float: right" color="primary" @click="addQuestion">new question</q-btn>
          </div>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="section" :props="props">
                {{ props.row.section }}
                <q-popup-edit v-model="props.row.section" buttons @save="save(props.row)">
                    <q-select v-model="props.row.section" :options="sections" dense></q-select>
                </q-popup-edit>
              </q-td>
              <q-td key="question" :props="props">
                {{ getQuestionString(props.row.question) }}
                <q-popup-edit v-model="props.row.question" buttons @save="save(props.row)">
                    <q-input v-model="props.row.question" dense></q-input>
                </q-popup-edit>
              </q-td>
              <q-td key="answerSet" :props="props">
                {{ props.row.answerSet }}
                <q-popup-edit v-model="props.row.answerSet" buttons @save="save(props.row)">
                    <q-select v-model="props.row.answerSet" :options="getProgramAnswerSetNames" dense></q-select>
                </q-popup-edit>
              </q-td>
              <q-td key="order" :props="props">
                {{ props.row.order }}
                <q-popup-edit v-model="props.row.order" buttons @save="save(props.row)">
                    <q-input v-model="props.row.order" dense></q-input>
                </q-popup-edit>
              </q-td>
              <q-td key="isWcgop" :props="props">
                {{ props.row.isWcgop }}
                <q-popup-edit v-model="props.row.isWcgop" buttons @save="save(props.row)">
                    <q-select v-model="props.row.isWcgop" :options="[true, false]" dense></q-select>
                </q-popup-edit>
              </q-td>
              <q-td key="isAshop" :props="props">
                {{ props.row.isAshop }}
                <q-popup-edit v-model="props.row.isAshop" buttons @save="save(props.row)">
                    <q-select v-model="props.row.isAshop" :options="[true, false]" dense></q-select>
                </q-popup-edit>
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <q-table
          title="ANSWER SET"
          :data="answers"
          :columns="answersColumns"
          row-key="_id"
          binary-state-sort
          dense
          :pagination.sync="answerSetsPagination"
        >
          <template v-slot:top :props="props">
            <div style="width: 100%; font-size: 1.5em; margin-top: 5px">
              <b style="color: #007EC6">ANSWER SETS</b>
              <q-btn style="float: right" color="primary" @click="addAnswerSet">new answer set</q-btn>
            </div>
            </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props">
                {{ props.row.name }}
                <q-popup-edit v-model="props.row.name" buttons @save="save(props.row)">
                    <q-input v-model="props.row.name" dense></q-input>
                </q-popup-edit>
              </q-td>
              <q-td key="options" :props="props">
                {{ getArrayString(props.row.options) }}
                <q-popup-edit v-model="props.row.options" buttons @save="save(props.row)">
                  <div v-for="option of props.row.options" :key="props.row.options.indexOf(option)">
                    <q-input v-model="props.row.options[props.row.options.indexOf(option)]" dense>
                      <template v-slot:append>
                        <!-- <span v-if="props.rows.options.indexOf(option) === 0">
                          good option
                        </span> -->
                        <span v-if="props.row && props.row.options.indexOf(option) === 0" style="font-size: .6em;">'OK/good' option</span>
                        <q-btn icon="clear" flat @click="props.row.options.splice(props.row.options.indexOf(option), 1)"></q-btn>
                      </template>
                    </q-input>
                  </div>
                    <q-btn flat style="float: right; margin-top: 10px" @click="props.row.options.push('')">add option</q-btn>
                </q-popup-edit>
              </q-td>
              <q-td key="isWcgop" :props="props">
                {{ props.row.isWcgop }}
                <q-popup-edit v-model="props.row.isWcgop" buttons @save="save(props.row)">
                    <q-select v-model="props.row.isWcgop" :options="[true, false]" dense></q-select>
                </q-popup-edit>
              </q-td>
              <q-td key="isAshop" :props="props">
                {{ props.row.isAshop }}
                <q-popup-edit v-model="props.row.isAshop" buttons @save="save(props.row)">
                    <q-select v-model="props.row.isAshop" :options="[true, false]" dense></q-select>
                </q-popup-edit>
              </q-td>
            </q-tr>
          </template>
        </q-table>

    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  onMounted,
  watch,
  set,
  computed
} from '@vue/composition-api';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { orderBy, uniq, flatten, sortBy } from 'lodash';
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

    const jp = require('jsonpath');

    const questionsPagination = {rowsPerPage: 15};
    const answerSetsPagination = {rowsPerPage: 15};

    const sections: any = ref([]);

    const answerSetNames: any = ref([]);

    const questions: any = ref([]);
    const questionColumns: any = [
      { name: 'section', label: 'Section', field: 'section', sortable: true, align: 'left' },
      { name: 'question', label: 'Question', field: 'question', sortable: true, align: 'left' },
      { name: 'answerSet', label: 'Answer Set', field: 'answerSet', sortable: true, align: 'left' },
      { name: 'order', label: 'Order', field: 'order', sortable: true, align: 'center' },
      { name: 'isWcgop', label: 'WCGOP?', field: 'isWcgop', sortable: true, align: 'center' },
      { name: 'isAshop', label: 'ASHOP?', field: 'isAshop', sortable: true, align: 'center' }
    ];
    const getQuestions = async () => {
      const results = await masterDB.view(
        'obs_web',
        'assessment-question',
        { include_docs: true } as any
      );

      if (results.rows) {
        questions.value.length = 0;
        questions.value = sortBy(results.rows.map( (row: any) => row.doc ), [(debriefer.program === 'wcgop' ? 'isWcgop' : 'isAshop'), 'section', 'order'] );
      }
    };

    const answers: any = ref([]);
    const answersColumns: any = [
      { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
      { name: 'options', label: 'Options', field: 'options', sortable: true, align: 'left' },
      { name: 'isWcgop', label: 'WCGOP?', field: 'isWcgop', sortable: true, align: 'center' },
      { name: 'isAshop', label: 'ASHOP?', field: 'isAshop', sortable: true, align: 'center' },
    ];
    const getAnswerSets = async () => {
      const results = await masterDB.view(
        'obs_web',
        'assessment-answer-set',
        { include_docs: true } as any
      );

      if (results.rows) {
        answers.value.length = 0;
        answers.value = sortBy(results.rows.map( (row: any) => row.doc ), [(debriefer.program === 'wcgop' ? 'isWcgop' : 'isAshop'), 'name']);
        answerSetNames.value = answers.value.map( (row: any) => row.name );
      }
    };

    const sectionsColumns: any = [
      { name: 'sections', label: 'Sections', field: 'sections', sortable: true, align: 'left'},
      { name: 'isWcgop', label: 'WCGOP?', field: 'isWcgop', sortable: true, align: 'center' },
      { name: 'isAshop', label: 'ASHOP?', field: 'isAshop', sortable: true, align: 'center' },
    ];

    const getArrayString = (array: any) => {
      return JSON.stringify(array).slice(0, 100) + (JSON.stringify(array).length > 100 ? '...' : '');
    };

    const getQuestionString = (question: string) => {
      return question.slice(0, 60) + (question.length > 100 ? '...' : '');
    };

    const addQuestion = () => {
      questions.value.unshift(
        {
          type: 'assessment-question',
          question: '',
          section: '',
          order: '',
          answerSet: '',
          createdBy: authService.getCurrentUser()!.username,
          createdDate: moment().format(),
          isWcgop: debriefer.program === 'wcgop' ? true : false,
          isAshop: debriefer.program === 'ashop' ? true : false
        });
    };

    const addAnswerSet = () => {
      answers.value.unshift(
        {
          type: 'assessment-answer-set',
          name: '', options: [],
          createdBy: authService.getCurrentUser()!.username,
          createdDate: moment().format(),
          isWcgop: debriefer.program === 'wcgop' ? true : false,
          isAshop: debriefer.program === 'ashop' ? true : false
        }
      );
    };

    const getProgramAnswerSetNames = computed(() => {
      if (debriefer.program === 'wcgop') {
        return answers.value.filter( (row: any) => row.isWcgop ).map( (row: any) => row.name );
      } else if (debriefer.program === 'ashop') {
        return answers.value.filter( (row: any) => row.isAshop ).map( (row: any) => row.name );
      } else {
        return [];
      }
    });

    const save = async (row: any) => {
      if (!row.isWcgop) {
        delete row.isWcgop;
      }
      if (!row.isAshop) {
        delete row.isAshop;
      }
      row.updatedBy = authService.getCurrentUser()!.username;
      row.updatedDate = moment().format();
      const couchResponse = await masterDB.post(row);
      row._id = couchResponse.id;
      row._rev = couchResponse.rev;
    };

    const getSections = async () => {
          const result = await masterDB.view(
            'obs_web',
            'assessment-sections',
            {include_docs: true, key: debriefer.program} as any
          );
          sections.value = result.rows.map( (row: any) => row.doc );
    };

    onMounted(
      () => {
        getQuestions();
        getAnswerSets();
        getSections();
      }
    );

    return {
      addAnswerSet,
      addQuestion,
      answers,
      answersColumns,
      answerSetNames,
      answerSetsPagination,
      debriefer,
      getProgramAnswerSetNames,
      getArrayString,
      getQuestionString,
      questionsPagination,
      questionColumns,
      questions,
      save,
      sections,
      sectionsColumns
    };
    }
});
</script>

<style scoped>

</style>

