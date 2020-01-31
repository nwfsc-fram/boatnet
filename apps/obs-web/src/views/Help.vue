<template>
    <q-page class="q-pa-md">

        <div class="text-h6">FAQ</div>
        <div class="q-pa-md">
            Q. How do I X?  A.  You Y.
        </div>

        <div class="text-h6">Support</div>
        <div class="q-pa-md">
            Please contact x for y.
        </div>

        <div class="text-h6">Reset Application</div>
        <div class="q-pa-md">
            <q-btn class="q-ma-md" size="sm" color="red" @click="lookupsConfirm = true">reload lookups</q-btn>
            <q-btn class="q-ma-md" size="sm" color="red" @click="userDBConfirm = true">reload user data</q-btn>
            <q-btn class="q-ma-md" size="sm" color="red" @click="updateApp">Force Update App</q-btn>
        </div>

        <q-dialog v-model="lookupsConfirm">
            <q-card>
                <q-card-section>
                <div class="text-h6 text-red">WARNING:</div>
                    Reload lookups only on a reliable internet connection.
                    <br><br>
                    If you're sure you want to proceed:
                    <ol>
                        <li>Type 'lookups'</li>
                        <li>Press 'RELOAD'</li>
                        <li>Log back in</li>
                    </ol>
                <q-input dense v-model="lookupsConfirmText">
                    <template v-slot: append>
                        <q-btn flat color="red" size="md" @click="deleteLookups">reload</q-btn>
                        <q-btn flat color="primary" size="md" @click="lookupsConfirm = false; lookupsConfirmText = ''">cancel</q-btn>
                    </template>
                </q-input>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="userDBConfirm">
            <q-card>
                <q-card-section>
                <div class="text-h6 text-red">WARNING:</div>
                    Reload user database only on a reliable internet connection.
                    <br><br>
                    If you're sure you want to proceed:
                    <ol>
                        <li>Type 'userdb'</li>
                        <li>Press 'RELOAD'</li>
                        <li>Log back in</li>
                    </ol>
                <q-input dense v-model="userDBConfirmText">
                    <template v-slot: append>
                        <q-btn flat color="red" size="md" @click="deleteUserDB">reload</q-btn>
                        <q-btn flat color="primary" size="md" @click="userDBConfirm = false; userDBConfirmText = ''">cancel</q-btn>
                    </template>
                </q-input>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action, Getter } from 'vuex-class';
import { AlertState, VesselState, PermitState, UserState } from '../_store/types/types';
import { AuthState, authService } from '@boatnet/bn-auth';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { CouchDBInfo, couchService } from '@boatnet/bn-couch';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { EmEfp, Permit } from '@boatnet/bn-models';
import moment from 'moment';

import { Notify } from 'quasar';

@Component
export default class Home extends Vue {
  @State('auth') private auth!: AuthState;
  @State('user') private user!: UserState;

  @State('alert') private alert!: AlertState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;

  private lookupsConfirm: boolean = false;
  private lookupsConfirmText: string = '';
  private userDBConfirm: boolean = false;
  private userDBConfirmText: string = '';

  constructor() {
    super();
  }

  private async deleteLookups() {
      if (this.lookupsConfirmText === 'lookups') {
          const db = pouchService.db;
          await db.destroy(
            pouchService.lookupsDBName
          ).then( () => {
            this.$router.push('/login');
          });
      } else {
          Notify.create({
            message: '<b>you must type \'lookups\' to proceed with reload.</b>',
            position: 'top',
            color: 'red',
            timeout: 1000,
            icon: 'warning',
            html: true,
            multiLine: true
        });
      }
  }

  private async deleteUserDB() {
      if (this.userDBConfirmText === 'userdb') {
          const db = pouchService.db;
          await db.destroy(
            pouchService.userDBName
          ).then( () => {
            this.$router.push('/login');
          });
      } else {
          Notify.create({
            message: '<b>you must type \'userdb\' to proceed with reload.</b>',
            position: 'top',
            color: 'red',
            timeout: 1000,
            icon: 'warning',
            html: true,
            multiLine: true
        });
      }
  }

  private updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
            registration.update();
        }
        this.$router.push('login');
        });
    }
 }

}
</script>