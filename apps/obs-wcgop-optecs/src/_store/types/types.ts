import { BoatnetUser } from '@boatnet/bn-auth';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AuthState {
  status: {
    loggingIn?: boolean;
    loggedIn?: boolean;
  };
  user: BoatnetUser | null;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}
