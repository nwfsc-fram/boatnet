import { Request, Response } from 'express';

import moment from 'moment';
import { checkRolesAdmin, getAllApplicationUsers, getAllApplicationRoles } from '../util/roles_management';

function verifyRoleAdmin(res: any) {
  // get-user.middleware will populate res.user
  // Validate that they have a roles-admin role
  const jwt = res.user;
  if (!jwt) {
    throw new Error('Bearer auth required.');
  }
  const isRolesAdmin = checkRolesAdmin(jwt.roles);
  if (!isRolesAdmin) {
    throw new Error('User is not a roles admin.');
  }
}

export async function users(req: Request, res: any) {

  // get-user.middleware will populate res.user
  try {
    verifyRoleAdmin(res);

    const result = {
      users: getAllApplicationUsers()
    };

    console.log(moment().format(), 'GET users length =', result.users.length);

    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 403,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}

export async function roles(req: Request, res: any) {

  try {
    verifyRoleAdmin(res);

    const result = {
      roles: getAllApplicationRoles()
    };
    console.log(moment().format(), 'GET roles length =', result.roles.length);

    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 403,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}