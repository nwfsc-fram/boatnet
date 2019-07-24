import { decodeJwt } from '../util/security';
import { Request, Response, NextFunction } from 'express';

const invalidResult = {
  status: 401,
  message: 'Invalid token.'
};

export function validateJwtRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const jwt = (req.method === 'POST') ? req.body.token : req.query.token

  console.log('AHSDHSHAD');
  if (jwt) {
    handleJwtToken(jwt, req)
      .then(() => next())
      .catch(err => {
        console.error(err);
        res.status(401).json(invalidResult);
      });
  } else {
    res.status(401).json(invalidResult);
  }
}

async function handleJwtToken(jwt: string, req: any) {
  const payload = await decodeJwt(jwt);
  // TODO: below not needed?
  req['user'] = payload;
}
