import { Request, Response } from 'express';

import moment from 'moment';
import { checkRolesRead, getAllApplicationUsers, getAllApplicationRoles, checkRolesAdmin, getUserRoles } from '../util/roles_management';

function verifyRoleRead(res: any) {
  // get-user.middleware will populate res.user
  // Validate that they have a roles-admin role
  const jwt = res.user;
  if (!jwt) {
    throw new Error('Bearer auth required.');
  }
  console.log('JWT', jwt)
  const isRolesAdmin = checkRolesRead(jwt.roles, jwt.applicationName);
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
  const isRolesAdmin = checkRolesAdmin(jwt.roles, 'OBSERVER_BOATNET');
  if (!isRolesAdmin) {
    throw new Error('User has no roles admin access.');
  }
}

export async function getAllUsers(req: Request, res: any) {

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

export async function getAllRoles(req: Request, res: any) {

  try {
    verifyRoleRead(res);

    const result = {
      roles: getAllApplicationRoles()
    };
    console.log(moment().format(), 'GET roles length =', result.roles.length);

    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}

export async function addUser(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);
    const result = {
      username: req.body.username
    };
    console.log(moment().format(), '[Dev- fake] Add User', result.username);
    // Doesn't actually create user for Dev

    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}

export async function deleteUser(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);
    const result = {
      username: req.body.username
    };
    console.log(moment().format(), '[Dev- fake] Delete User', result.username);
    // Doesn't actually delete user for Dev
    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}

export async function getUserRole(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);

    let userRoles: string[] = [];
    try {
      userRoles = getUserRoles(req.query.username)
    } catch(errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      })
    }
    const result = {
      username: req.query.username,
      roles: userRoles
    };
    console.log(moment().format(), '[Dev- fake] Get User Roles', result.username, result);

    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}

export async function addUserRole(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);

    let userRoles: string[] = [];
    const targetUsername = req.body.username;
    const targetRole = req.body.role;
    try {
      userRoles = getUserRoles(targetUsername)
    } catch(errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      })
    }
    addRole(userRoles, targetRole);

    const result = {
      username: targetUsername,
      roles: userRoles
    };
    console.log(moment().format(), '[Dev- no persist to file] Add User Role', result.username, result);

    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}

function addRole(userRoles: string[], targetRole: any) {
  if (!userRoles.includes(targetRole)) {
    userRoles.push(targetRole);
  }
}

export async function deleteUserRole(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);

    let userRoles: string[] = [];
    const targetUsername = req.body.username;
    const targetRole = req.body.role;
    try {
      userRoles = getUserRoles(targetUsername)
    } catch(errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      })
    }

    deleteRole(userRoles, targetRole);

    const result = {
      username: targetUsername,
      roles: userRoles
    };
    console.log(moment().format(), '[Dev- no persist to file] Delete User Role', result.username, result);

    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}

function deleteRole(userRoles: string[], targetRole: any) {
  if (userRoles.includes(targetRole)) {
    userRoles.forEach((item, index) => {
      if (item === targetRole)
        userRoles.splice(index, 1);
    });
  }
}

export async function putUserRoleStatus(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);
    let userRoles: string[] = [];
    const targetUsername = req.body.username;
    const targetRole = req.body.role;
    const enable = req.body.enable;
    try {
      userRoles = getUserRoles(targetUsername)
    } catch(errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      })
    }
    // For dev, simply (temp) delete the role if disabled, add if enabled
    if (enable) {
      addRole(userRoles, targetRole);
    } else {
      deleteRole(userRoles, targetRole);
    }

    const result = {
      username: targetUsername,
      roles: userRoles
    };
    console.log(moment().format(), '[Dev- no persist to file] Role \"'+ targetRole + '\" enable=', enable, result);

    res.status(200).json(result);

  } catch(err) {
    res.status(401).json({
      status: 403,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}