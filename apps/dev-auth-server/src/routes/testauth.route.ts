import { Request, Response } from 'express';
import { decodeJwtObject } from '../util/security';

import moment from 'moment';
import { checkRolesAdmin } from '../util/roles_management';

const authConfig = require('../config/authProxyConfig.json');

export async function testauth(req: Request, res: Response) {

  // get-user middleware
  const jwtEnc = (req.method === 'POST') ? req.body.token : req.query.token

  try {
    const jwt = await decodeJwtObject(jwtEnc);
    const result = {
      username: jwt.username,
      roles: jwt.roles
    };

    const isRolesAdmin = checkRolesAdmin(jwt.roles);
    console.log(moment().format(), 'testauth:', result, 'isAdmin:', isRolesAdmin);
    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}
