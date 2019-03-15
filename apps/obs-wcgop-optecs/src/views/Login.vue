<template>
  <div class="q-pa-md" style="max-width: 300px">
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

      <div>
        <q-btn color="primary" label="Login" type="submit" :disabled="status.loggingIn"/>
        <img
          v-show="status.loggingIn"
          src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
        >
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { State, Action, Getter } from 'vuex-class';
// import { mapState, mapActions } from 'vuex';
import { Component, Prop } from 'vue-property-decorator';
import { AccountState, User } from '../_store/types/types';

const namespace: string = 'account';

@Component
export default class Login extends Vue {
  @State('account') private status!: AccountState;
  @Action('login', { namespace }) private login: any;
  @Action('logout', { namespace }) private logout: any;

  private username = '';
  private password = '';
  private submitted = false;

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
