<template>
  <q-layout view="lHh Lpr lFf">
    <!-- <q-header elevated class="basic">
      <q-toolbar>
        <q-btn flat dense round/>

        <q-toolbar-title>Observer Web Login</q-toolbar-title>

      </q-toolbar>
    </q-header> -->
    <q-page-container class="absolute-center"  style="width: 100%;">
      <div class="q-pa-sm column justify-center items-center full-height" style="margin-top: 150px">
        <form @submit.prevent.stop="handleSubmit" class="q-gutter-xs" style="width: 100%; max-width: 500px">
          <div v-show="!!alert.message">
            <q-banner rounded class="bg-red text-white">{{alert.message}}</q-banner>
          </div>

          <div class="flex flex-center" style="text-align: center">
                <transition-group name="transition-list">
                  <img v-if="pageLoad" alt="animated_noaa_fisheries_logo" src="../assets/intro3.gif" style="width: 100%; margin: 0; padding: 0" class="transition-item" :key="0">
                  <div v-else :key="1">
                    <img alt="noaa logo" src="../assets/NOAA_logo.svg" style="height: 80px" class="transition-item">
                    &nbsp;
                    <div class="text-h6 text-primary" style="font-size: 24px; display: inline; line-height: 80px; vertical-align: top">BOATNET</div>
                    <br><br>
                  </div>
                </transition-group>
          </div>
          <br>
          <q-input
            outlined
            ref="username"
            v-model="username"
            dense
            autocorrect="off" autocapitalize="off" spellcheck="false"
            label="Username"
            @input="username = username.toLowerCase()"
            for="username"
            />

          <q-input
            outlined
            ref="password"
            :type="isPwd ? 'password' : 'text'"
            v-model="password"
            label="Password"
            dense
            autocorrect="off" autocapitalize="off" spellcheck="false"
            autocomplete="boatnet password"
            for="password"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div style="text-align: center">
            <q-btn
              class="full-width"
              color="primary"
              :disable="!password || !username"
              :loading="auth.status.isLoggingIn"
              label="Login"
              dense
              type="submit"
              align="center"
            />
          </div>
        </form>
        <br>
        <div class="column justify-center" style="text-align: center">
          <router-link to="/username">Set/Reset Password</router-link>
          <router-link to="/newAccount">Create account</router-link>
          <div style="text-align: center; font-size: 10px; font-weight: bold; margin-top: 50px">
            <!-- Version: {{general.appVersion}} -->
            Version: todo | Updated: {{this.lastSoftwareUpdateDate}}
            <br>Last Data Sync: {{this.lastDataSyncDate}}
            <br>Last Login Date: {{this.lastLoginDate}}
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator

import router from '../router';
import { AlertState, WcgopAppState, GeneralState } from '../_store/types/types';
import { AuthState, authService } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { PouchDBState } from '@boatnet/bn-pouch';
import { formatDate } from '@boatnet/bn-util';

import { Notify } from 'quasar';
import moment from 'moment';

@Component
export default class Login extends Vue {
  @State('auth') private auth!: AuthState;
  @State('alert') private alert!: AlertState;
  @State('pouchState') private pouchState!: PouchDBState;
  @State('appState') private appState!: WcgopAppState;
  @State('general') private general!: GeneralState;

  @Action('login', { namespace: 'auth' }) private login: any;
  @Action('logout', { namespace: 'auth' }) private logout: any;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  @Action('connect', { namespace: 'baseCouch' }) private connectCouch: any;
  @Action('connectNoLookupsSync', { namespace: 'pouchState' }) private connectPouch: any;
  @Action('disconnect', { namespace: 'pouchState' })
  private disconnectPouch: any;

  @Action('clear', { namespace: 'appState' }) private clearAppState: any;

  private username = '';
  private password = '';
  private isPwd = true;
  private submitted = false;

  private lastSoftwareUpdateDate = '-';
  private lastLoginDate = '-';

  private visible = false;
  private layout = 'normal';
  private input = null;
  private options = {
    useKbEvents: false,
    preventClickEvent: false
  };

  private pageLoad = true;

  private unsubscribe: any;

  public get isLoggingIn(): boolean {
    const isLoggingIn = !!this.auth.status.isLoggingIn;
    return isLoggingIn;
  }

  public get isLoggedIn(): boolean {
    const isLoggedIn = !!this.auth.status.isLoggedIn;
    return false;
  }

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(newVal: string, oldVal: string) {
    console.log('URL CHANGED', newVal, oldVal);
    this.clear();
  }

  private show(e: any) {
    this.input = e.target;
    this.layout = e.target.dataset.layout;

    if (!this.visible) {
      this.visible = true;
    }
  }

  private hide() {
    this.visible = false;
  }

  // private statusNotify() {
  //   const message =
  //         "Last Software Update Date: " + this.lastSoftwareUpdateDate +
  //         "<br>Last Data Sync: " + this.lastDataSyncDate +
  //         "<br>Last Login Date: " + this.lastLoginDate

  //   Notify.create({
  //     message: message,
  //     position: 'top',
  //     color: 'white',
  //     textColor: 'black',
  //     html: true,
  //     timeout: 5000,
  //     multiLine: true
  //   });
  // }

  private mounted() {


    setTimeout(() => {
      this.pageLoad = false;
    }, 5000);
    // this.refreshPage();
    this.logout(); // reset login status
    this.disconnectPouch();
    this.clear(); // clear errors
    this.clearAppState(); // clear trips etc
    // this.statusNotify();

    this.unsubscribe = this.$store.subscribe((mutation: any, state: any) => {
      switch (mutation.type) {
        case 'auth/loginSuccess':
          const creds = authService.getCouchDBCredentials();
          this.connectCouch(creds);

          this.connectPouch(creds, false);

          router.push('/'); // On successful login, navigate to home
          break;
        case 'auth/loginFailure':
          this.error(state.auth.status.error.message);
          break;
      }
    });
  }

  private beforeDestroy() {
    this.unsubscribe();
  }

  private handleSubmit(e: any) {
    this.clear();
    this.submitted = true;
    // let { username, password } = this;
    let username = this.username;
    const password = this.password;
    if (username && password) {
      if (username.includes('@noaa.gov')) {
        username = username.slice(0, username.indexOf('@'));
      }
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

  // public refreshPage() {
  //   console.log('refresh started')
  //   const pageVersion = moment().format('HHMM');
  //   const path = window.location.href.split('?')[0] + '?v=' + pageVersion;
  //   const func = 'window.location.replace(\"' + path + '\")'
  //   var timeout = 60000;
  //   if (window.location.href.indexOf('?v=') === -1) {
  //       timeout = 0;
  //   }
  //   const mytimeout = setTimeout(func, timeout);
  //   console.log('refresh completed')
  // }

}
</script>

<style scoped>
  .transition-item {
    transition: all .5s;
  }

    .transition-list-enter,
    .transition-list-leave-to {
        opacity: 0;
    }
</style>
