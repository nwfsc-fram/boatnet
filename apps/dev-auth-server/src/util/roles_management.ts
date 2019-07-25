// TODO Store these roles elsewhere for prod, this is dev only
const ROLES_READ_ACCESS = ['debriefer', 'captain', 'development_staff', 'data_steward'];

const ROLES_ADMIN_ACCESS = ['development_staff', 'data_steward']; // should also be in ROLES_READ_ACCESS

const AVAILABLE_ROLES  = ['observer', 'debriefer', 'captain', 'permit_owner', 'provider',
    'analyst', 'lab_analyst', 'data_steward', 'enforcement',
    'vessel_owner', 'program_manager', 'gear_technician', 'lead_observer',
    'logistical_admin', 'coordinator', 'trainer', 'reports_user', 'staff',
    'development_staff'];

const authConfig = require('../config/authProxyConfig.json');

// example output from server, for later use
// {"roles": [{"role_name":"STAFF"}]}
// GET_APPLICATION_ROLES
// returns
//  {"roles": [{"role_name":"STAFF"},{"role_name":"CM_COORDINATOR"}]}
 // GET_APPLICATION_USERS
// returns
// {"users": [{"user_id":"john.public"},{"user_id":"test.user"}]}

export function checkRolesRead(roles: string[]) {
    for (let role of roles) {
        if (ROLES_READ_ACCESS.includes(role)) {
            return true;
        }
    }
    return false;
}

export function checkRolesAdmin(roles: string[]) {
    for (let role of roles) {
        if (ROLES_ADMIN_ACCESS.includes(role)) {
            return true;
        }
    }
    return false;
}


export function getAllApplicationUsers(application: string = 'OBSERVER_BOATNET'): string[] {
    const users = [];
    for (let user of authConfig.devUsers) {
        users.push(user.username);
    }
    return users;
}

export function getAllApplicationRoles(application: string = 'OBSERVER_BOATNET'): string[] {
    return AVAILABLE_ROLES;
}