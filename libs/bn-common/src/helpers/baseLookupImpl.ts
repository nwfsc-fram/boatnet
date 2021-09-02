import { get, orderBy } from 'lodash';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { mongoRead } from './trips-api';
import { dbConfig } from './config';
import { Base } from './base';
interface CouchInfo {
    view: string,
    label: string,
    value: string,
    displayCode?: string,
    queryOptions?: any
}

interface MongoInfo {
    collection: string,
    label: string,
    value: string,
    displayCode?: string
}

export class BaseLookupInfo extends Base {
    constructor(type: string) {
        super(type);
    }
    
    async getLookups(couchInfo: CouchInfo, mongoInfo: MongoInfo, showCodes?: boolean) {
        let options: any[] = [];
        let queryResults: any = [];

        try {
            queryResults = await mongoRead('boatnetdb', 'lookups', mongoInfo.collection);
            const displayCode: string = get(mongoInfo, 'displayCode', '');
            for (const option of queryResults) {
                options.push({
                    label: showCodes ? get(option, displayCode, '') : get(option, mongoInfo.label),
                    value: mongoInfo.value ? get(option, mongoInfo.value) : option
                });
            }
        } catch(err) {
            const masterDB: Client<any> = couchService.masterDB;
            const displayCode: string = get(couchInfo, 'displayCode', '');
            const optionsList: any = await masterDB.viewWithDocs('obs_web', couchInfo.view, couchInfo.queryOptions);
            for (const option of optionsList.rows) {
                options.push({
                    label: showCodes ? get(option, displayCode, '') : get(option, couchInfo.label),
                    value: get(option, couchInfo.value)
                });
            }
        }        
        options = orderBy(options, 'label');
        return options;
      }
}

export const baseLookupInfoo = new BaseLookupInfo(dbConfig.type);