import { authService } from '@boatnet/bn-auth';

import request from 'request';
import moment from 'moment';
import { WcgopTrip } from '@boatnet/bn-models/lib';

const jwt = authService.getCurrentUser() ? authService.getCurrentUser()!.jwtToken : '';

const tripsApiBaseUrl = authService.getTripsApiUrl() ? authService.getTripsApiUrl() : '';
const tripsApiUrl = tripsApiBaseUrl + '/api/v1/trips';
const catchApiUrl = tripsApiBaseUrl + '/api/v1/tripCatch';
const cruiseApiUrl = tripsApiBaseUrl + '/api/v1/cruise';

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

export function newCruiseApiTrip(newCruise: any) {
    return newDeployment(newCruise, cruiseApiUrl);
}

export function newTripsApiTrip(newTrip: any) {
    return newDeployment(newTrip, tripsApiUrl);
}

// calls newTrip or newCruise API
function newDeployment(deployment: any, url: string) {
    return new Promise( (resolve, reject) => {
        request.post(
            {
                url,
                json: true,
                headers: {
                    authorization: 'Token ' + jwt,
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
        tripsApiTrip.departurePort = activeTrip!.departurePort.name;
        tripsApiTrip.departureDate = activeTrip!.departureDate;
        tripsApiTrip.returnPort = activeTrip!.returnPort.name;
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

export function newApiCatch(tripCatch: any) {
    return new Promise(async (resolve, reject) => {
        const queryUrl = catchApiUrl + '/' + parseInt(tripCatch.tripNum, 10);
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + jwt,
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
        const queryUrl = catchApiUrl + '/' + parseInt(tripCatch.tripNum, 10);
        request.put(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + jwt,
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
