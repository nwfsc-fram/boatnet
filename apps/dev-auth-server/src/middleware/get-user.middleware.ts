import { decodeJwt } from '../util/security';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

export async function validateJwtRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const jwtEnc = (req.method === 'POST') ? req.body.token : req.query.token
  if (!jwtEnc) {
    res.status(401).json({
      status: 401,
      message: 'Missing required token.'
    })
    return;
  }

  try {
    const jwt = await handleJwtToken(jwtEnc, res);
    // Valid, so continue.
    next();
  } catch(err) {
    res.status(401).json({
      status: 401,
      message: err.message
    })
    console.log(moment().format(), err.message)
  }
}


async function handleJwtToken(jwt: string, res: any) {
  const payload = await decodeJwt(jwt);
  res['user'] = payload; // TODO Is this used?
  return payload;
}
