import { EventEmitter, Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { Trip } from '../../_models/wcgop/trip';
import { Haul } from '../../_models/wcgop/haul';
import { AppState } from '../../_models/wcgop/app-state';
import {
  GearType,
  GEAR_TYPE_TRAWL,
  GEAR_TYPE_FG
} from 'fram-models';
import { Program, Species } from 'fram-models';
import { Catch } from 'src/app/_models/wcgop/catch';

/**
 * IObserver state service
 */
export class StateService {
  static STATE_KEY = 'boatnet-app-state';

  public stateSubject = new Subject<AppState>();
  public menuTriggered = new Subject<string>(); // For "show template manager" menu from header

  showHome = true;
  currentState: AppState;

  tabletMode = new BehaviorSubject<boolean>(true);
  headerStatus = new Subject<string>();

  currentTrip = new BehaviorSubject<Trip>(undefined);
  currentHaul = new BehaviorSubject<Haul>(undefined);
  currentProgram = new BehaviorSubject<Program>(undefined);
  currentGearType = new BehaviorSubject<GearType>(GEAR_TYPE_TRAWL);


  valid_state_names = [
    'login',
    'home',
    'trips',
    'trip-edit',
    'hauls',
    'haul-edit',
    'tally',
    'backup',
    'settings'
  ];

  availableGearTypes = <GearType[]>[GEAR_TYPE_TRAWL, GEAR_TYPE_FG];

  constructor() {
    this.currentState = this.loadAppState();
    this.intialize(this.currentState);
  }

  intialize(state) {
    this.currentProgram.next(this.currentState.program);
    this.currentGearType.next(this.currentState.gearType);
    this.currentTrip.next(this.currentState.trip);

    this.currentProgram.subscribe(program => {
      this.currentState.program = program;
      this.persistAppState();
    });
    this.currentGearType.subscribe(gear => {
      this.currentState.gearType = gear;
      this.persistAppState();
    });
    this.currentTrip.subscribe(trip => {
      this.currentState.trip = trip;
    });
  }

  loadAppState(): AppState {
    const loadedState = localStorage.getItem(StateService.STATE_KEY);
    if (loadedState) {
      console.log('Loaded state', loadedState);
      return <AppState>JSON.parse(loadedState);
    } else {
      return new AppState();
    }
  }

  persistAppState() {
    console.log('Save state:', this.currentState);
    this.buildHeaderStatus();
    localStorage.setItem(
      StateService.STATE_KEY,
      JSON.stringify(this.currentState)
    );
  }

  /**
   * Text to display in header bar
   */
  private buildHeaderStatus() {
    if (this.currentState.name === 'tally') {
      this.headerStatus.next('Tally Mode');
    } else if (this.currentState.trip && this.currentState.trip.vessel) {
      this.headerStatus.next(this.currentState.trip.vessel.vessel_name);
    } else {
      this.headerStatus.next('');
    }
  }
  /**
   * Set name of current application state.
   * @param state Name of current app state
   */
  setStateName(state: string) {
    if (this.valid_state_names.includes(state)) {
      this.currentState.name = state;
      this.stateSubject.next(this.currentState);
      this.persistAppState();
    } else {
      throw new Error('Invalid state ignored: ' + state);
    }
  }

  setTrip(trip: Trip) {
    this.currentState.trip = trip;
    this.currentTrip.next(this.currentState.trip);
    this.persistAppState();
  }

  setHaul(haul: Haul) {
    this.currentState.haul = haul;
    this.currentHaul.next(this.currentState.haul);
    this.persistAppState();
  }

  clearTrip() {
    this.currentState.trip = undefined;
    this.currentTrip.next(undefined);
    this.persistAppState();
  }

  clearHaul() {
    this.currentState.haul = undefined;
    this.currentTrip.next(undefined);
    this.persistAppState();
  }

  setProgram(program: Program) {
    this.currentState.program = program;
    this.currentProgram.next(program);
  }

  /**
   * Set entire state. Minimal error checking for now.
   * @param state Full app state object
   */
  setState(state: AppState) {
    this.currentState = state;
    this.stateSubject.next(this.currentState);
    this.persistAppState();
  }

  setTabletMode(mode: boolean) {
    this.tabletMode.next(mode);
  }

  /**
   * Get current app state object (observable.)
   */
  getState(): Observable<AppState> {
    return this.stateSubject.asObservable();
  }
}
