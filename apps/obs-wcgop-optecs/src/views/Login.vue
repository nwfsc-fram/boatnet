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
      <q-banner rounded v-show="!!alert.message" class="bg-red text-white">{{alert.message}}</q-banner>
      <div class="q-pa-md" self-center style="max-width: 300px;">
        <form @submit.prevent.stop="handleSubmit" class="q-gutter-md">
          <q-input
            outlined
            ref="username"
            v-model="username"
            label="Username"
            :rules="[val => !!val || 'Username is required']"
          />

          <q-input
            outlined
            ref="password"
            type="password"
            v-model="password"
            label="Password"
            autocomplete="boatnet password"
            :rules="[val => !!val || 'Password is required']"
          />

          <div>
            <q-btn color="primary" label="Login" type="submit" :disabled="isLoggingIn"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <q-spinner v-show="isLoggingIn" color="primary" size="3em" :thickness="2"/>
          </div>
        </form>
        <br>
        <br>
        <div>
          <router-link to="/" disabled="true">Forgot Password</router-link>
        </div>
        <br>
        <div>
          <router-link to="/" disabled="true">Change Password</router-link>
        </div>
      </div>
    </q-page-container>
    <vue-touch-keyboard
      :options="options"
      v-if="visible"
      :layout="layout"
      :cancel="hide"
      :accept="accept"
      :input="input"
    />
  </q-layout>
</template>

<script lang="ts">
import * as Nano from 'nano';
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
  private submitted = false;

  private visible = false;
  private layout = 'normal';
  private input = null;
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
}
</script>
