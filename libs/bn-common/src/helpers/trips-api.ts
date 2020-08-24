import { authService } from '@boatnet/bn-auth';

import request from 'request';
import moment from 'moment';
import { WcgopTrip } from '@boatnet/bn-models/lib';
import _ from 'lodash';

function getJwt() {
    return authService.getCurrentUser()!.jwtToken;
}

function getTripsApiUrl() {
    return authService.getTripsApiUrl() + '/api/v1/trips';
}
function getCatchApiUrl() {
    return authService.getTripsApiUrl() + '/api/v1/tripCatch';
}
function getCruiseApiUrl() {
    return authService.getTripsApiUrl() + '/api/v1/cruise';
}

function getEmailUrl() {
    return authService.getTripsApiUrl() + '/api/v1/email';
}

export function getTripsApiTrips(query?: any, queryValue?: any) {
    let formattedQuery = '';
    if (query) {
        formattedQuery = '?' + query + '=' + queryValue;
    }
    return new Promise( (resolve, reject) => {
        const queryUrl = getTripsApiUrl() + formattedQuery;
        request.get(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt()
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
        const queryUrl = getTripsApiUrl() + '/' + parseInt(tripNum, 10);
        request.get(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt()
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
        const queryUrl = getCatchApiUrl() + '/' + parseInt(tripNum, 10);
        request.get(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt()
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

export function newCruiseApiTrip(newCruise: any) {
    return newDeployment(newCruise, getCruiseApiUrl());
}

export function newTripsApiTrip(newTrip: any) {
    return newDeployment(newTrip, getTripsApiUrl());
}

// calls newTrip or newCruise API
function newDeployment(deployment: any, url: string) {
    return new Promise( (resolve, reject) => {
        request.post(
            {
                url,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt(),
                },
                body: deployment
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
        const queryUrl = getTripsApiUrl() + '/' + activeTrip.tripNum;

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
        tripsApiTrip.departurePort = activeTrip!.departurePort.name;
        tripsApiTrip.departureDate = activeTrip!.departureDate;
        tripsApiTrip.returnPort = activeTrip!.returnPort.name;
        tripsApiTrip.returnDate = activeTrip!.returnDate;

        request.put(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt(),
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

export function newApiCatch(tripCatch: any) {
    return new Promise(async (resolve, reject) => {
        const queryUrl = getCatchApiUrl() + '/' + parseInt(tripCatch.tripNum, 10);
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt(),
                },
                body: tripCatch
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

export function updateApiCatch(tripCatch: any) {
    return new Promise(async (resolve, reject) => {
        const queryUrl = getCatchApiUrl() + '/' + parseInt(tripCatch.tripNum, 10);
        request.put(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt(),
                },
                body: tripCatch
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

export function emailCoordinators(trip: any, emailType: any) { // emailType - 'NEW', 'UPDATE', 'MISSED TRIP'
    const payload = _.cloneDeep(trip);
    payload.emailType = emailType;
    return new Promise(async (resolve, reject) => {
        const queryUrl = getEmailUrl();
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt(),
                },
                body: payload,
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