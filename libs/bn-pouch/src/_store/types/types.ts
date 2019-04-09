import { CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials } from '@boatnet/bn-couch';

export interface PouchDBState {
  credentials: CouchDBCredentials | null;
}
