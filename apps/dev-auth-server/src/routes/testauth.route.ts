import { Request, Response } from 'express';
import { decodeJwtObject } from '../util/security';

import moment from 'moment';

const authConfig = require('../config/authProxyConfig.json');

export async function testauth(req: Request, res: Response) {

  const jwtEnc = (req.method === 'POST') ? req.body.token : req.query.token
  if (!jwtEnc) {
    res.status(401).json({
      status: 401,
      message: 'Missing required token.'
    })
    return;
  }
  try {
    const jwt = await decodeJwtObject(jwtEnc);
    const result = {
      username: jwt.username,
      roles: jwt.roles
    };

    console.log(moment().format(), 'testauth:', result);
    res.status(200).json(result);
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}
