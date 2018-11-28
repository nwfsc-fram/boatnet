import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Permit } from './_models/permit';
import { Vessel } from './_models/vessel';
import { Trip } from './_models/trip';
import { User } from './_models/user';
import { AppState } from './_models/app-state';


@Injectable({
  providedIn: 'root'
})
export class StateService {
  static STATE_KEY = 'boatnet-app-state';

  public stateSubject = new Subject<AppState>();

  currentState: AppState;
  
  currentPermit = new BehaviorSubject<Permit>(undefined);
  currentVessel = new BehaviorSubject<Vessel>(undefined);
  currentTrip = new BehaviorSubject<Trip>(undefined);
  currentUser = new BehaviorSubject<User>(undefined)

  headerStatus = new Subject<string>();

  valid_state_names = ['ots-management', 'user-preferences', 'user-management', 'user', 'vessel-management', 'vessel-detail', 'permits-management', 'permit', 'trips', 'trip']

  constructor() { 
    this.currentState = this.loadAppState();
    this.initialize(this.currentState);
  }

  initialize(state) {

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
    } else if ( this.currentState.vessel) {
      this.headerStatus.next(this.currentState.vessel.vessel_name);
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

  setPermit(permit: Permit) {
    this.currentState.permit = permit;
    this.currentPermit.next(this.currentState.permit);
    this.persistAppState();
  }

  setVessel(vessel: Vessel) {
    this.currentState.vessel = vessel;
    this.currentVessel.next(this.currentState.vessel);
    this.persistAppState();
  }

  setTrip(trip: Trip) {
    this.currentState.trip = trip;
    this.currentTrip.next(this.currentState.trip);
    this.persistAppState();
  }

  setUser(user: User) {
    this.currentState.user = user;
    this.currentUser.next(this.currentState.user)
    this.persistAppState()
  }

  clearPermit() {
    this.currentState.permit = undefined;
    this.currentPermit.next(undefined);
    this.persistAppState();
  }

  clearVessel() {
    this.currentState.vessel = undefined;
    this.currentVessel.next(undefined);
    this.persistAppState();
  }

  clearTrip() {
    this.currentState.trip = undefined;
    this.currentTrip.next(undefined);
    this.persistAppState();    
  }

  clearUser() {
    this.currentState.user = undefined;
    this.currentUser.next(undefined);
    this.persistAppState();
  }

  setState(state: AppState) {
    this.currentState = state;
    this.stateSubject.next(this.currentState);
    this.persistAppState();
  }

  /**
   * Get current app state object (observable.)
   */
  getState(): Observable<AppState> {
    return this.stateSubject.asObservable();
  }

}
