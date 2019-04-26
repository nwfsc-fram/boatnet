export interface TallyButtonData {
  _id?: string; // DB ID
  // Styling
  color?: string;
  'text-color'?: string;
  blank?: boolean;

  // Data
  code?: string;
  reason?: string;
  count?: number;
}
