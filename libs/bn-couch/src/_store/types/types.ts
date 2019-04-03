import { CouchDBInfo } from '@boatnet/bn-auth';

export interface CouchDBCredentials {
  dbInfo: CouchDBInfo;
  userCredentials: {
    username: string;
    password: string;
  };
}

export interface CouchDBState {
  credentials: CouchDBCredentials | null;
}
