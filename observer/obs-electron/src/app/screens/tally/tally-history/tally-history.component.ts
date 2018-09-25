import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';

@Component({
  selector: 'app-tally-history',
  templateUrl: './tally-history.component.html',
  styleUrls: ['./tally-history.component.scss']
})
export class TallyHistoryComponent {
  displayedColumns = ['time', 'code', 'type', 'delta', 'newValue'];
  dataSource = [];

  constructor(
    private tallySheetRef: MatBottomSheetRef<TallyHistoryComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  getTypeClass(type: string) {
    return type.toLowerCase() + '-btn';
  }
}


