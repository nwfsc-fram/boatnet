import { Request, Response } from 'express';
import {
  createSessionToken,
  createCsrfToken,
  hashBoatnetPW,
  getCouchUserDBName,
  decode64
} from '../util/security';

const authConfig = require('../config/authProxyConfig.json');

const DEFAULT_APPLICATION_NAME = 'OBSERVER_BOATNET';

export async function login(req: Request, res: Response) {
  let username = req.body.username || '';
  const password = req.body.passwordEnc
    ? decode64(req.body.passwordEnc)
    : req.body.password || '';
  const userAppName = req.body.applicationName
    ? req.body.applicationName
    : DEFAULT_APPLICATION_NAME;

  username = username.toLowerCase(); // fix #671

  if (username === '' || password === '') {
    res.status(401);
    res.json({
      status: 401,
      message: 'Invalid credentials - missing inputs.'
    });
    console.log('Missing user or pw.');
    return;
  }

  try {
    const validate_result = await devValidateUserPw(
      username,
      password,
      userAppName
    );

    if (validate_result) {
      // console.log('Valid user result', validate_result);
      const sessionToken = await createSessionToken(validate_result);
      const csrfToken = await createCsrfToken();

      console.log('Login successful');

      // res.cookie('SESSIONID', sessionToken, {
      //   httpOnly: true,
      //   secure: true
      // });

      // res.cookie('XSRF-TOKEN', csrfToken);

      const result = {
        username: validate_result.username,
        token: sessionToken // You can check this token at https://jwt.io/
      };

      res.status(200).json(result);
    } else {
      res.status(401).json({
        status: 401,
        message: 'Invalid credentials'
      });
      return;
    }
  } catch (authErr) {
    res.status(401).json({
      status: 401,
      message: authErr.message
    });
    return;
  }
}

async function devValidateUserPw(
  username: string,
  password: string,
  applicationName: string
) {
  /**
   * Simplified user/pw validation for Development use
   */
  const users = <any>authConfig.devUsers;

  let authedUser: any;
  const isAuthed = users.some((u: any) => {
    const userApplicationName = u.applicationName
      ? u.applicationName.toUpperCase()
      : 'OBSERVER_BOATNET';

    if (
      u.username === username &&
      u.password === password &&
      userApplicationName === applicationName
    ) {
      authedUser = u;
      return true;
    }
  });

  if (isAuthed) {
    console.log('User authorized: ', username);
    const hashedPW = await hashBoatnetPW(authedUser.password);
    return {
      username: authedUser.username,
      hashedPW: hashedPW,
      applicationName: applicationName,
      roles: authedUser.userData.roles,
      couchDBInfo: {
        ...authedUser.userData.couchDBInfo,
        userDB: getCouchUserDBName(authedUser.username)
      }
    };
  } else {
    throw new Error('User not authorized for ' + applicationName);
  }
}
