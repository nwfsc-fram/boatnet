import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of as observableOf } from 'rxjs';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { User } from '../_models/shared/user';
import { AppConfig } from '../_models/shared/app-config';
import { Categories, Programs, GearTypes, Settings } from '../settings';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  static STATE_KEY = 'boatnet-app-state';

  // Settings
  tabletMode = new BehaviorSubject<boolean>(true);

  // Config
  appConfigObject = new AppConfig();
  appConfig = new BehaviorSubject<AppConfig>(undefined);
  category = new BehaviorSubject<Categories>(undefined);
  program = new BehaviorSubject<Programs>(undefined);
  gearType = new BehaviorSubject<GearTypes>(undefined);
  weightMethods = new BehaviorSubject<any>(undefined);

  // Program Type

  // tripType = new BehaviorSubject<any>(undefined);
  // haulType = new BehaviorSubject<any>(undefined);
  // catchType = new BehaviorSubject<any>(undefined);
  // specimenType = new BehaviorSubject<any>(undefined);
  // specialProjectType = new BehaviorSubject<any>(undefined);

  // States
  currentUser: User;
  currentScreen = new BehaviorSubject<string>(undefined);
  currentHaul = new BehaviorSubject<any>(undefined);
  currentCatch: string;
  currentSpecimen: string;
  haulNumber = new BehaviorSubject<string>('');
  speciesListShown = new BehaviorSubject<boolean>(false);
  speciesFilter = new BehaviorSubject<string>('');

  constructor(private router: Router) {
    this.category.next(Categories.Observer);
    this.program.next(Programs.WCGOP);
    this.gearType.next(GearTypes.Trawl);
    this.setAppConfig();
    this.setWeightMethods();

    router.events.subscribe( (event: Event) => {
      if (event instanceof NavigationStart) {
          // Show loading indicator
          // const temp = this.speciesList.filter(species => species.toLowerCase().indexOf(value.toLowerCase()) === 0);
          const tempUrl = event.url.replace('/', '');
          const urlIndex = router.config.findIndex(item => item['path'] === tempUrl);
          console.log('url = ' + urlIndex + ', item is: ' + JSON.stringify(router.config[urlIndex]));
          console.log('router = ' + JSON.stringify(router.config));
          router.config['data'] = 'here is some data';
          console.log('router = ' + JSON.stringify(router.config));
      }
      if (event instanceof NavigationEnd) {
          // Hide loading indicator
          console.log('currentScreen: ' + this.formatScreen(event.url.replace('/', '')));

          this.currentScreen.next(this.formatScreen(event.url.replace('/', '')));
      }
      if (event instanceof NavigationError) {
          // Hide loading indicator
          // Present error to user
          console.log(event.error);
      }
    });
  }
  setCategory(value: string) {
    switch (value) {
      case 'observer':
        this.category.next(Categories.Observer);
        break;
      case 'survey':
        this.category.next(Categories.Survey);
        break;
    }
  }
  setProgram(value: string) {
    switch (value) {
      case 'wcgop':
        this.program.next(Programs.WCGOP);
        break;
      case 'ashop':
        this.program.next(Programs.ASHOP);
        break;
      case 'trawl':
        this.program.next(Programs.Trawl);
        break;
      case 'hookandline':
        this.program.next(Programs.HookAndLine);
        break;
      case 'hake':
        this.program.next(Programs.Hake);
        break;
    }
  }
  setGearType(value: string) {
    switch (value) {
      case 'trawl':
        this.gearType.next(GearTypes.Trawl);
        break;
      case 'fixedgear':
        this.gearType.next(GearTypes.FixedGear);
        break;
    }
  }
  setAppConfig(category?: string, program?: string, gearType?: string) {
    if (category) { this.setCategory(category); }
    if (program) { this.setProgram(program); }
    if (gearType) { this.setGearType(gearType); }
    this.appConfigObject.configureApp(this.category.getValue(), this.program.getValue());
    this.appConfig.next(this.appConfigObject);
  }
  setWeightMethods() {
    if (this.gearType.getValue() === GearTypes.Trawl) {
      this.weightMethods.next([
        {label: 1, value: 'Actual Weight'},
        {label: 3, value: 'Basket Weight Determination'},
        {label: 5, value: 'OTC - Retained'},
        {label: 6, value: 'Other'},
        {label: 7, value: 'Vessel Estimate'},
        {label: 8, value: 'Extrapolation'},
        {label: 9, value: 'PHLB - Length/Weight'},
        {label: 14, value: 'Visual Experience'},
        {label: 15, value: 'Visual Spatial'},
        {label: 19, value: 'PHLB Length Weight Extrapolation'},
        {label: 20, value: 'Census'}
      ]
    );
      //   {1: 'Actual Weight', 3: 'Basket Weight Determination',
      //   5: 'OTC - Retained', 6: 'Other', 7: 'Vessel Estimate',
      //   8: 'Extrapolation', 9: 'PHLB - Length/Weight',
      //   14: 'Visual Experience', 15: 'Visual Spatial',
      //   19: 'PHLB Length Weight Extrapolation'}
      // );
    } else if (this.gearType.getValue() === GearTypes.FixedGear) {
      this.weightMethods.next(
        {6: 'Other', 9: 'PHLB - Length/Weight', 13: 'Tally Sample',
        14: 'Visual Experience', 19: 'PHLB Length Weight Extrapolation'}
      );
    }
  }
  showSpeciesList(mode: boolean) {
    this.speciesListShown.next(mode);
  }
  filterSpecies(value: string) {
    this.speciesFilter.next(value);
  }
  formatScreen(screen: string) {
    const tmp = screen.replace(/([A-Z])/g, ' $1');
    return tmp.replace(/^./, function(str) { return str.toUpperCase(); });
  }
  getScreen() {
    return this.currentScreen.getValue();
  }
  setTabletMode(mode: boolean) {
    this.tabletMode.next(mode);
  }

  // TODO - Todd - replace any with a list of the valid haul types
  setHaul(haul: any) {
    this.currentHaul.next(haul);
    this.haulNumber.next(this.currentHaul.getValue().haulNumber);
  }
  clearHaul() {
    this.currentHaul.next(undefined);
    this.persistAppState();
  }
  // loadAppState(): AppState {
  //   const loadedState = localStorage.getItem(StateService.STATE_KEY);
  //   if (loadedState) {
  //     console.log('Loaded state', loadedState);
  //     return <AppState>JSON.parse(loadedState);
  //   } else {
  //     return new AppState();
  //   }
  // }
  persistAppState() {
    console.log('Saving the state: ' + this);
    localStorage.setItem(StateService.STATE_KEY, JSON.stringify(this));
  }
}
