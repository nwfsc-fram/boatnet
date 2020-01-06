import { AuthState, authService } from '@boatnet/bn-auth';

import { mapState } from 'vuex';
import { State, Action, Getter } from 'vuex-class';

import {
    AlertState, GeneralState, PermitState,
    TripState, UserState, VesselState
  } from '../_store/types/types';

import request from 'request';
import moment from 'moment';
import { vessel } from '@/_store/vessel.module';

const jwt = authService.getCurrentUser()!.jwtToken;
const tripsApiUrl = 'https://nwcdevmeow1.nwfsc.noaa.gov:9004/api/v1/trips';

export async function getTrips(query: any, queryValue: any) {
    try {
        // await request.get(
        //     url: tripsApiUrl,
        //     json: true,
        //     headers: {

        //     }, () => {}
        // )
    } catch (err) {
        return err;
    }

}