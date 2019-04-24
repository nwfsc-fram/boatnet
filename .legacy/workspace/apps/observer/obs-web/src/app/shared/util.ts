// General utility functions can go here
/**
 * Extract last piece of a url to get database name
 * @param url url to database
 */

import * as moment from 'moment';

export function parseDBName(url: string): string {
  if (url.includes('/')) {
    const last_slash = url.lastIndexOf('/');
    return url.substring(Math.min(last_slash + 1, url.length));
  }
}

/**
 * Boatnet Date Utility functions
 */

export function getBoatnetDateFormatNow(dateFormat: string): BoatnetDate {
  return moment().format(dateFormat);
}

export function getBoatnetDateTimeNow(): BoatnetDate {
  return moment().format();
}

export function getBoatnetDateNow(): BoatnetDate {
  return moment()
    .format()
    .substr(0, 10);
}
