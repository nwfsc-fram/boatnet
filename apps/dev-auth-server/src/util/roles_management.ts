// TODO Store these roles elsewhere for prod, this is dev only
const ROLES_READ_ACCESS = [
  'debriefer',
  'captain',
  'development_staff',
  'data_steward'
];

const ROLES_ADMIN_ACCESS = ['development_staff', 'data_steward']; // should also be in ROLES_READ_ACCESS

const AVAILABLE_ROLES = [
  'observer',
  'debriefer',
  'captain',
  'permit_owner',
  'provider',
  'analyst',
  'lab_analyst',
  'data_steward',
  'enforcement',
  'vessel_owner',
  'program_manager',
  'gear_technician',
  'lead_observer',
  'logistical_admin',
  'coordinator',
  'trainer',
  'reports_user',
  'staff',
  'development_staff'
];

const authConfig = require('../config/authProxyConfig.json');

// example output from server, for later use
// {"roles": [{"role_name":"STAFF"}]}
// GET_APPLICATION_ROLES
// returns
//  {"roles": [{"role_name":"STAFF"},{"role_name":"CM_COORDINATOR"}]}
// GET_APPLICATION_USERS
// returns
// {"users": [{"user_id":"john.public"},{"user_id":"test.user"}]}

export function checkRolesRead(roles: string[], applicationName: string) {
  for (let role of roles) {
    if (ROLES_READ_ACCESS.includes(role)) {
      return true;
    }
  }
  return false;
}

export function checkRolesAdmin(roles: string[], applicationName: string) {
  for (let role of roles) {
    if (ROLES_ADMIN_ACCESS.includes(role)) {
      return true;
    }
  }
  return false;
}

export function getAllApplicationUsers(
  application: string = 'BOATNET_OBSERVER'
): string[] {
  // Dev Mockup
  const users = [];
  for (let user of authConfig.devUsers) {
    if (user.applicationName === application) {
      users.push(user.username);
    }
  }
  if (users.length) {
    return users;
  } else {
    throw new Error('No users for ' + application);
  }
}

export function getAllApplicationRoles(
  application: string = 'BOATNET_OBSERVER'
): string[] {
  // Dev Mockup
  return AVAILABLE_ROLES;
}

export function getUserRoles(
  username: string,
  application: string
): string[] {
  // Dev Mockup
  const userRoles = [];

  for (let user of authConfig.devUsers) {
    console.log(user);
    if (user.username === username && user.applicationName === application) {
      return user.userData.roles;
    }
  }
  throw new Error('[Dev] No such user under ' + application);
}

export function addRole(userRoles: string[], targetRole: any, applicationName: string) {
  if (!userRoles.includes(targetRole)) {
    userRoles.push(targetRole);
  }
}

export function deleteRole(userRoles: string[], targetRole: any, applicationName: string) {
  if (userRoles.includes(targetRole)) {
    userRoles.forEach((item, index) => {
      if (item === targetRole) userRoles.splice(index, 1);
    });
  }
}

export async function getUsersDetails(applicationName: string) {
 // Dev Mockup
 const userDetails = [];

 for (let user of authConfig.devUsers) {
   if ( user.applicationName === applicationName) {
     userDetails.push({
       'user_id': user.username,
       'first_name': 'testing',
       'last_name': 'testing',
       'email_address': 'testing@testing.com',
       'phone': '123-456-1234',
       'org': null,
       'division': 'FRAM'
     })
   }
 }
 if (userDetails.length) {
  return {
    users: userDetails
  }
 } else {
   throw new Error('[Dev] No such users under ' + applicationName);
 }
}