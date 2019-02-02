import * as jwt from 'jwt-simple';
import * as argon2 from 'argon2';

import { Request, Response } from 'express';
import { createSessionToken, createCsrfToken } from './util/security';
const authConfig = require('./config/authProxyConfig.json');

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

  const validate_result = devValidateUserPw(username, password);
  if (validate_result) {
    console.log('VALIDO', validate_result);
    const sessionToken = await createSessionToken(validate_result);
    const csrfToken = await createCsrfToken();

    console.log('Login successful');

    res.cookie('SESSIONID', sessionToken, {
      httpOnly: true,
      secure: true
    });

    res.cookie('XSRF-TOKEN', csrfToken);

    const result = {
      ...validate_result,
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

function devValidateUserPw(user: string, pw: string): any {
  const users = <any>authConfig.devUsers;
  const dbUrl = <any>authConfig.couchDBUrlRoot;
  let authedUser: any;
  const isAuthed = users.some(u => {
    if (u.user === user && u.password === pw) {
      authedUser = u;
      return true;
    }
  });

  if (isAuthed) {
    console.log('User authorized: ', user);
    return {
      user: authedUser.user,
      roles: authedUser.returnUserData.roles,
      couchDBUrlRoot: dbUrl
    };
  } else {
    console.log('User not authorized: ', user);
    return null;
  }
}
