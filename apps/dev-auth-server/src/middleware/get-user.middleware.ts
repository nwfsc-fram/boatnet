import { decodeJwt } from '../util/security';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

export async function validateJwtRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get JWT bearer auth (preferred)
  let jwtEnc = undefined;
  const header: string = req.headers['authorization'] as string;
  if (header) {
    const bearer = header.split(' ');
    const token = bearer[1];
    jwtEnc = token;
  }
  if (!jwtEnc) {
    // If that fails, try to get token from POST.
    jwtEnc = req.method === 'POST' ? req.body.token : req.query.token;
  }
  if (!jwtEnc) { // still undefined, then fail
    res.status(401).json({
      status: 401,
      message: 'Missing bearer auth token.'
    });
    return;
  }

  try {
    const jwt = await handleJwtToken(jwtEnc, res);
    // Valid, so continue.
    next();
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: err.message
    });
    console.log(moment().format(), err.message);
  }
}

async function handleJwtToken(jwt: string, res: any) {
  const payload = await decodeJwt(jwt);
  res['user'] = JSON.parse(payload.sub);
  return payload;
}
