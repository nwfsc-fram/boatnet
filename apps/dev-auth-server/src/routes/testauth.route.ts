import { Request, Response } from 'express';
import { decodeJwtObject } from '../util/security';

import moment from 'moment';
import { checkRolesAdmin } from '../util/roles_management';

const authConfig = require('../config/authProxyConfig.json');

export async function testauth(req: Request, res: any) {

  // get-user.middleware will populate res.user
  try {
    if (!res.user) {
      throw new Error('Bearer auth required.');
    }
    const jwtStr = res.user.sub;
    const jwt = JSON.parse(jwtStr);
    if (!jwt) {
      throw new Error('Bearer auth required.');
    }

    const result = {
      username: jwt.username,
      roles: jwt.roles
    };

    const isRolesAdmin = checkRolesAdmin(jwt.roles);
    console.log(moment().format(), 'testauth:', result, 'isAdmin:', isRolesAdmin);
    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 403,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}
