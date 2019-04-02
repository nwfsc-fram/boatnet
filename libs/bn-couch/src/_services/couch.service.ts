// Boatnet Auth Service Routines

/* tslint:disable:no-console */

import axios from 'axios';
import https from 'https';
import cryptoJS from 'crypto-js';

import jsonwebtoken from 'jsonwebtoken';
import pemjwk from 'pem-jwk';

import { CouchDBCredentials } from '../_store/types/types';

class CouchService {
  private currentCredentials: CouchDBCredentials | null = null;

  constructor() {
    console.log('[CouchDB Service] Instantiated.');
  }
}

export const dbService = new CouchService();
