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
            v-model="password"
            label="Password"
            :rules="[val => !!val || 'Password is required']"
          />
          <q-banner rounded v-show="!!alert.message" class="bg-red text-white">{{alert.message}}</q-banner>
          <div>
            <q-btn color="primary" label="Login" type="submit" :disabled="auth.status.isLoggingIn"/>
            <q-space />
            <img
              v-show="auth.status.isLoggingIn"
              src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
            >
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
  </q-layout>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator
import { AuthState, AlertState } from '../_store/types/types';

@Component
export default class Login extends Vue {
  @State('auth') private auth!: AuthState;
  @State('alert') private alert!: AlertState;
  @Action('login', { namespace: 'auth' }) private login: any;
  @Action('logout', { namespace: 'auth' }) private logout: any;
  @Action('clear', { namespace: 'alert' }) private clear: any;

  private username = '';
  private password = '';
  private submitted = false;
  private errorMsg = '';

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(newVal: any) {
    this.clear();
  }

  private mounted() {
    // reset login status
    this.logout();
  }

  private handleSubmit(e: any) {
    this.submitted = true;
    const { username, password } = this;
    if (username && password) {
      this.login({ username, password });
    }
  }
}
</script>
