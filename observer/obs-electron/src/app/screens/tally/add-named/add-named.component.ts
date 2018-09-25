import {
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  ComponentRef
} from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { StateService } from '../../../_services/data/state.service';

import * as $ from 'jquery';
import { KeyboardOptions } from 'virtual-keyboard';
import { AutoComplete } from 'primeng/autocomplete';

import 'virtual-keyboard';
import { FormControl } from '@angular/forms';

import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-named',
  templateUrl: './add-named.component.html',
  styleUrls: ['./add-named.component.scss']
})
export class AddNamedComponent implements OnInit {
  public acceptText = 'ADD';

  public keyboard: any;
  public kbOpts: KeyboardOptions;

  isTabletMode: Observable<boolean>;

  myControl = new FormControl();

  filteredOptions: Observable<any[]>;

  @ViewChild('autoComplete')
  autoComplete: ElementRef;

  constructor(
    private tallySheetRef: MatBottomSheetRef<AddNamedComponent>,
    private stateService: StateService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  public speciesCode: string;

  results: any[];

  ngOnInit() {
    this.isTabletMode = this.stateService.tabletMode;
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toUpperCase();

    // return this.data.speciesList.filter(option => {
    //   return option.code.startsWith(filterValue) || option.label.toUpperCase().includes(filterValue);
    // });
    return this.data.speciesList.filter(option =>
      option.code.startsWith(filterValue)
    );

  }
  onSubmit() {
    if (this.verifyCode(this.speciesCode)) {
      this.tallySheetRef.dismiss(this.speciesCode);
    } else {
      this.tallySheetRef.dismiss(null);
    }
  }

  verifyCode(code) {
    for (const c of this.data.speciesList) {
      if (code === c.code) {
        return true;
      }
    }
    return false;
  }
}
