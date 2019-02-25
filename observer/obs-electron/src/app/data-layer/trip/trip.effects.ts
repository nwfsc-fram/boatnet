import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';



import { TripActionTypes } from './trip.actions';

@Injectable()
export class TripEffects {


  @Effect()
  loadTrips$ = this.actions$.pipe(ofType(TripActionTypes.TripRequested));


  constructor(private actions$: Actions) {}

}
