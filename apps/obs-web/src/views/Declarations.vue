<template>
  <div class="centered-page-item">
    <q-btn class="bg-primary text-white q-ma-md" to="/new-declaration">New Declaration</q-btn>
  </div>
</template>

<script  lang="ts">
</script>
<template>
  <div class="centered-page-item">
    <q-btn class="bg-primary text-white q-ma-md" to="/new-declaration">New Declaration</q-btn>

  </div>
</template>

<script  lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { Notify } from 'quasar';

@Component
export default class Declarations extends Vue {
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
}
</script>
