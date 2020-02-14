<template>
  <div class="centered-page-item">
    <q-btn class="bg-primary text-white q-ma-md" to="/new-declaration">New Declaration</q-btn>

    <p>If you would like to make your declaration/s by phone, please call the Office
      of Law Enforcement at 
      <a href="tel: 888-585-5518" data-rel="external">888-585-5518</a>
    </p>
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
