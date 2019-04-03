import { BoatnetUser } from '@boatnet/bn-auth';
import { CouchDBCredentials } from '@boatnet/bn-couch';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}
