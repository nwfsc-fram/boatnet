import { BoatnetUser } from '@boatnet/bn-auth';

export interface AuthState {
  status: {
    isLoggingIn?: boolean;
    isLoggedIn?: boolean;
    error?: {
      message: string;
    }
  };
  user: BoatnetUser | null;
}
