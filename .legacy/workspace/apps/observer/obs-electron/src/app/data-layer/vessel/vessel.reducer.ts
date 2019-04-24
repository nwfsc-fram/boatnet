import { VesselActions, VesselActionTypes } from './vessel.actions';
// import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

// export interface VesselsState extends EntityState<any> {
//   // TODO Vessel
//   allVesselsLoaded: boolean;
// }

export interface VesselsState {
  vessels: any[];
}

export const initialVesselsState: VesselsState = {
  vessels: [{ vessel_name: 'testing' }]
};

// export const adapter: EntityAdapter<any> = createEntityAdapter<any>(); // TODO Vessel

// export const initialVesselsState: VesselsState = adapter.getInitialState({
//   allVesselsLoaded: false
// });

export function reducer(
  state = initialVesselsState,
  action: VesselActions
): VesselsState {
  switch (action.type) {
    case VesselActionTypes.AllVesselsLoaded:
      // return adapter.addAll(action.payload.vessels, {
      //   ...state,
      //   allVesselsLoaded: true
      // });
      return action.payload;

    default:
      return state;
  }
}

// export const {
//   selectAll,
//   selectEntities,
//   selectIds,
//   selectTotal
// } = adapter.getSelectors();
