export const TESTING_123 = 'This is a test';
import moment from 'moment';

export function formatDate(dateStr: string): string {
  return moment(dateStr).format('MM/DD/YY hh:mm');
}

export interface BoatnetExample {
  test: string;
}
