import { Action } from '@ngrx/store';
//import { Vessel } from '@boatnet/bn-models';
// TODO: Fix/ use Vessel model instead of any

export enum VesselActionTypes {
  VesselRequested = '[Trips Page] Vessel Requested',
  VesselLoaded = '[Vessel API] Vessel Loaded',
  AllVesselsRequested = '[Trips Page] All Vessels Requested',
  AllVesselsLoaded = '[Vessel API] All Vessels Loaded'
}

export class VesselRequested implements Action {
  readonly type = VesselActionTypes.VesselRequested;
  constructor(public payload: { _id: string }) {}
}

export class VesselLoaded implements Action {
  readonly type = VesselActionTypes.VesselLoaded;
  constructor(public payload: { vessel: any }) {} // TODO Vessel instead of any
}

export class AllVesselsRequested implements Action {
  readonly type = VesselActionTypes.AllVesselsRequested;
}

export class AllVesselsLoaded implements Action {
  readonly type = VesselActionTypes.AllVesselsLoaded;
  constructor(public payload: { vessels: any[] }) {} // TODO Vessel[]
}

export type VesselActions =
  | VesselRequested
  | VesselLoaded
  | AllVesselsRequested
  | AllVesselsLoaded;
