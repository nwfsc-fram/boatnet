import { BoatnetUser } from '@boatnet/bn-auth';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}
