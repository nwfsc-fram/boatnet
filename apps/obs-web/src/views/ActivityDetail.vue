<template>
    <div class="justify-content-center">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>

            <div class="row items-start">
                <div style="width: 100%" class="q-pa-md">
                    <q-select
                        v-model="obact.activeActivity.activityType"
                        :options="activityTypes"
                        label="Activity Type"
                        dense>
                    </q-select>
                </div>
                <div style="width: 100%" class="q-pa-md">
                    <q-input
                        v-model="obact.activeActivity.activityDescription"
                        label="Description"
                        dense
                         @click.native="selectText">
                    </q-input>
                </div>
            </div>

            <q-list>
                <div class="row items-start">
                <q-item>
                    <q-item-section>
                    <div class="text-subtitle2" >Start Date</div>

                    <pCalendar
                        v-model="activityStartDate"
                        :inline="true"
                        :minDate="minStartDate"
                    >
                    </pCalendar>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section>
                    <div class="text-subtitle2">End Date</div>
                    <pCalendar
                        v-model="activityEndDate"
                        :inline="true"
                        :minDate="minEndDate"
                    >
                    </pCalendar>

                    </q-item-section>
                </q-item>
                </div>
            </q-list>

            <div style="float: right; padding: 15px">
                <q-btn color="red" label="Cancel" icon="warning" to="/observer-availability" exact/>
                <q-btn v-if="obact.activeActivity._id" color="red" label="Delete" icon="fa fa-trash" @click="deleteActivity"></q-btn>
                <q-btn color="primary" @click="updateActivity" icon="fa fa-save" label="save"/>
            </div>

    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TripState, VesselState, UserState, ObserverAssignmentState, ObserverAvailabilityState, AlertState } from '../_store/types/types';
import moment from 'moment';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService } from '@boatnet/bn-auth';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

@Component
export default class ActivityDetail extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('oa') private oa!: ObserverAssignmentState;
    @State('obact') private obact!: ObserverAvailabilityState;

    @State('alert') private alert!: AlertState;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;

private pagination = {rowsPerPage: 0};
private newActivity = {};
private activityTypes = [
                        'Briefing',
                        'Debriefing',
                        'Meeting',
                        'Standby',
                        'Training',
                        'Travel',
                        'Vacation',
                        'Unpaid Leave'
                        ];

private selectText(event: any) {
    event.target.select();
}

private get activityStartDate() {
    if (this.obact.activeActivity.startDate) {
        return new Date(this.obact.activeActivity.startDate);
    } else {
        return undefined;
    }
}

private set activityStartDate(startDate) {
    this.obact.activeActivity.startDate = startDate;
    if (moment(this.obact.activeActivity.startDate) > moment(this.obact.activeActivity.endDate)) {
        this.obact.activeActivity.endDate = undefined;
    }
}

private get activityEndDate() {
    if (this.obact.activeActivity.endDate) {
        return new Date(this.obact.activeActivity.endDate);
    } else {
        return undefined;
    }
}

private set activityEndDate(endDate) {
    this.obact.activeActivity.endDate = endDate;
}

private get minStartDate() {
    return new Date();
}

private get minEndDate() {
    if (this.obact.activeActivity.startDate) {
        return new Date(this.obact.activeActivity.startDate);
    } else {
        return undefined;
    }
}

private updateActivity() {
    if (this.obact.isNewActivity) {
        this.obact.activeActivity.observer = this.user.activeUser;
        pouchService.db.post(this.obact.activeActivity);
        this.$router.push({path: '/observer-availability'});
    } else {
        delete this.obact.activeActivity.__index;
        this.obact.activeActivity.observer = this.user.activeUser;
        this.obact.activeActivity.updatedBy = authService.getCurrentUser()!.username;
        this.obact.activeActivity.updatedDate = moment().format();

        pouchService.db.put(this.obact.activeActivity);
        this.$router.push({path: '/observer-availability'});
    }
}

private deleteActivity() {
    pouchService.db.remove(this.obact.activeActivity);
    this.obact.activeActivity = undefined;
    this.obact.isNewActivity = false;
    this.$router.push({path: '/observer-availability'});
}

}
</script>