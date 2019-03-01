<template>
  <div class="hello">
    <h1>Hello</h1>
    <button v-on:click="onLogout">Log Out</button>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapState, mapActions, mapGetters } from 'vuex';
import { createDecorator } from 'vue-class-component';

function MapGetters(namespace: any, states: any) {
  return createDecorator((options) => {
    if (!options.computed) {
      options.computed = {};
    }
    Object.assign(options.computed, mapGetters(namespace, states));
  });
}

@Component
export default class HomePage extends Vue {
  //   @MapGetters('account', ['login', 'logout'])
  // public onLogout() {
  //   this.logout();
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
