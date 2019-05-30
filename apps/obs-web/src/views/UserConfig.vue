<template>

    <div class="q-pa-md  q-gutter-md">
        <app-user-details></app-user-details>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GeneralState, UserState, VesselState } from '../_store/types/types';
import { Vessel } from '@boatnet/bn-models';

// import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AlertState } from '../_store/types/types';

@Component
export default class UserConfig extends Vue {

    @State('user') private user!: UserState;
    @State('general') private general!: GeneralState;
    @State('vessel') private vessel!: VesselState;

    @State('alert') private alert!: AlertState;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;

    private vessels: Vessel[] = [];

    private notificationOptions: any[] = [
        {label: 'email', value: 'email', icon: 'mail'},
        {label: 'sms/text', value: 'sms/text', icon: 'sms'},
        {label: 'app', value: 'app', icon: 'smartphone'}
    ];

    constructor() {
        super();
    }

    private filterVessels(val: string, update: any, abort: any) {
      update(async () => {
            try {
              const masterDB: Client<any> = couchService.masterDB;
              const queryOptions: ListOptions = {
                limit: 7,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false
              };

              const vessels = await masterDB.viewWithDocs<any>(
                'optecs_trawl',
                'all_vessel_names',
                queryOptions
              );

              this.vessels = vessels.rows.map((row: any) => row.doc);
            } catch (err) {
              this.errorAlert(err);
            }
          });
        }

}
</script>

<!--
<script>
export default {
    data() {
        return {
            vessels: ['Excalibur', 'Raven'],
            notificationOptions: ['email', 'sms/text', 'app']
        }
    },
    computed: {
        activeVessel : {
            get() {
                return this.$store.getters.activeVessel
            },
            set(value) {
                this.$store.dispatch('updateActiveVessel', value)
            }
        },
        activeUser: {
            get() {
                return this.$store.getters.activeUser
            },
            set(value) {
                this.$store.dispatch('updateActiveUser', value)
            }
        }
    }
}
</script>
-->
