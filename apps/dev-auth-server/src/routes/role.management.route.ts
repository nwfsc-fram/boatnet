import { Request, Response } from 'express';

import moment from 'moment';
import {
  checkRolesRead,
  getAllApplicationUsers,
  getAllApplicationRoles,
  checkRolesAdmin,
  getUserRoles,
  deleteRole,
  addRole,
  getUsersDetails
} from '../util/roles_management';

function verifyRoleRead(res: any) {
  // get-user.middleware will populate res.user
  // Validate that they have a roles-admin role
  const jwt = res.user;
  if (!jwt) {
    throw new Error('Bearer auth required.');
  }
  console.log('JWT', jwt);
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
  const isRolesAdmin = checkRolesAdmin(jwt.roles, 'BOATNET_OBSERVER');
  if (!isRolesAdmin) {
    throw new Error('User has no roles admin access.');
  }
}

const DEFAULT_APPLICATION_NAME = 'BOATNET_OBSERVER';

export async function getAllUsers(req: Request, res: any) {
  // get-user.middleware will populate res.user
  try {
    verifyRoleRead(res);

    const userAppName = req.query
      ? req.query.applicationName
      : DEFAULT_APPLICATION_NAME;

    try {
      const result = {
        users: getAllApplicationUsers(userAppName)
      };
      console.log(moment().format(), 'GET users length =', result.users.length);

      res.status(200).json(result);
    } catch (err) {
      res.status(404).json({
        status: 404,
        message: err.message
      });
    }
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

export async function getAllRoles(req: Request, res: any) {
  try {
    verifyRoleRead(res);

    const applicationName = req.query
      ? req.query.applicationName
      : DEFAULT_APPLICATION_NAME;

    try {
      const result = {
        applicationName,
        roles: getAllApplicationRoles()
      };
      console.log(moment().format(), 'GET roles length =', result.roles.length);

      res.status(200).json(result);
    } catch (err) {
      res.status(404).json({
        status: 404,
        message: err.message
      });
    }
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

export async function addUser(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);
    const applicationName = req.query
      ? req.query.applicationName
      : DEFAULT_APPLICATION_NAME;

    const result = {
      username: req.body.username,
      applicationName
    };
    console.log(moment().format(), '[Dev- fake] Add User', result.username);
    // Doesn't actually create user for Dev

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

export async function deleteUser(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);
    const applicationName = req.query
      ? req.query.applicationName
      : DEFAULT_APPLICATION_NAME;

    const result = {
      username: req.body.username,
      applicationName
    };
    console.log(moment().format(), '[Dev- fake] Delete User', result.username);
    // Doesn't actually delete user for Dev
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}


export async function getAllUsersDetails(req: Request, res: any) {
  try {
    console.log(moment().format(), req.method, req.originalUrl, req.ip);
    verifyRoleRead(res);

    const applicationName = req.query
      ? req.query.applicationName
      : DEFAULT_APPLICATION_NAME;

    try {
      const usersResult = await getUsersDetails(applicationName);
      const result = {
        applicationName,
        users: usersResult.users
      };

      res.status(200).json(result);
    } catch (err) {
      res.status(404).json({
        status: 404,
        message: err.message
      });
      return;
    }
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

export async function getUserRole(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);

    let userRoles: string[] = [];

    const applicationName = req.query
      ? req.query.applicationName
      : DEFAULT_APPLICATION_NAME;

    try {
      userRoles = getUserRoles(req.query.username, applicationName);
    } catch (errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      });
    }
    const result = {
      username: req.query.username,
      applicationName,
      roles: userRoles
    };
    console.log(
      moment().format(),
      '[Dev- fake] Get User Roles',
      result.username,
      result
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

export async function addUserRole(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);

    let userRoles: string[] = [];
    const targetUsername = req.body.username;
    const targetRole = req.body.role;
    const applicationName = req.body.applicationName
      ? req.body.applicationName
      : DEFAULT_APPLICATION_NAME;

    try {
      userRoles = getUserRoles(targetUsername, applicationName);
    } catch (errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      });
      return;
    }
    addRole(userRoles, targetRole, applicationName);

    const result = {
      username: targetUsername,
      roles: userRoles,
      applicationName
    };
    console.log(
      moment().format(),
      '[Dev- no persist to file] Add User Role',
      result
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

export async function deleteUserRole(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);

    let userRoles: string[] = [];
    const targetUsername = req.query.username;
    const targetRole = req.query.role;
    const applicationName = req.query.applicationName
      ? req.query.applicationName
      : DEFAULT_APPLICATION_NAME;

    try {
      userRoles = getUserRoles(targetUsername, applicationName);
    } catch (errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      });
      return;
    }

    deleteRole(userRoles, targetRole, applicationName);

    const result = {
      username: targetUsername,
      roles: userRoles,
      applicationName
    };
    console.log(
      moment().format(),
      '[Dev- no persist to file] Delete User Role',
      result.username,
      result
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

export async function putUserRoleStatus(req: Request, res: any) {
  try {
    verifyRoleAdmin(res);
    let userRoles: string[] = [];
    const targetUsername = req.body.username;
    const targetRole = req.body.role;
    const enable = req.body.enable;
    const applicationName = req.body.applicationName
      ? req.body.applicationName
      : DEFAULT_APPLICATION_NAME;

    try {
      userRoles = getUserRoles(targetUsername, applicationName);
    } catch (errUsernameResult) {
      res.status(404).json({
        status: 404,
        message: errUsernameResult.message
      });
      return;
    }
    // For dev, simply (temp) delete the role if disabled, add if enabled
    if (enable) {
      addRole(userRoles, targetRole, applicationName);
    } else {
      deleteRole(userRoles, targetRole, applicationName);
    }

    const result = {
      username: targetUsername,
      roles: userRoles,
      applicationName
    };
    console.log(
      moment().format(),
      '[Dev- no persist to file] Role "' + targetRole + '" enable=',
      enable,
      result
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      status: 403,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}
