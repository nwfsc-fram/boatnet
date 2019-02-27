import { Component, OnInit } from '@angular/core';
import { StateService } from './_services/data/state.service';
import { DataService } from './_services/data/data.service';

@Component({
  selector: 'boatnet-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private stateService: StateService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    console.log('CURRENT STATE:::::::: ');
    console.log(this.stateService.getState());
  }

  clearSearchString() {
    this.dataService.searchstring = '';
  }
}
