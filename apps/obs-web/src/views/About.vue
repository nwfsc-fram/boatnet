<template>
  <q-page padding>
    <div class="text-h6 text-primary" >About</div>
  </q-page>
</template>

<!--
<script>
export default {
  name: 'PageAbout'
};
</script>
-->


<script lang="ts">

// import { mapState } from 'vuex';
import { State, Action, Getter, Mutation } from 'vuex-class';
import { AlertState } from '../_store/types/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { UsState, UsStateTypeName } from '@boatnet/bn-models';

import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';

@Component
export default class About extends Vue {

  private newState: UsState = {type: UsStateTypeName, name: '', abbreviation: ''};
  private usStates: UsState[] = [];

  @State('alert') private alert!: AlertState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  constructor() {
    super();
  }


}

</script>
