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
            v-model="vessel.activeVessel.homePort"
            label="Home Port"
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
            v-model="allowedPeople"
            label="Authorized Personnel"
            :options="personAliases"
            :option-label="opt => capitalize(opt.firstName) + ' ' + capitalize(opt.lastName) + ' (' + opt.userName + ')' "
            option-value="_id"
            @filter="personAliasesFilterFn"
            stack-label
            use-input
            multiple
            use-chips
            >
        <template v-if="allowedPeople" v-slot:selected-item="scope">
            <q-chip
                removable
                dense
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex"
                color="primary"
                text-color="white"
                >
                <q-avatar v-if="scope.opt.roles[0] == 'observer'" color="primary" text-color="white" icon="visibility" />
                <q-avatar v-if="scope.opt.roles[0] == 'captain'" color="primary" text-color="white" icon="directions_boat" />
                <q-avatar v-if="scope.opt.roles[0] == 'delegate'" color="primary" text-color="white" icon="work" />
                <span>{{ capitalize(scope.opt.firstName) + ' ' + capitalize(scope.opt.lastName) }}&nbsp; </span>
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
import { AuthState, authService } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { Vessel, VesselTypeTypeName, PersonTypeName } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import _ from 'lodash';

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
    private vesselPermissions: any[] = [];
    private vesselPermissionsDoc: any = {};
    private allowedPeople: any[] = [];
    private personAliases: any[] = [];
    private allPersonAliases: any[] = [];
    private vesselIndex: number = -1;

    private capitalize(text: string) {
        return _.startCase(_.toLower(text));
    }

    private async getPermissions() {
        this.vesselIndex = -1;
        this.allowedPeople = [];
        this.vesselPermissions = [];

        const masterDB = couchService.masterDB;
        const queryOptions = {
            key: 'vessel-permissions',
            reduce: false,
            include_docs: true
        };
        const permissions = await masterDB.view(
            'obs_web',
            'all_doc_types',
            queryOptions
        );

        this.vesselPermissionsDoc = permissions.rows[0].doc;
        const activeVesselId = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;

        for (const vessel of this.vesselPermissionsDoc.vesselAuthorizations) {
            if (vessel.vesselIdNum === activeVesselId) {
                this.vesselIndex = this.vesselPermissionsDoc.vesselAuthorizations.indexOf(vessel);
                for (const person of vessel.authorizedPeople) {
                    this.vesselPermissions.push(
                        {
                            vesselId: vessel.vesselIdNum,
                            vesselIndex: this.vesselPermissionsDoc.vesselAuthorizations.indexOf(vessel),
                            personIndex: vessel.authorizedPeople.indexOf(person),
                            personAliasId: person
                        }
                    );
                }
            }
        }

        const db = pouchService.db;
        for (const permission of this.vesselPermissions) {
            const alias = await db.get(
                permission.personAliasId,
                {},
                pouchService.lookupsDBName
            );
            if (alias) {
                this.allowedPeople.push(alias);
            }
        }
        this.allowedPeople = this.allowedPeople.filter( (alias) => alias.roles.includes('captain') || alias.roles.includes('delegate') );

    }

    private async getPersonAliases() {
        const db = pouchService.db;
        const queryOptions = {
            key: 'person-alias',
            reduce: false,
            include_docs: true
        };

        const aliases = await db.query(
            'obs_web/all_doc_types',
            queryOptions,
            pouchService.lookupsDBName
        );

        this.allPersonAliases = aliases.rows.map( (row: any) => row.doc );

    }

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
                        'obs_web/all_port_names',
                        queryOptions,
                        pouchService.lookupsDBName
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

  private async personAliasesFilterFn(val: string, update: any, abort: any) {
    if (val === '') {
      update(() => {
        this.personAliases = this.allPersonAliases;
      });
      return;
    }
    update(() => {
      const searchString = val.toLowerCase();
      this.personAliases = this.allPersonAliases.filter(
        (person: any) => person.firstName.toLowerCase().indexOf(searchString) > -1 || person.lastName.toLowerCase().indexOf(searchString) > -1
      );
    });

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
                            );
                            // .then( () => this.$router.push({path: '/vessels'}));

            } catch (err) {
                this.errorAlert(err);
            }
        }
        this.saveVesselPermissions();
    }

    private async saveVesselPermissions() {

        if (this.vesselIndex !== -1) {
            // update vesselPermissionsDoc at stored index
            this.vesselPermissionsDoc.vesselAuthorizations[this.vesselIndex].authorizedPeople = this.allowedPeople.map( (person: any) => person._id);
        } else {
            // push new permissions to vesselPermissionsDoc
            const newEntry: any = {};
            newEntry.vesselIdNum = this.vessel.activeVessel.coastGuardNumber ? this.vessel.activeVessel.coastGuardNumber : this.vessel.activeVessel.stateRegulationNumber;
            newEntry.authorizedPeople = this.allowedPeople.map( (person: any) => person._id);
            this.vesselPermissionsDoc.vesselAuthorizations.push(newEntry);
        }
        try {
            this.vesselPermissionsDoc.updatedBy = authService.getCurrentUser()!.username;
            this.vesselPermissionsDoc.updatedDate = moment().format();

            couchService.masterDB.put(this.vesselPermissionsDoc._id,
                            this.vesselPermissionsDoc,
                            this.vesselPermissionsDoc._rev
                        ).then( () => this.$router.push({path: '/vessels'}));

        } catch (err) {
            this.errorAlert(err);
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
                'obs_web/all_doc_types',
                queryOptions,
                pouchService.lookupsDBName
            );

            this.hardwareOptions = hardware.rows.map((row: any) => row.doc);
        } catch (err) {
            this.errorAlert(err);
        }

        queryOptions.key = 'third-party-reviewer';

        try {
            const reviewers = await db.query(
                'obs_web/all_doc_types',
                queryOptions,
                pouchService.lookupsDBName
            );

            this.reviewerOptions = reviewers.rows.map((row: any) => row.doc);
        } catch (err) {
            this.errorAlert(err);
        }
    }

    private created() {
        this.getOptions();
        this.getPermissions();
        this.getPersonAliases();
    }

}

</script>

<style>
.my-special-class {
    width: 100px;
}

</style>
