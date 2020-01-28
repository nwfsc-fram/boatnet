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

// const jwt = authService.getCurrentUser() ? authService.getCurrentUser()!.jwtToken : '';
const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODAxNjA3ODgsImV4cCI6MTU4MDc2NTU4OCwic3ViIjoie1widXNlcm5hbWVcIjpcInNldGguZ2Vyb3VcIixcImFwcGxpY2F0aW9uTmFtZVwiOlwiQk9BVE5FVF9PQlNFUlZFUlwiLFwicm9sZXNcIjpbXCJkZWJyaWVmZXJcIixcIm9ic2VydmVyXCIsXCJkZXZlbG9wbWVudF9zdGFmZlwiLFwiY2FwdGFpblwiXSxcImNvdWNoREJJbmZvXCI6e1widXJsUm9vdFwiOlwiaHR0cHM6Ly9ud2NkZXZmcmFtMi5ud2ZzYzIubm9hYS5nb3Y6Njk4NFwiLFwibG9va3Vwc0RCXCI6XCJsb29rdXBzLWRldlwiLFwibWFzdGVyREJcIjpcIm1hc3Rlci1kZXZcIixcInVzZXJEQlwiOlwidXNlcmRiLTczNjU3NDY4MmU2NzY1NzI2Zjc1XCJ9LFwiaGFzaGVkUFdcIjpcImRiYTgwZDNlNWYyNzMzODdmM2EzOTI1YWJiNzQwOGNlYTljMGY1YWN8YjhiNDBkNDIwMWVlYzdiYmQyNmRlZDFiOWQ5OGQwMzA5MjQ0MDBmNzZmNWJhZGMyMDcyNjdkOGEwMTFlOTMzNzFjMjY2NGRlYzYxZTAwMmM2OTY4OTk0MTFjYTM1Y2YyNDBlNDMyN2Q0NmQyMmRlZTgyMjQ5ZjVmZGEyZjY3YTBcIn0ifQ.VzR6gm-fzpPbCsN8h7SK-kUCv9qvGZ7sz-EKwvBlZUZh_ZvIMzem5TwfgaKKLNEeoHQKj3Aiftt_X4pENoDArTaKtYVA0vx8h5GmBL-AGICkVWeWHI9pslBxlKmf4mYLOsT9w9mojmcMavAvMbciIBUMJBC16fl1L-XsOYla8vzktMx_I25GuywNw9umgm4cGbzbMHpplzeU6bj47P78RpvpHyEGuln4HLpTbE0aVYPgDvYl1d2-KLS5RS8CQe7wlDEIiZPSmw37phtns95nVAIeALaSypEMpJiOsxpgPBLZ_mzINZU1hTLdPLGa3ZZ77eeXMu6-UGieE7AqJOPdxA";

const tripsApiUrl = 'https://nwcdevmeow1.nwfsc.noaa.gov:9004/api/v1/trips';
const catchApiUrl = 'https://nwcdevmeow1.nwfsc.noaa.gov:9004/api/v1/tripCatch';

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
                    reject(response);
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

export function getCatchApiCatch(tripNum: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = catchApiUrl + '/' + parseInt(tripNum, 10);
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
