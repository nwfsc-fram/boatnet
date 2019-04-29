// Generate PDF with pdfMake
// https://github.com/bpampuch/pdfmake

import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { TallyData } from '../../_models/wcgop/tally/tally-entry';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfGenerationService {
  constructor() {}

  generateTallyPdf(
    tallyDataDef: TallyData,
    date: string,
    tripId: string,
    haulId: string
  ) {
    const docDefinition = {
      date: date,
      pageSize: 'LETTER',
      header: (currentPage, pageCount, pageSize) => {
        return {
          columns: [
            { width: 150, bold: true, text: 'FIXED GEAR DECK FORM' },
            { text: 'TRIP #' + tripId },
            { text: 'HAUL #' + haulId },
            { text: `DATE: ${date}` },
            { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right' }
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
              widths: ['auto', 150, 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: tallyDataDef
            }
          }
        ],
        margin: [0, 0, 0, 0]
      }
    };

    const fileDate = date.replace(new RegExp('-', 'g'), '');

    pdfMake
      .createPdf(docDefinition)
      .download(`tally-${fileDate}-${tripId}-${haulId}.pdf`);
  }
}
