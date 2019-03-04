import { Component, Inject, OnInit } from '@angular/core';
// import { HaulDialogComponent } from '../../dialogs/haul-dialog/haul-dialog.component';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StateService } from '../../_services/state.service';
import { AcousticHaul } from '../../_models/acoustic/acoustic-haul';
@Component({
  selector: 'app-hauls',
  templateUrl: './hauls.component.html',
  styleUrls: ['./hauls.component.scss']
})
export class HaulsComponent implements OnInit {
  displayedColumns = [
    'status',
    'haulNumber',
    'startDate',
    'endDate',
    'haulType'
  ];
  // dataSource = HAUL_DATA;
  dataSource = [];
  highlightedRow = null;
  currentHaul: Observable<AcousticHaul>;
  haulNumber: Observable<string>;

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.currentHaul = this.stateService.currentHaul;
    this.haulNumber = this.stateService.haulNumber;
    this.createHauls();
    this.filterHauls('today');
  }

  selectHaul(index, row) {
    if (row['status'] === 'Active') {
      // this.openDialog();
      row['status'] == 'Selected';
    }
    this.highlightedRow = row;
    this.stateService.setHaul(row);
    // this.stateService.currentHaul.next(row);

    console.log('row index = ' + JSON.stringify(index));
    console.log('haul = ' + JSON.stringify(this.highlightedRow));
    console.log('haulNumber = ' + this.stateService.haulNumber.getValue());
  }

  createHauls() {
    let newHaul;
    for (const haul of HAUL_DATA) {
      newHaul = AcousticHaul.createAcousticHaul(
        haul['haulNumber'],
        haul['gearType'],
        haul['startDate'],
        haul['username'],
        haul['haulType']
      );
      this.dataSource.push(newHaul);
    }
  }

  filterHauls(filter: string) {
    switch (filter) {
      case 'today':
        break;
      case 'twodays':
        break;
      case 'all':
        break;
    }
  }

  // openDialog(): void {
  //   const dialogRef = this.dialog.open(HaulDialogComponent, {
  //     width: '250px',
  //     data: { name: 'todd' }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed');
  //   });
  // }
}

const HAUL_DATA = [
  {
    haulNumber: '1',
    gearType: 'Trawl',
    startDate: '06/24/2018 13:45:00',
    username: 'Todd Hay',
    haulType: 'Net Tow'
  },
  {
    haulNumber: '2',
    gearType: 'Trawl',
    startDate: '06/24/2018 15:13:00',
    username: 'Todd Hay',
    haulType: 'Methot Tow'
  },
  {
    haulNumber: '3',
    gearType: 'Trawl',
    startDate: '06/23/2018 18:13:00',
    username: 'Todd Hay',
    haulType: 'Methot Tow'
  },
  {
    haulNumber: '4',
    gearType: 'Trawl',
    startDate: '06/22/2018 18:13:00',
    username: 'Todd Hay',
    haulType: 'Net Tow'
  },
  {
    haulNumber: '5',
    gearType: 'Trawl',
    startDate: '06/18/2018 18:13:00',
    username: 'Todd Hay',
    haulType: 'Net Tow'
  },
  {
    haulNumber: '6',
    gearType: 'Trawl',
    startDate: '05/03/2018 18:13:00',
    username: 'Todd Hay',
    haulType: 'Net Tow'
  }
];
