import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Permit } from '../../_models/permit';
import { Vessel } from '../../_models/vessel';
import { Trip } from '../../_models/trip';
import { User } from '../../_models/user';
import { Message } from '../../_models/message'
import { AppState } from '../../_models/app-state';
import { Program } from '../../_models/program';
import { OtsTarget } from '../../_models/ots-target';
 

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
  currentMessage = new BehaviorSubject<Message>(undefined);
  currentProgram = new BehaviorSubject<Program>(undefined);
  currentOtsTarget = new BehaviorSubject<OtsTarget>(undefined);

  headerStatus = new Subject<string>();

  valid_state_names = ['ots-management', 'ots-target-detail', 'user-config', 'user-management', 'user', 'vessel-management', 'vessel-detail', 'permits-management', 'permit', 'trips', 'trip', 'message-detail']

  constructor() { 
    this.currentState = this.loadAppState();
    this.initialize(this.currentState);
  }

  initialize(state) {
    this.currentProgram.next(this.currentState.program);
    this.currentProgram.subscribe(program => {
      this.currentState.program = program;
      this.persistAppState();
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

  setMessage(message: Message) {
    this.currentState.message = message;
    this.currentMessage.next(this.currentState.message)
    this.persistAppState()
  }

  setProgram(program: Program) {
    this.currentState.program = program;
    this.currentProgram.next(program);
  }

  setOtsTarget(OtsTarget: OtsTarget) {
    this.currentState.otstarget = OtsTarget;
    this.currentOtsTarget.next(OtsTarget)
  }

  clearOtsTarget() {
    this.currentState.otstarget = undefined;
    this.currentOtsTarget.next(undefined);
    this.persistAppState();
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

  clearMessage() {
    this.currentState.message = undefined;
    this.currentMessage.next(undefined);
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
