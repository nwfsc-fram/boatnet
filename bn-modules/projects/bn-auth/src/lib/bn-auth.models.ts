export interface BoatnetUserToken {
  exp: number;
  iat: number;
  sub: BoatnetUser;
}

export interface BoatnetUser {
  username: string;
  hashedPW: string;
  roles: string[];
  couchDBInfo: {
    urlRoot: string;
    userDB: string;
    readonlyDB: string;
  };
}
