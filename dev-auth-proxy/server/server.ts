// Dev Auth Server - simulates an auth server
// For Boatnet app development use, without an actual auth endpoint.

// FRAM Data Team 2019

import * as express from 'express';
import { Application } from 'express';
import * as fs from 'fs';
import * as https from 'https';

import * as bodyParser from 'body-parser';

import { login } from './login.route';
import * as argon2 from 'argon2';
import * as SHA512 from 'crypto-js/sha512';

const app: Application = express();

const commandLineArgs = require('command-line-args');

const optionDefinitions = [{ name: 'secure', type: Boolean }];

const options = commandLineArgs(optionDefinitions);

app.use(bodyParser.json()); // for parsing application/json

// REST API
app.route('/login').post(login);

if (options.secure) {
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync('temp-priv-key.pem'),
      cert: fs.readFileSync('temp-cert.pem')
    },
    app
  );

  // launch an HTTPS Server. Note: this does NOT mean that the application is secure
  httpsServer.listen(9000, () =>
    console.log(
      'HTTPS Secure Server running at https://localhost:' +
        httpsServer.address().port
    )
  );
} else {
  // launch an HTTP Server
  const httpServer = app.listen(9000, () => {
    console.log(
      'HTTP Server running at https://localhost:' + httpServer.address().port
    );
  });
}
