// Root state for app store
export interface RootState {
  version: string;
}

export interface User {
  user: string;
  token: string;
}

export interface AccountState {
  status: {
    loggingIn?: boolean;
    loggedIn?: boolean
  };
  user: User | null;
}
