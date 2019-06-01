// Uses http://pdfmake.org/
// https://stackoverflow.com/questions/50576746/import-pdfmake-js-file-to-my-ts-file
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import moment from 'moment';
import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState, PdfState } from '@/_store/types/types';
import { TallyCountData } from './types';

Vue.use(Vuex);

export const state: PdfState = {
  tripId: 'Not Set',
  haulId: 'Not Set',
  catchId: 'Not Set'
};

// Helper Functions

function generateTallyPdfData(newState: PdfState, tallyData: TallyCountData[]) {
  const header = [
    'Species',
    'Weight Method',
    'Tally Count',
    'Total Wt.',
    'Disp.',
    'Wt. Calc'
  ];

  const pdfData: any[] = [header];
  tallyData.forEach((data) => {
    if (data.count) {
      const tww = data.calculatedTotalWeighedWeight
        ? data.calculatedTotalWeighedWeight.toFixed(2)
        : '';
      const twc = data.calculatedTotalWeighedCount ?
      data.calculatedTotalWeighedCount : '';
      const avgwt = data.calculatedAverageWeight ?
      data.calculatedAverageWeight.toFixed(2) : '';
      const calculations = 'Weighed ' + twc + ' @ ' + tww + ' (Avg. Wt. = ' + avgwt + ' )';
      const totalWeight = data.count * (data.calculatedAverageWeight ? data.calculatedAverageWeight : 0);
      //     calculatedTotalWeighedCount?: number;
      // calculatedTotalWeighedWeight?: number;
      // calculatedAverageWeight?: number;
      pdfData.push([
        { text: data.shortCode, bold: true },
        { text: '13', alignment: 'center' },
        { text: data.count },
        { text: tww ? totalWeight.toFixed(2) : '', bold: true },
        { text: data.reason, alignment: 'center' },
        { text: tww ? calculations : '' }
      ]);
    }
  });

  // [
  //   d.catch,
  //   { text: d.speciesCode + ` (${commonName})`, bold: true },
  //   { text: d.weightMethod ? d.weightMethod : '-', alignment: 'center' },
  //   { text: d.fishCount },
  //   { text: d.weight ? d.weight.toFixed(2) : '-', bold: true },
  //   { text: d.disposition, bold: true, alignment: 'center' },
  //   { text: d.calculations ? d.calculations : '-' }
  // ]
  return pdfData;
}
const actions: ActionTree<PdfState, RootState> = {
  setData(
    { commit }: any,
    data: { tripId: string; haulId: string; catchId: string }
  ) {
    commit('setData', data);
  },
  generatePdf({ commit }: any, tallyData: TallyCountData[]) {
    commit('generatePdf', tallyData);
  }
};

const mutations: MutationTree<PdfState> = {
  setData(
    newState: any,
    data: { tripId: string; haulId: string; catchId: string }
  ) {
    // Catch, Trip, Haul ID's
    newState.tripId = data.tripId;
    newState.haulId = data.haulId;
    newState.catchId = data.catchId;
  },
  generatePdf(newState: any, tallyData: TallyCountData[]) {
    const date = moment().format();
    const dateStr = moment().format('MM/DD hh:mm');
    const tripId = newState.tripId;
    const haulId = newState.haulId;
    const catchId = newState.catchId;

    const tallyDataDef = generateTallyPdfData(newState, tallyData);

    const docDefinition = {
      dateStr,
      pageSize: 'LETTER',
      header: (currentPage: number, pageCount: number, pageSize: number) => {
        return {
          columns: [
            { width: 150, bold: true, text: 'FIXED GEAR DECK FORM' },
            {
              width: 'auto',
              text: 'TRIP ' + tripId + ', HAUL ' + haulId + ', CATCH ' + catchId
            },
            { width: 150, text: `${dateStr}`, alignment: 'right' },
            {
              width: 100,
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: 'right'
            }
          ],
          margin: [10, 10, 10, 10]
        };
      },
      content: {
        columns: [
          {
            layout: 'lightHorizontalLines', // optional
            width: 'auto',
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: [150, 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: tallyDataDef
            }
          }
        ],
        margin: [0, 0, 0, 0]
      }
    };

    const fileDate = moment().format('YYYYMMDD');
    pdfMake
      .createPdf(docDefinition)
      .download(`tally-${fileDate}-${tripId}-${haulId}.pdf`);
  }
};

export const pdfState: Module<PdfState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations
};
