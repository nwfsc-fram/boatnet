export interface BoatnetUserToken {
  exp: number;
  iat: number;
  sub: BoatnetUser;
}

export interface CouchDBInfo {
  urlRoot: string;
  userDB: string;
  readonlyDB: string;
}

export interface BoatnetUser {
  username: string;
  hashedPW: string;
  roles: string[];
  couchDBInfo: CouchDBInfo;
}
