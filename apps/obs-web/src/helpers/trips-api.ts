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
import { WcgopTrip } from '@boatnet/bn-models/lib';

const jwt = authService.getCurrentUser() ? authService.getCurrentUser()!.jwtToken : '';

const tripsApiUrl = 'https://nwcdevmeow1.nwfsc.noaa.gov:9004/api/v1/trips';

export function getTripsApiTrips(query?: any, queryValue?: any) {
    let formattedQuery = '';
    if (query) {
        formattedQuery = '?' + query + '=' + queryValue;
    }
    return new Promise( (resolve, reject) => {
        const queryUrl = tripsApiUrl + formattedQuery;
        request.get(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + jwt
                }
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(err);
                }
            }
        );
    });
}

export function getTripsApiTrip(tripNum: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = tripsApiUrl + '/' + parseInt(tripNum, 10);
        request.get(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + jwt
                }
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(err);
                }
            }
        );
    });
}

export function newTripsApiTrip(newTrip: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = tripsApiUrl;
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + jwt,
                },
                body: newTrip
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(err);
                }
            }
        );
    });
}

export function updateTripsApiTrip(activeTrip: any) {
    return new Promise(async (resolve, reject) => {

        const tripsApiTrip: any = await getTripsApiTrip(activeTrip.tripNum);
        const queryUrl = tripsApiUrl + '/' + activeTrip.tripNum;

        if (!tripsApiTrip.changeLog) { tripsApiTrip.changeLog = []; }

        tripsApiTrip.changeLog.push({
            changedBy: authService.getCurrentUser()!.username,
            changedDate: moment().format(),
            previousDeparturePort: tripsApiTrip.departurePort,
            previousDepartureDate: tripsApiTrip.departureDate,
            previousReturnPort: tripsApiTrip.returnPort,
            previousReturnDate: tripsApiTrip.returnDate
        });

        tripsApiTrip.updatedBy = authService.getCurrentUser()!.username;
        tripsApiTrip.updatedDate = moment().format();
        tripsApiTrip.departurePort = activeTrip!.departurePort;
        tripsApiTrip.departureDate = activeTrip!.departureDate;
        tripsApiTrip.returnPort = activeTrip!.returnPort;
        tripsApiTrip.returnDate = activeTrip!.returnDate;

        request.put(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + jwt,
                },
                body: tripsApiTrip
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(err);
                }
            }
        );
    });
}

export function compareTrips(tripsApiTrip: any, currentTrip: WcgopTrip) {
    if (moment(tripsApiTrip.departureDate).isSame(currentTrip.departureDate, 'day')
    && moment(tripsApiTrip.returnDate).isSame(currentTrip.returnDate, 'day')
    && tripsApiTrip.vesselId === currentTrip.vesselId
    )   {
        return true;
    }   else {
        return false;
    }
}
