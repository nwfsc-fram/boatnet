<template>
    <div>
    <div class="q-pa-md  q-gutter-md">
                <div class="text-h6" style="text-align: center"><strong>User Settings</strong></div>
        <q-card>
            <q-card-section>
                <q-select dense v-model="activeVessel" :options="vessels" label="Active Vessel" ></q-select>
                <br>
                <q-select
                    dense
                    v-model="activeUser.notification_prefs"
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
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class UserConfig extends Vue {

    private vessels = ['Excalibur', 'Raven'];
    private notificationOptions = ['email', 'sms/text', 'app'];

    private get activeVessel() {
        return this.$store.getters.activeVessel;
    }

    private set activeVessel(value) {
        this.$store.dispatch('updateActiveVessel', value);
    }

    private get activeUser() {
        return this.$store.getters.activeUser;
    }

    private set activeUser(value) {
        this.$store.dispatch('updateActiveUser', value);
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
