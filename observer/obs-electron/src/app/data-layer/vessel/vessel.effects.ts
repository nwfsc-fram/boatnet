import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import {
  VesselActionTypes,
  VesselActions,
  AllVesselsLoaded
} from './vessel.actions';
import { DataService } from 'src/app/_services/data/data.service';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class VesselEffects {

  @Effect()
  loadAllVessels$ = this.actions$.pipe(
    ofType(VesselActionTypes.AllVesselsRequested),
    mergeMap(() =>
      this.dataService.getVessels().pipe(
        map(vessels => {
          console.log('Loading Vessels...');
          return new AllVesselsLoaded({ vessels });
        }),
        catchError(err => {
          console.log('error loading all Vessels ', err);
          return throwError(err);
        })
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dataService: DataService,
    private vesselActions: VesselActions
  ) {}
}
