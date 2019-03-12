<template>
  <q-page padding>
    <h4>Login [not implemented]</h4>
    <form @submit.prevent="login">
      <label for="username">Username</label>
      <div>
        <input id="username" type="text" v-model="username" required>
      </div>

      <label for="password">Password</label>
      <div>
        <input id="password" type="password" v-model="password" required>
      </div>

      <label for="password-confirm">Confirm Password</label>
      <div>
        <input id="password-confirm" type="password" v-model="passwordConfirmation" required>
      </div>
    </form>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BoatnetLogin extends Vue {
  private username = '';
  private password = '';
  private passwordConfirmation = '';

  constructor() {
    super();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
