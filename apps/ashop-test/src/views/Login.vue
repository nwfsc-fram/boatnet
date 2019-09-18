<template>
  <q-btn class="full-width" color="primary" label="Login" type="submit" align="center" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, Mutation } from 'vuex-class';
import router from '../router';
import { authService } from '@boatnet/bn-auth';

@Component
export default class Login extends Vue {
  @Action('login', { namespace: 'auth' }) private login: any;
  @Action('connect', { namespace: 'pouchState' }) private connectPouch: any;

  private username = '';
  private password = '';
  private unsubscribe: any;

  private mounted() {
    this.unsubscribe = this.$store.subscribe((mutation: any, state: any) => {
      switch (mutation.type) {
        case 'auth/loginSuccess':
          const creds = authService.getCouchDBCredentials();
          this.connectPouch(creds);
          router.push('/'); // On successful login, navigate to home
          break;
        case 'auth/loginFailure':
          // this.errorAlert(state.auth.status.error.message);
          break;
      }
    });
  }

  private handleSubmit(e: any) {
    // this.submitted = true;
    const { username, password } = this;

    if (username && password) {
      this.login({ username, password });
      router.push('/');
    }
  }
}
</script>
