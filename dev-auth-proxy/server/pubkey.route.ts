import { Request, Response } from 'express';
import { RSA_PUBLIC_KEY } from './util/security';

const authConfig = require('./config/authProxyConfig.json');

export async function pubkey(req: Request, res: Response) {
  const result = {
    publicKey: RSA_PUBLIC_KEY.toString()
  };

  res.status(200).json(result);
}
