import { Action } from '@ngrx/store';

export enum TripActionTypes {
  TripRequested = '[Trips Page] Edit Trip',
  TripLoaded = '[Trip DB API] Trip Loaded',
  AllTripsRequested = '[Trips Page] All Trips Requested',
  AllTripsLoaded = '[Trip DB API] All Trips Loaded',
  TripSaved = '[Edit Trip Page] Trip Saved'
}

export class TripRequested implements Action {
  readonly type = TripActionTypes.TripRequested;
  constructor(public payload: { _id: string }) {

  }
}


export type TripActions = TripRequested;
