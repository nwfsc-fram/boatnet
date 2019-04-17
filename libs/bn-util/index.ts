import moment from 'moment';

export function shortFormatDate(dateStr: string): string {
  return moment(dateStr).format('MM/DD/YY hh:mm');
}

export function formatDate(dateStr: string): string {
  return moment(dateStr).format('LLL');
}

export interface BoatnetExample {
  test: string;
}
