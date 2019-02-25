
import { TripActions, TripActionTypes } from './trip.actions';

export interface State {

}

export const initialState: State = {

};

export function reducer(state = initialState, action: TripActions): State {
  switch (action.type) {

    case TripActionTypes.TripRequested:
      return state;

    default:
      return state;
  }
}
