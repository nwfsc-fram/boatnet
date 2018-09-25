import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';

import { DataService } from '../../../_services/data/data.service';
import { PdfGenerationService } from '../../../_services/pdf/pdf-generation.service';
import { Observable } from 'rxjs';
import { StateService } from '../../../_services/data/state.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { TallyService } from '../../../_services/data/tally/tally.service';

@Component({
  selector: 'app-tally-pdf',
  templateUrl: './tally-pdf.component.html',
  styleUrls: ['./tally-pdf.component.scss']
})
export class TallyPdfComponent implements OnInit {
  tallyData: any;
  formDate: string;
  tripId: string;
  haulId: string;

  tallyDataRows = [];
  isTabletMode: Observable<boolean>;

  previewColumnTitles: Array<string>;
  previewColumns = [
    'catch',
    'speciesCode',
    'weightMethod',
    'fishCount',
    'weight',
    'disposition',
    'calculations'
  ];

  previewData: MatTableDataSource<Object>;

  floatColumns = new Set([4]); // defines which columns are floating point for toFixed(2)

  constructor(
    private stateService: StateService,
    private dataService: DataService,
    private tallyService: TallyService,
    private pdfService: PdfGenerationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isTabletMode = this.stateService.tabletMode;
    // For generating PDF:
    const pdfData = this.tallyService.getTallyPDFData();
    this.tallyData = pdfData.tallyData;
    this.formDate = pdfData.tallyInfo.formDate;
    this.tripId = pdfData.tallyInfo.tripId;
    this.haulId = pdfData.tallyInfo.haulId;

    // For generating preview:
    this.previewColumnTitles = pdfData.tallyData[0].slice();

    if (!this.tallyService.tallies) {
      this.previewData = undefined;
      return;
    }

    const tmpData = this.tallyService.tallies.tallyData;
    for (const p of tmpData) {
      p.speciesCode += ` (${this.dataService.getSpeciesCommonName(
        p.speciesCode
      )})`;
    }

    this.previewData = new MatTableDataSource<Object>(tmpData);
  }

  onBack() {
    this.router.navigate(['/tally']);
  }

  getRowText(data, column) {

    if (this.floatColumns.has(column)) {
      return data ?  data.toFixed(2) : '-';
    } else {
      return data ?  data : '-';
    }
  }
  generatePDF() {
    // https://github.com/bpampuch/pdfmake
    this.pdfService.generateTallyPdf(this.tallyData, this.formDate, this.tripId, this.haulId);
  }
}
