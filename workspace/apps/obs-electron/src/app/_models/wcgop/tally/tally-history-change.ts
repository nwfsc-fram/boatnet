export interface TallyHistoryChange {
  time: string;
  code: string;
  type: string;
  delta: number;
  newValue: number;
}
