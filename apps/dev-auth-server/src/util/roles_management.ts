// TODO Store these roles elsewhere for prod, this is dev only
const ROLES_ALLOWED_ACCESS = ['debriefer', 'captain', 'development_staff', 'data_steward'];


export function checkRolesAdmin(roles: string[]) {
    for (let role of roles) {
        if (ROLES_ALLOWED_ACCESS.includes(role)) {
            return true;
        }
    }
    return false;
}