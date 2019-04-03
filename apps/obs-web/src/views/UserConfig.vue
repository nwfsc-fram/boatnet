<template>
    <div>
    <div class="q-pa-md  q-gutter-md">
                <div class="centered-page-item">User Settings</div>
        <q-card>
            <q-card-section>
                <q-select dense v-model="vessel.activeVessel" option-label="vesselName" :options="vessels" label="Active Vessel" ></q-select>
                <br>
                <q-select
                    dense
                    v-model="user.activeUser.notification_prefs"
                    bg-color="white"
                    color="primary"
                    multiple
                    use-chips
                    use-input
                    stack-label
                    :options="notificationOptions"
                    style="width: 100%"
                    label="Notification Preferences"
                    >
                </q-select>
            </q-card-section>
        </q-card>
    </div>
    <app-user-details></app-user-details>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GeneralState, UserState, VesselState } from '../_store/types/types';

@Component
export default class UserConfig extends Vue {

    @State('user') private user!: UserState;
    @State('general') private general!: GeneralState;
    @State('vessel') private vessel!: VesselState;

    private get vessels() {
        return this.general.vessels;
    }

    private get notificationOptions() {
        return this.general.notificationOptions;
    }

    constructor() {
        super();
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
