export interface BoatnetUser {
  user: string;
  roles: string[];
  couchDBInfo: {
    urlRoot: string;
    userDB: string;
    readonlyDB: string;
  };
}
