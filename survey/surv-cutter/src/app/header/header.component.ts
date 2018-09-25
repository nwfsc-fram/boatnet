import { Component, OnInit } from '@angular/core';
import { Observable, of as observableOf, Observer } from 'rxjs';
import { User } from '../_models/shared/user';
import { AcousticHaul } from '../_models/acoustic/acoustic-haul';
import { AcousticAppConfig } from '../_models/acoustic/acoustic-app-config';
import { StateService } from '../_services/state.service';
const pkg = require('../../../package.json');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  value = '';
  currentUser: User;
  currentPosition: Observable<number>;
  currentHaul: Observable<AcousticHaul>;
  haulNumber: Observable<string>;
  currentScreen: Observable<string>;
  screenFormatted: string;
  speciesListShown: Observable<boolean>;
  speciesFilter: Observable<string>;
  speciesListSelected = 'Full List';

  // currentState: AppState;

  showHome = true;
  debugMode = false;
  showVersion = true;
  headerStatus: Observable<string>;
  version: string;
  isSpeciesCompDisabled = true;

  species = [];

  constructor(
    private stateService: StateService,
  ) { }

  ngOnInit() {
    this.version = this.version = (<any>pkg).version;
    this.currentHaul = this.stateService.currentHaul;
    this.haulNumber = this.stateService.haulNumber;
    this.currentScreen = this.stateService.currentScreen;
    // this.currentPosition = this.stateService.position;
    this.speciesListShown = this.stateService.speciesListShown;
    this.speciesFilter = this.stateService.speciesFilter;
  }

  speciesClicked() {
    console.log('species clicked');
    this.stateService.showSpeciesList(true);
  }

  closeSpeciesList() {
    this.stateService.showSpeciesList(false);
  }
  filterSpecies(value: string) {
    console.log('filter string: ' + value);
    this.stateService.filterSpecies(value);
  }
  toggleSpeciesList(value: string) {
    this.speciesListSelected = (this.speciesListSelected === 'Full List') ? 'Most Recent List' : 'Full List';
  }

}


