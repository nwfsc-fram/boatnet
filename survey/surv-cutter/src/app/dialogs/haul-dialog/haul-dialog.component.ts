import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-haul-dialog',
  templateUrl: './haul-dialog.component.html',
  styleUrls: ['./haul-dialog.component.scss']
})
export class HaulDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<HaulDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  open() {
    this.open();
  }
  closeDialog() {
    this.dialogRef.close('Pizza');
  }
}
