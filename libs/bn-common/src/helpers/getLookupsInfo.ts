import { pouchService } from '@boatnet/bn-pouch';
import { get } from 'lodash';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';

const db = pouchService.db;

export function formatDisplayValue(row: any, displayFields: any) {
  const listModelName: any = displayFields ? displayFields : [];
  let displayValue = '';
  for (let i: number = 0; i < listModelName.length; i++) {
    displayValue = i < listModelName.length - 1 ?
      (displayValue += get(row, 'doc.' + listModelName[i]) + ' ')
      : listModelName[i] === 'vesselRegistration' ?
        get(row, 'doc.' + 'coastGuardNumber') ?
          displayValue += '/ ' + get(row, 'doc.' + 'coastGuardNumber')
          : displayValue += '/ ' + get(row, 'doc.' + 'stateRegulationNumber')
        : (displayValue += get(row, 'doc.' + listModelName[i]));
  }
  return displayValue;
}

function sortByProperty(array: any, displayFields: any) {
  return array.sort((val1: any, val2: any) => {
    const val1Name = formatDisplayValue(val1, displayFields);
    const val2Name = formatDisplayValue(val2, displayFields);
    if (val1Name > val2Name) {
      return 1;
    } else if (val1Name < val2Name) {
      return -1;
    } else {
      return 0;
    }
  });
}

export async function getOptions(appMode: string, view: string, viewType: string, displayFields: any) {
  return viewType === 'user' ? await getDocByType(appMode, view, displayFields)
    : await getPouchLookupInfo(appMode, view, displayFields);
}

export async function getCouchLookupInfo(appMode: string, designDocName: string, docType: string, displayFields: string[]) {
  const masterDB: Client<any> = couchService.masterDB;
  const queryOptions: ListOptions = {
    key: docType
  };
  const viewName = appMode + '-lookups';

  const results = await masterDB.viewWithDocs<any>(
    designDocName,
    viewName,
    queryOptions
  );
  return sortByProperty(results.rows, displayFields);
}

async function getPouchLookupInfo(appMode: string, docType: string, displayFields: string[]) {
  const pouchDB = pouchService.db;
  const queryOptions = {
    inclusive_end: true,
    ascending: false,
    include_docs: true,
    reduce: false,
    key: docType
  };

  const view = 'LookupDocs/' + appMode + '-lookups';
  const results = await pouchDB.query(
    view,
    queryOptions,
    pouchService.lookupsDBName
  );
  return sortByProperty(results.rows, displayFields);
}

async function getDocByType(appMode: string, type: string, displayFields: any) {
  const designDoc = {
    _id: '_design/docType',
    views: {
      by_type: {
        // @ts-ignore
        map: function (doc) { emit(doc.type); }.toString()
      }
    }
  };
  const queryOptions = {
    inclusive_end: true,
    ascending: false,
    include_docs: true,
    reduce: false,
    key: appMode + '-' + type
  };
  const results: any = await db.query('docType/by_type', queryOptions)
    .catch(async (err: any) => {
      await db.put(designDoc);
      return await db.query('docType/by_type', queryOptions);
    });
  return sortByProperty(results.rows, displayFields);
}
