// Root state for app store
export interface RootState {
  version: string;
}

export interface User {
  user: string;
  token: string;
}

export interface AuthState {
  status: {
    loggingIn?: boolean;
    loggedIn?: boolean;
  };
  user: User | null;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}
