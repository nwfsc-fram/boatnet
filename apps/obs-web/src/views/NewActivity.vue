<template>
    <div>
        <q-card>
            <q-card-section>

                <div class="row items-start">
                    <div style="width: 320px" class="q-pa-md">
                        <q-select
                            v-model="newActivity.activityType"
                            :options="activityTypes"
                            label="Activity Type"
                            dense>
                        </q-select>
                    </div>
                    <div style="width: 320px" class="q-pa-md">
                        <q-input
                            v-model="newActivity.activityDescription"
                            label="Description"
                            dense>
                        </q-input>
                    </div>
                </div>

                <div class="row items-start">
                    <div class="q-pa-md">
                        <p><strong>Start Date</strong></p>
                        <q-date
                            v-model="newActivity.startDate"
                            minimal>
                        </q-date>
                    </div>
                    <div class="q-pa-md">
                        <p><strong>End Date</strong></p>
                        <q-date
                            v-model="newActivity.endDate"
                            minimal>
                        </q-date>
                    </div>
                </div>
            <q-card-actions>
                <q-btn color="red" label="Cancel" icon="warning" to="/observer-availability" exact/>
                <q-btn color="primary" label="Submit" to="/observer-availability" exact/>
            </q-card-actions>
            </q-card-section>

        </q-card>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TripState, VesselState, UserState, ObserverAssignmentState } from '../_store/types/types';
import moment from 'moment';

@Component
export default class NewActivity extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('oa') private oa!: ObserverAssignmentState;

private pagination = {rowsPerPage: 0};
private alert = false;
private newActivity = {};
private activityTypes = ['Training', 'Vacation'];

}
</script>