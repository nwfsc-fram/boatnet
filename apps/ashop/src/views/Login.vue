<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="basic">
      <q-toolbar>
        <q-btn flat dense round />

        <q-toolbar-title>{{loginConfig.appName}}</q-toolbar-title>

        <div>v0.0.0</div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <div class="q-pa-md">
        <div v-for="(value, name) in loginConfig.statInfo" :key="name">
          <b>{{name}}:</b> {{value}}
        </div>
      </div>
      <div class="q-pa-xl column justify-center items-center full-height">
        <form @submit.prevent.stop="handleSubmit" class="q-gutter-md" style="min-width: 300px;">
          <div v-show="!!alert.message">
            <q-banner rounded class="bg-red text-white">{{alert.message}}</q-banner>
          </div>
          <boatnet-keyboard-input :value.sync="username" label="Username" keyboardType="normal" />
          <boatnet-keyboard-input
            :value.sync="password"
            label="Password"
            keyboardType="normal"
            :encodingType="isPwd ? 'password' : 'text'"
          >
            <template v-slot:after>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </boatnet-keyboard-input>
          <div style="text-align: center">
            <q-btn
              class="full-width"
              color="primary"
              :disable="!password || !username"
              :loading="auth.status.isLoggingIn"
              label="Login"
              type="submit"
              align="center"
            />
          </div>
        </form>
        <br />
        <div class="column justify-center q-gutter-md" style="text-align: center">
          <router-link to="/" disabled="true">Forgot Password</router-link>
          <router-link to="/" disabled="true">Change Password</router-link>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator
import { AlertState, TripState } from '@boatnet/bn-common';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials } from '@boatnet/bn-couch';
import { PouchDBState } from '@boatnet/bn-pouch';
import { formatDate } from '@boatnet/bn-util';
import { AppSettings, BoatnetConfig } from '@boatnet/bn-common';
import { loginConfig } from '../helpers/loginConfig';

import { Quasar } from 'quasar';

@Component
export default class Login extends Vue {
  @State('auth') private auth!: AuthState;
  @State('alert') private alert!: AlertState;
  @State('pouchState') private pouchState!: PouchDBState;
  @State('tripsState') private tripsState!: TripState;

  @Action('login', { namespace: 'auth' }) private login: any;
  @Action('logout', { namespace: 'auth' }) private logout: any;

  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  @Action('connect', { namespace: 'pouchState' }) private connectPouch: any;
  @Action('disconnect', { namespace: 'pouchState' })
  private disconnectPouch: any;

  @Action('clear', { namespace: 'tripsState' }) private clearTripsState: any;
  
  private loginConfig!: any;

  private username = '';
  private password = '';
  private isPwd = true;
  private submitted = false;

  // private quasarVersion = Quasar.version;
  private stat = {
    value: '22'
  };

  private options = {
    useKbEvents: false,
    preventClickEvent: false
  };

  private unsubscribe: any;

  get quasarVersion(): number {
    return Quasar.version;
  }

  public get isLoggingIn(): boolean {
    const isLoggingIn = !!this.auth.status.isLoggingIn;
    return isLoggingIn;
  }

  public get isLoggedIn(): boolean {
    const isLoggedIn = !!this.auth.status.isLoggedIn;
    return false;
  }

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(newVal: any) {
    this.clearAlert();
  }

  private created() {
    this.loginConfig = loginConfig.wcgop;
    this.loginConfig.statInfo['Last Software Update Date'] = '-';
    this.loginConfig.statInfo['Last Data Sync'] = this.lastDataSyncDate;
    this.loginConfig.statInfo['Last Login Date'] = '-';
    this.loginConfig.statInfo['Quasar Version'] = Quasar.version;
  }

  private mounted() {
    this.logout(); // reset login status
    this.disconnectPouch();
    this.clearAlert(); // clear errors
    this.clearTripsState(); // clear trips etc

    this.unsubscribe = this.$store.subscribe((mutation: any, state: any) => {
     switch (mutation.type) {
        case 'auth/loginSuccess':
          const creds = authService.getCouchDBCredentials();
          this.connectPouch(creds);
          this.$router.push({ path: '/' }); // On successful login, navigate to home
          break;
        case 'auth/loginFailure':
          // this.errorAlert(state.auth.status.error.message);
          break;
      }
    });

    if (authService.apiUrl) {
      console.log('Api URL', authService.apiUrl);
    } else {
      console.log('Api URL not defined. Auth proxy will be used');
    }
  }

  private beforeDestroy() {
    this.unsubscribe();
  }

  private handleSubmit(e: any) {
    this.clearAlert();
    this.submitted = true;
    const { username, password } = this;

    if (username && password) {
      this.login({ username, password });
    }
  }

  private get lastDataSyncDate() {
    if (this.pouchState.lastSyncDate) {
      return formatDate(this.pouchState.lastSyncDate);
    } else {
      return 'Never';
    }
  }
}
</script>
