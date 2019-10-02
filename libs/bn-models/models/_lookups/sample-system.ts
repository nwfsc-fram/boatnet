import { Base } from '../_base';

export const SampleSystemTypeName = 'sample-system';

export interface SampleSystem extends Base {
  description?: string;

  legacy?: {
    sampleSystemCode?: number;
  };
}
