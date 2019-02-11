import { Request, Response } from 'express';
import { RSA_PUBLIC_KEY } from './util/security';
import * as pemjwk from 'pem-jwk';

const authConfig = require('./config/authProxyConfig.json');

export async function pubkey(req: Request, res: Response) {

  const jwkKey = pemjwk.pem2jwk(RSA_PUBLIC_KEY.toString());

  // TODO If we add multiple keys, add the 'kid' property for matching
  const result = {
    keys: [jwkKey]
  };

  res.status(200).json(result);
}
