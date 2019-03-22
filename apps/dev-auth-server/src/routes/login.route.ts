import { Request, Response } from 'express';
import {
  createSessionToken,
  createCsrfToken,
  hashBoatnetPW,
  getCouchUserDBName
} from '../util/security';

const authConfig = require('../config/authProxyConfig.json');

export async function login(req: Request, res: Response) {
  const credentials = req.body;

  const username = req.body.username || '';
  const password = req.body.password || '';

  if (username === '' || password === '') {
    res.status(401);
    res.json({
      status: 401,
      message: 'Invalid credentials - missing inputs.'
    });
    console.log('Missing user or pw.');
    return;
  }

  const validate_result = await devValidateUserPw(username, password);
  if (validate_result) {
    console.log('Valid user result', validate_result);
    const sessionToken = await createSessionToken(validate_result);
    const csrfToken = await createCsrfToken();

    console.log('Login successful');

    res.cookie('SESSIONID', sessionToken, {
      httpOnly: true,
      secure: true
    });

    res.cookie('XSRF-TOKEN', csrfToken);

    const result = {
      user: validate_result.username,
      token: sessionToken // You can check this token at https://jwt.io/
    };

    res.status(200).json(result);
  } else {
    res.status(401);
    res.json({
      status: 401,
      message: 'Invalid credentials'
    });
    return;
  }
}

async function devValidateUserPw(user: string, pw: string) {
  /**
   * Simplified user/pw validation for Development use
   */
  const users = <any>authConfig.devUsers;

  let authedUser: any;
  const isAuthed = users.some((u: any) => {
    if (u.username === user && u.password === pw) {
      authedUser = u;
      return true;
    }
  });

  if (isAuthed) {
    console.log('User authorized: ', user);
    const hashedPW = await hashBoatnetPW(authedUser.password);
    return {
      username: authedUser.username,
      hashedPW: hashedPW,
      roles: authedUser.userData.roles,
      couchDBInfo: {
        ...authedUser.userData.couchDBInfo,
        userDB: getCouchUserDBName(authedUser.username)
      }
    };
  } else {
    console.log('User not authorized: ', user);
    return null;
  }
}
