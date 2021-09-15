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
function getEvalCatchUrl() {
    return authService.getTripsApiUrl() + '/api/v1/evalCatch';
}
function getCruiseApiUrl() {
    return authService.getTripsApiUrl() + '/api/v1/cruise';
}

function getEmailUrl() {
    return authService.getTripsApiUrl() + '/api/v1/email';
}

function getSelectionsUrl() {
    return authService.getTripsApiUrl() + '/api/v1/getSelections';
}

function getWaiversUrl() {
    return authService.getTripsApiUrl() + '/api/v1/getWaivers';
}

function getFishTicketUrl() {
    return authService.getTripsApiUrl() + '/api/v1/getFishTicket';
}

function getVesselFishTicketUrl() {
    return authService.getTripsApiUrl() + '/api/v1/getVesselFishTickets';
}

function getOracleTripsUrl() {
    return authService.getTripsApiUrl() + '/api/v1/getOracleTrips';
}

function getTripsApiMongoUrl() {
    return authService.getTripsApiUrl() + '/api/v1/mongo';
}

export function getEmLookups() {
    const queryUrl = authService.getTripsApiUrl() + '/em-lookups';
    return new Promise( (resolve, reject) => {
        request.get(
            {
                url: queryUrl,
                json: false,
                headers: {
                }
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });
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
                    reject(body);
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
                    reject(body);
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
                    reject(body);
                }
            }
        );
    });
}

export function evalCatch(tripNum: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = getEvalCatchUrl() + '/' + parseInt(tripNum, 10);
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
                    reject(body);
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
                    reject(body);
                }
            }
        );
    });
}

export function updateTripsApiTrip(activeTrip: any) {
    return new Promise(async (resolve, reject) => {

        const tripsApiTrip: any = await getTripsApiTrip(activeTrip.tripNum);
        const queryUrl = getTripsApiUrl() + '/' + activeTrip.tripNum;

        request.put(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt(),
                },
                body: activeTrip
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
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
                    reject(body);
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
                    reject(body);
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
                    reject(body);
                }
            }
        );
    });
}

export function mongoRead(database: any, collection: string, query: any, options?: any) {
    return new Promise( (resolve, reject) => {
        const queryOptions = options ? options : {};
        const payload: any = {
            query,
            options: queryOptions
        };
        const queryUrl = getTripsApiMongoUrl() + '/' + database + '/' + collection;
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    'authorization': 'Token ' + getJwt(),
                    'Content-Type': 'application/json'
                },
                body: payload
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });
};

export function mongoAggregate(database: any, collection: string, pipeline: any) {
    return new Promise( (resolve, reject) => {
        const payload = {pipeline};
        const queryUrl = getTripsApiMongoUrl() + '/aggregate/' + database + '/' + collection;
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    'authorization': 'Token ' + getJwt(),
                    'Content-Type': 'application/json'
                },
                body: payload
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });

    // example query:
    // const result = await mongoAggregate(
    //     'boatnetdb',
    //     'lookups.beauforts',
    //     [
    //         {$match: {isActive: true}},
    //         {$limit: 3}
    //     ]
    // );
    // console.log(result);
};

export function mongoGetOne(database: any, collection: string, id: string) {
    return new Promise( (resolve, reject) => {
        const queryUrl = getTripsApiMongoUrl() + '/get/' + database + '/' + collection + '/' + id;
        request.get(
            {
                url: queryUrl,
                json: true,
                headers: {
                    'authorization': 'Token ' + getJwt(),
                    'Content-Type': 'application/json'
                }
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });

    // example query:
    // const getOneResult = await mongoGetOne(
    //     'boatnetdb',
    //     'trips_api.trips',
    //     "612515f92feb772abc836e6c"
    // )
    // console.log(getOneResult);
};

export function mongoGetMany(database: any, collection: string, ids: string[]) {
    return new Promise( (resolve, reject) => {
        const queryUrl = getTripsApiMongoUrl() + '/getMany/' + database + '/' + collection + '/';
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    'authorization': 'Token ' + getJwt(),
                    'Content-Type': 'application/json'
                },
                body: {
                    ids
                }
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });

    // example query:
    // const getManyResult = await mongoGetMany(
    //     'boatnetdb',
    //     'trips_api.trips',
    //     ["612515f92feb772abc836e6c"]
    // )
    // console.log(getManyResult)
};

export function mongoWrite(documents: object[]) {
    return new Promise( (resolve, reject) => {
        const queryUrl = getTripsApiMongoUrl();
        request.post(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt()
                },
                body: documents
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });
}

export function mongoUpdate(document: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = getTripsApiMongoUrl();
        request.put(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt()
                },
                body: document
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });
}

export function mongoDelete(document: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = getTripsApiMongoUrl();
        request.delete(
            {
                url: queryUrl,
                json: true,
                headers: {
                    authorization: 'Token ' + getJwt()
                },
                body: document
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });
}

export function getSelections(query?: any, queryValue?: any) {
    let formattedQuery = '';
    if (query) {
        formattedQuery = '?' + query + '=' + queryValue;
    }
    return new Promise( (resolve, reject) => {
        const queryUrl = getSelectionsUrl() + formattedQuery;
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
                    reject(body);
                }
            }
        );
    });
}

export function getOracleWaivers(year: any, vesselId?: any) {
    let formattedQuery = '';
    if (vesselId) {
        formattedQuery = '?year=' + year + '&vesselId=' + vesselId;
    } else {
        formattedQuery = '?year=' + year;
    }
    return new Promise( (resolve, reject) => {
        const queryUrl = getWaiversUrl() + formattedQuery;
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
                    reject(body);
                }
            }
        );
    });
}

export function getFishTicket(ftid: any) {
    const formattedQuery = '?ftid=' + ftid;
    return new Promise( (resolve, reject) => {
        const queryUrl = getFishTicketUrl() + formattedQuery;
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
                    reject(body);
                }
            }
        );
    });
}

export function getVesselFishTickets(vesselId: any, startDate: any, endDate: any) {

    const formattedQuery = '?vesselId=' + vesselId + '&startDate=' + moment(startDate).format('YYYY-MM-DD') + '&endDate=' + moment(endDate).format('YYYY-MM-DD');
    return new Promise( (resolve, reject) => {
        const queryUrl = getVesselFishTicketUrl() + formattedQuery;
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
                    reject(body);
                }
            }
        );
    });
}

export function getOracleTrips(vesselId: any, startDate: any, endDate: any) {

    const formattedQuery = '?vesselId=' + vesselId + '&startDate=' + moment(startDate).format() + '&endDate=' + moment(endDate).format();
    return new Promise( (resolve, reject) => {
        const queryUrl = getOracleTripsUrl() + formattedQuery;
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
                    reject(body);
                }
            }
        );
    });
}

export function checkVesselPasscode(vesselId: any, passcode: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = 'https://nwcdevmeow1.nwfsc.noaa.gov:9004/api/v1/vms/check?vesselId=' + vesselId.toString() + '&passcode=' + passcode.toString();
        request.get(
            {
                url: queryUrl,
                headers: {}
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });
}

export function getDeclarations(vesselId: any) {
    return new Promise( (resolve, reject) => {
        const queryUrl = 'https://nwcdevmeow1.nwfsc.noaa.gov:9004/api/v1/vms/getDeclarations?vesselId=' + vesselId.toString();
        request.get(
            {
                url: queryUrl,
                headers: {
                    authorization: 'Token ' + getJwt()
                }
            }, (err: any, response: any, body: any) => {
                if (!err && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            }
        );
    });
}