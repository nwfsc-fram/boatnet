// Dev Auth Server - simulates an auth server
// For Boatnet app development use, without an actual auth endpoint.

// FRAM Data Team 2019

import express from 'express';
import cors from 'cors';
import { Application } from 'express';
import * as fs from 'fs';
import * as https from 'https';
import { resolve } from 'path';
import moment from 'moment';
import session from 'express-session';

const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;

import { login } from './routes/login.route';
import { pubkey } from './routes/pubkey.route';

import { RSA_PRIVATE_KEY, RSA_CERT } from './util/security';
import { testauth } from './routes/testauth.route';
import { validateJwtRequest } from './middleware/get-user.middleware';

const app: Application = express();

const commandLineArgs = require('command-line-args');

const optionDefinitions = [{ name: 'secure', type: Boolean }];

const options = commandLineArgs(optionDefinitions);

app.use(session({
  secret: 'unused',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(express.json());
app.use(cors());

const swaggerUi = require('swagger-ui-express');


var swaggerOptions = {
  swaggerOptions: {
    url: 'https://localhost:9000/spec'
  }
}

// OpenAPI Spec
app.use('/spec', express.static(resolve(__dirname, 'openapi.yaml')));
// API Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

new OpenApiValidator({
  apiSpecPath: './src/openapi.yaml',
}).install(app);

const API_VERSION = 'v1';
// REST API
// Login
app.route('/api/' + API_VERSION + '/login').post(login);

// test-auth - for testing JWT
app.use('/api/' + API_VERSION + '/test-auth', validateJwtRequest); // validate first
app.route('/api/' + API_VERSION + '/test-auth').post(testauth);

app.use('/api/' + API_VERSION + '/test-auth2', validateJwtRequest); // validate first
app.route('/api/' + API_VERSION + '/test-auth2').get(testauth);

// Public Key (dev use only)
app.route('/api/' + API_VERSION + '/pubkey').get(pubkey);



// Handle bad requests
app.use((err: any, req: any, res: any, next: any) => {
  if (!err) return next();
  console.log(moment().format(), 'Bad request. ', req.ip, err.message);
  return res.status(400).json({
    status: 400,
    error: 'Bad request.',
  });
});

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
