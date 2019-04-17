import { CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials } from '@boatnet/bn-couch';


export interface PouchDBSyncStatus {
  syncActive: boolean;
  error?: string;
}

export interface PouchDBState {
  credentials: CouchDBCredentials | null;
  syncStatus: PouchDBSyncStatus;
}
