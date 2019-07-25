import { Request, Response } from 'express';

import moment from 'moment';
import { checkRolesRead, getAllApplicationUsers, getAllApplicationRoles, checkRolesAdmin } from '../util/roles_management';

function verifyRoleRead(res: any) {
  // get-user.middleware will populate res.user
  // Validate that they have a roles-admin role
  const jwt = res.user;
  if (!jwt) {
    throw new Error('Bearer auth required.');
  }
  const isRolesAdmin = checkRolesRead(jwt.roles);
  if (!isRolesAdmin) {
    throw new Error('User has no roles access.');
  }
}

function verifyRoleAdmin(res: any) {
  // get-user.middleware will populate res.user
  // Validate that they have a roles-admin role
  const jwt = res.user;
  if (!jwt) {
    throw new Error('Bearer auth required.');
  }
  const isRolesAdmin = checkRolesAdmin(jwt.roles);
  if (!isRolesAdmin) {
    throw new Error('User has no roles admin access.');
  }
}

export async function users(req: Request, res: any) {

  // get-user.middleware will populate res.user
  try {
    verifyRoleRead(res);

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
    verifyRoleRead(res);

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