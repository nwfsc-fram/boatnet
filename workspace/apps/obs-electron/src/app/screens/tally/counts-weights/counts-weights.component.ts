import {
  Component,
  OnInit,
  Input,
  Inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CountsWeightsData } from '../../../_models/wcgop/tally/counts-weights-data';
import { DataService } from '../../../_services/data/data.service';
import { AppState } from '../../../_models/wcgop/app-state';
import { StateService } from '../../../_services/data/state.service';
import { Observable } from 'rxjs';
import { parse } from 'url';
import { ConfirmationService } from 'primeng/api';
import { FramNumpadComponent } from '../../fram-numpad/fram-numpad.component';

@Component({
  selector: 'app-counts-weights',
  templateUrl: './counts-weights.component.html',
  styleUrls: ['./counts-weights.component.scss']
})
export class CountsWeightsComponent implements OnInit {
  cwData: Array<any>;
  commonName: string;

  amount: number;

  cw = [];
  isTabletMode: Observable<boolean>;

  @ViewChild('count')
  countEdit: ElementRef;
  @ViewChild('weight')
  weightEdit: ElementRef;

  isCountFocus = true; // toggle for count/ weight focus

  @ViewChild(FramNumpadComponent)
  private numpadComponent: FramNumpadComponent;

  constructor(
    public dialogRef: MatDialogRef<CountsWeightsComponent>,
    private dataService: DataService,
    private stateService: StateService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.isTabletMode = this.stateService.tabletMode;
    this.commonName = this.dataService.getSpeciesCommonName(
      this.data.speciesCode
    );
    CountsWeightsData.calcCountAvgWeight(this.data.countsWeights);
    this.cwData = this.data.countsWeights.cwData;
    this.dialogRef.beforeClose().subscribe(result => {
      if (!result) {
        // Intercept when the user just clicks outside the dialog instead of clicking Done
        // Otherwise data will be deleted
        this.dialogRef.close(this.data.countsWeights);
      }
    });
  }

  onDelete(data) {
    this.confirmationService.confirm({
      header: 'Delete Counts/Weights Row',
      message: `Delete Row: Count: ${data.count}, Weight:  ${data.weight}?`,
      accept: () => {
        this.deleteCWData(data);
      }
    });
  }
  private deleteCWData(data) {
    for (let i = 0; i < this.data.countsWeights.cwData.length; ++i) {
      if (
        data.count === this.data.countsWeights.cwData[i].count &&
        data.weight === this.data.countsWeights.cwData[i].weight
      ) {
        this.data.countsWeights.cwData.splice(i, 1);
        this.cwData = this.data.countsWeights.cwData;
        CountsWeightsData.calcCountAvgWeight(this.data.countsWeights);
        if (this.data.countsWeights.cwData.length === 0) {
          this.cwData = this.data.countsWeights.cwData = [];
        }
        return;
      }
    }
  }

  getCountInput(): number {
    const val = this.countEdit.nativeElement.value;
    const parsed = parseInt(val, 10);
    if (val.length === 0 || parsed === NaN || parsed <= 0) {
      return undefined;
    } else {
      return parsed;
    }
  }

  getWeightInput(): number {
    const val = this.weightEdit.nativeElement.value;
    const parsed = parseFloat(val);
    if (val.length === 0 || parsed === NaN || parsed <= 0) {
      return undefined;
    } else {
      return parsed;
    }
  }

  isInputOk(): boolean {
    if (
      this.getCountInput() !== undefined &&
      this.getWeightInput() !== undefined
    ) {
      return true;
    } else {
      return false;
    }
  }

  onAddEntry() {
    if (this.isInputOk()) {
      const count = this.getCountInput();
      const weight = this.getWeightInput();
      CountsWeightsData.addCountWeight(this.data.countsWeights, count, weight);
      this.countEdit.nativeElement.value = '';
      this.weightEdit.nativeElement.value = '';
      this.isCountFocus = true;
    }
  }

  dataUpdated(data) {
    CountsWeightsData.calcCountAvgWeight(this.data.countsWeights);
  }

  onKeyPress(key) {
    // TODO: This is a hack. Need better numpad options.
    const curFocus = this.isCountFocus
      ? this.countEdit.nativeElement
      : this.weightEdit.nativeElement;
    if (key === 'OK') {
      this.isCountFocus = !this.isCountFocus;
    } else if (key === 'ADD') {
      this.onAddEntry();
      this.isCountFocus = true;
    } else {
      if (key === '.' && curFocus.value.includes('.')) {
        return;
      } else if (key === 'bksp') {
        if (curFocus.value.length > 0) {
          curFocus.value = curFocus.value.slice(0, -1);
        }
      } else {
        curFocus.value += key;
      }
    }
  }

  setCountActive(active) {
    this.isCountFocus = active;
  }
}
