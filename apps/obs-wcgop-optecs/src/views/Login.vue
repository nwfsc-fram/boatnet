<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="basic">
      <q-toolbar>
        <q-btn flat dense round/>

        <q-toolbar-title>Boatnet WCGOP OPTECS Login</q-toolbar-title>

        <div>v0.0.0</div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <div class="q-pa-md">
        <div>
          <b>Last Software Update Date:</b>
          {{lastSoftwareUpdateDate}}
        </div>
        <div>
          <b>Last Data Sync:</b>
          {{lastDataSyncDate}}
        </div>
        <div>
          <b>Last Login Date:</b>
          {{lastLoginDate}}
        </div>
      </div>
      <div class="q-pa-xl column justify-center items-center full-height">
        <form @submit.prevent.stop="handleSubmit" class="q-gutter-md" style="min-width: 300px;">
          <div v-show="!!alert.message">
            <q-banner rounded class="bg-red text-white">{{alert.message}}</q-banner>
          </div>

          <q-input
            outlined
            ref="username"
            v-model="username"
            label="Username"
            @focus="displayKeyboard"
            data-layout="normal"
          />

          <q-input
            outlined
            ref="password"
            :type="isPwd ? 'password' : 'text'"
            v-model="password"
            label="Password"
            autocomplete="boatnet password"
            @focus="displayKeyboard"
            data-layout="normal"
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
              type="submit"
              align="center"
            />
          </div>
        </form>
        <br>
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
import router from '../router';
import { AlertState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';

@Component
export default class Login extends Vue {
  @State('auth') private auth!: AuthState;
  @State('alert') private alert!: AlertState;
  @Action('login', { namespace: 'auth' }) private login: any;
  @Action('logout', { namespace: 'auth' }) private logout: any;
  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;
  @Action('connect', { namespace: 'baseCouch' }) private connect: any;

  private username = '';
  private password = '';
  private isPwd = true;
  private submitted = false;
  private lastSoftwareUpdateDate = '10/1/2018 12:00:00';
  private lastDataSyncDate = '10/1/2018 12:00:00';
  private lastLoginDate = '10/1/2018 12:00:00';

  private options = {
    useKbEvents: false,
    preventClickEvent: false
  };

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
  private onUrlChange(newVal: any) {
    this.clear();
  }

  private mounted() {
    this.logout(); // reset login status
    this.clear(); // clear errors
    this.unsubscribe = this.$store.subscribe((mutation: any, state: any) => {
      switch (mutation.type) {
        case 'auth/loginSuccess':
          const creds = authService.getCouchDBCredentials();
          this.connect(creds);
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
    const { username, password } = this;
    if (username && password) {
      this.login({ username, password });
    }
  }

  private displayKeyboard(e: any) {
    this.$emit('displayKeyboard', e.target);
  }
}
</script>
