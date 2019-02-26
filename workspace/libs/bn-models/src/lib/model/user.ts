/**
 * User class: not clear on how we will deal with Apexuseradmin auth yet.
 * Doesn't extend BoatnetBase
 */
export class User {
  id: string;
  type = 'user';
  token: string; // For authentication via JWT
  username: string;
  password: string;
  pwexpiry: string;
  firstName: string;
  lastName: string;
  roles: any[];
  programs: any[];
}
