import { BoatnetUser } from '@boatnet/bn-auth';

export interface AuthState {
  status: {
    isLoggingIn?: boolean;
    isLoggedIn?: boolean;
  };
  user: BoatnetUser | null;
}
