// Dev Auth Server - simulates an auth server
// For Boatnet app development use, without an actual auth endpoint.

// FRAM Data Team 2019

import express from 'express';
import { Application } from 'express';
import * as fs from 'fs';
import * as https from 'https';

import * as bodyParser from 'body-parser';

import { login } from './routes/login.route';
import { pubkey } from './routes/pubkey.route';

import { RSA_PRIVATE_KEY, RSA_CERT } from './util/security';

const app: Application = express();

const commandLineArgs = require('command-line-args');

const optionDefinitions = [{ name: 'secure', type: Boolean }];

const options = commandLineArgs(optionDefinitions);

app.use(bodyParser.json()); // for parsing application/json

// REST API
// Login
app.route('/api/login').post(login);
// Public Key (dev use only)
app.route('/api/pubkey').get(pubkey);

if (options.secure) {
  const httpsServer = https.createServer(
    {
      // Temporary Keys, not secret and publically shared
      key: RSA_PRIVATE_KEY,
      cert: RSA_CERT
    },
    app
  );

  // launch an HTTPS Server. Note: this does NOT mean that the application is secure
  httpsServer.listen(9000, () => {
    const address: any = httpsServer.address();
    console.log(
      'HTTPS Secure Server running at https://localhost:' + address.port
    );
  });
} else {
  // launch an HTTP Server
  const httpServer = app.listen(3333, () => {
    const address: any = httpServer.address();
    console.log('HTTP Server running at http://localhost:' + address.port);
  });
}
