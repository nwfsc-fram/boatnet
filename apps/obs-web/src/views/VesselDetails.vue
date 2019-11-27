<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
            <q-btn flat label="Dismiss" @click="clearAlert"/>
        </template>
        </q-banner>

        <q-btn
        v-model="vessel.activeVessel.isActive"
        :label="vessel.activeVessel.isActive ? 'Active' : 'Inactive'"
        @click="vessel.activeVessel.isActive = !vessel.activeVessel.isActive"
        :color="vessel.activeVessel.isActive === true ? 'primary': 'grey-5' "
        >
        </q-btn>

        <q-input v-model="vessel.activeVessel.vesselName" label="Vessel Name" @click.native="selectText"></q-input>
        <div class="row">
            <div class="col-sm q-pa-md">
                <q-input v-model="vessel.activeVessel.coastGuardNumber" label="Coast Guard Number" @click.native="selectText"></q-input>
            </div>
            <div class="col-sm q-pa-md">
                <q-input v-model="vessel.activeVessel.stateRegulationNumber" label="State Regulation Number" @click.native="selectText"></q-input>
            </div>
        </div>

        <q-input v-model="vessel.activeVessel.registeredLength.value" label="Registered Length (feet)" type="number" @click.native="selectText"></q-input>

        <!-- <q-input v-model="vessel.activeVessel.vesselType.description" label="Vessel Type"></q-input> -->
        <p class='text-primary'>To Do: vessel type - is this a lookup?</p>

        <q-input v-model="vessel.activeVessel.notes" label="Notes" @click.native="selectText"></q-input>

        <q-select
            v-model="vessel.activeVessel.port"
            label="Port"
            :options="ports"
            :option-label="opt => opt.name"
            option-value="_id"
            @filter="portsFilterFn"
            stack-label
            use-input
            fill-input
            hide-selected
            @click.native="selectText"
            >
        </q-select>

        <q-select
            v-model="vessel.activeVessel.captains"
            label="Vessel Captains"
            :options="captains"
            :option-label="opt => opt.firstName + ' ' + opt.lastName + ' (' + opt.workEmail + ')' "
            option-value="_id"
            @filter="captainsFilterFn"
            stack-label
            use-input
            multiple
            use-chips
            >
        <template v-slot:selected-item="scope">
            <q-chip
                removable
                dense
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex"
                color="primary"
                text-color="white"
                >
                <q-avatar color="primary" text-color="white" icon="person" />
                <span v-if="scope.opt.label">{{ scope.opt.label }}</span>
                <span v-else>{{ scope.opt.firstName + ' ' + scope.opt.lastName }}</span>
            </q-chip>
        </template>
        </q-select>

        <div class="row">
            <div class="col-sm q-pa-md">
                <q-select
                    v-model="vessel.activeVessel.emHardware"
                    label="EM Hardware"
                    :options="hardwareOptions"
                    :option-label="opt => opt.description"
                    option-value="_id"
                    stack-label
                ></q-select>
            </div>
            <div class="col-sm q-pa-md">
                <q-select
                    v-model="vessel.activeVessel.thirdPartyReviewer"
                    label="3rd Party Reviewer"
                    :options="reviewerOptions"
                    :option-label="opt => opt.description"
                    option-value="_id"
                    stack-label
                ></q-select>
            </div>
        </div>

        <q-btn label="Cancel" color="red" icon="warning" @click="navigateBack"></q-btn>
        <q-btn label="Save" color="primary" icon="fa fa-save" @click="saveCaptain"></q-btn>

        <q-btn style="float: right" v-if="vessel.activeVessel._id" label="Delete" icon="fa fa-trash" color="red" @click="showDialog = true"></q-btn>

        <q-dialog v-model="showDialog">
            <q-card>
                <q-card-section>
                    <div class="text-h6">
                        Are you sure you want to delete this vessel?  This action can not be undone.
                    </div>
                    <q-card-actions style="float: right">
                        <q-btn label="Delete" color="red" @click="deleteVessel"></q-btn>
                        <q-btn label="Cancel" color="primary" @click="showDialog = false"></q-btn>
                    </q-card-actions>
                </q-card-section>
            </q-card>
        </q-dialog>

    </div>


</template>

<script lang="ts">
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator

import router from '../router';
import { AlertState, VesselState, UserState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { Vessel, VesselTypeTypeName, PersonTypeName } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';

@Component
export default class VesselDetails extends Vue {
    @State('user') private user!: UserState;
    @State('vessel') private vessel!: VesselState;

    @State('alert') private alert!: AlertState;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;


    private captains = [];
    private ports = [];
    private showDialog = false;
    private hardwareOptions = [];
    private reviewerOptions = [];

    private selectText(event: any) {
      event.target.select();
    }

    private portsFilterFn(val: string, update: any, abort: any) {
        update(
            async () => {
                try {
                    const db = pouchService.db;
                    const queryOptions = {
                    limit: 5,
                    start_key: val.toLowerCase(),
                    inclusive_end: true,
                    descending: false,
                    include_docs: true
                    };

                    const ports = await db.query(
                        pouchService.lookupsDBName,
                        'obs_web/all_port_names',
                        queryOptions
                        );
                    this.ports = ports.rows.map((row: any) => row.doc);
                } catch (err) {
                    this.errorAlert(err);
                }
            }
        );
    }

    private captainsFilterFn(val: string, update: any, abort: any) {
        update(
            async () => {
                try {
                    const db = couchService.masterDB;
                    const queryOptions = {
                    limit: 20,
                    start_key: val.toLowerCase(),
                    inclusive_end: true,
                    descending: false,
                    include_docs: true
                    };

                    const captains = await db.viewWithDocs(
                        'obs_web',
                        'all_active_persons',
                        queryOptions
                        );

                    this.captains = captains.rows.map((row: any) => row.doc);
                } catch (err) {
                    this.errorAlert(err);
                }
            }
        );
    }

    private async saveCaptain() {
        const masterDB: Client<any> = couchService.masterDB;
        if (this.$route.params.id === 'new') {
            try {
                masterDB.post(this.vessel.activeVessel).then(
                    () => this.$router.push({path: '/vessels'})
                );
            } catch (err) {
                this.errorAlert(err);
            }
        } else {
            try {
                this.vessel.activeVessel!.updatedBy = authService.getCurrentUser()!.username;
                this.vessel.activeVessel!.updatedDate = moment().format();

                delete this.vessel.activeVessel!.__index;

                masterDB.put(this.vessel.activeVessel!._id!,
                                this.vessel.activeVessel!,
                                this.vessel.activeVessel!._rev!
                            ).then( () => this.$router.push({path: '/vessels'}));

            } catch (err) {
                this.errorAlert(err);
            }
        }

    }

    private async deleteVessel() {
        couchService.masterDB.delete(this.vessel.activeVessel!._id, this.vessel.activeVessel!._rev).then( () => {
            this.errorAlert('Vessel Deleted');
            this.showDialog = false;
            this.navigateBack();
            this.vessel.activeVessel = {};
            });
    }

    private newCaptain() {
            const newUser = {
                type: PersonTypeName,
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format()
            };
            this.user.activeUser = newUser;
            this.user.activeUser.activeVessel = this.vessel.activeVessel;
            this.user.activeUser.port = this.vessel.activeVessel!.homePort;
            this.user.newUser = true;
            this.$router.push({path: '/users/' + 'new'});
    }

    private navigateBack() {
        this.$router.back();
    }

    private async getOptions() {
        const db = pouchService.db;
        const queryOptions = {
            include_docs: true,
            key: 'em-hardware',
            reduce: false
        };

        try {
            const hardware = await db.query(
                pouchService.lookupsDBName,
                'obs_web/all_doc_types',
                queryOptions
            );

            this.hardwareOptions = hardware.rows.map((row: any) => row.doc);
        } catch (err) {
            this.errorAlert(err);
        }

        queryOptions.key = 'third-party-reviewer';

        try {
            const reviewers = await db.query(
                pouchService.lookupsDBName,
                'obs_web/all_doc_types',
                queryOptions
            );

            this.reviewerOptions = reviewers.rows.map((row: any) => row.doc);
        } catch (err) {
            this.errorAlert(err);
        }
    }

    private created() {
        this.getOptions();
    }

}

</script>

<style>
.my-special-class {
    width: 100px;
}

</style>
