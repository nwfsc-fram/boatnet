// Dev Auth Server - simulates an auth server
// For Boatnet app development use, without an actual auth endpoint.

// FRAM Data Team 2019

import express from 'express';
import cors from 'cors';
import { Application } from 'express';
import * as fs from 'fs';
import * as https from 'https';
import { resolve } from 'path';

// 1. Import the express-openapi-validator library
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;

import * as bodyParser from 'body-parser';

import { login } from './routes/login.route';
import { pubkey } from './routes/pubkey.route';

import { RSA_PRIVATE_KEY, RSA_CERT } from './util/security';

const app: Application = express();

const commandLineArgs = require('command-line-args');

const optionDefinitions = [{ name: 'secure', type: Boolean }];

const options = commandLineArgs(optionDefinitions);

app.use(bodyParser.json()); // for parsing application/json
app.use(express.json());
app.use(cors());


// OpenAPI Spec
app.use('/spec', express.static(resolve(__dirname, 'openapi.yaml')));

new OpenApiValidator({
  apiSpecPath: './src/openapi.yaml',
}).install(app);

const API_VERSION = 'v1';
// REST API
// Login
app.route('/api/' + API_VERSION + '/login').post(login);
// Public Key (dev use only)
app.route('/api/' + API_VERSION + '/pubkey').get(pubkey);


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
 throw new Error('Only HTTPS server is allowed for auth.')
}
