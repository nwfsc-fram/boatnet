<template>
  <q-page class="flex flex-center">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>

    <span v-if='isSyncing' style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <span
      class="text-primary text-h6"
      style="text-align: center; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-transform: uppercase; font-weight: bold">Wait<br>Syncing</span>
      <q-spinner-puff
      color="primary"
      size="20em"/>
    </span>
    <img v-else alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">

  </q-page>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action, Getter } from 'vuex-class';
import { AlertState, VesselState, PermitState, UserState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { EmEfp, Permit } from '@boatnet/bn-models';
import moment from 'moment';
import axios from 'axios';

@Component
export default class Home extends Vue {
  @State('auth') private auth!: AuthState;
  @State('user') private user!: UserState;

  @State('permit') private permit!: PermitState;
  @Action('updatePermits', { namespace: 'permit' }) private updatePermits: any;
  @State('vessel') private vessel!: VesselState;

  @State('alert') private alert!: AlertState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;

  @Getter('isSyncing', { namespace: 'pouchState' }) private isSyncing: any;
  @Getter('syncStatus', { namespace: 'pouchState'}) private syncStatus: any;

  constructor() {
    super();
  }

    private async getUserFromUserDB() {
        // get user doc from userDB if exits
        console.log('getting user from userDB');

        try {
            const allDocs = await pouchService.db.allDocs(
                pouchService.userDBName
                );

            for (const row of allDocs.rows) {
                if (row.doc.type === 'person' && row.doc.apexUserAdminUserName) {
                    if (row.doc.apexUserAdminUserName === authService.getCurrentUser()!.username) {

                        this.user.newUser = false;
                        this.user.activeUser = row.doc;
                        if (row.doc.activeVessel) {
                          this.vessel.activeVessel = row.doc.activeVessel;
                        }
                    }
                }
            }
        } catch (err) {
            this.errorAlert(err);
        }
    }

  private async getPermits() {
    console.log('getting permits from masterDB');
    this.permit.permits = [];
    this.permit.vesselPermits = {};
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const permits = await masterDB.viewWithDocs<any>(
            'obs-web',
            'all_permits',
            );
        console.log(permits);
        for (const row of permits.rows) {
            const permit = row.doc;

            if (permit.vessel && permit.vessel.coastGuardNumber !== 'UNIDENTIFIED' ) {
              const vesselId = permit.vessel.coastGuardNumber;
              if (!this.permit.vesselPermits[vesselId]) {
                this.permit.vesselPermits[vesselId] = [];
              }
              this.permit.vesselPermits[vesselId].push(permit);
            }
            this.permit.permits.push(permit);
        }

        } catch (err) {
            this.errorAlert(err);
        }
    // axios.get('https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500' )
    //     .then( (response) => {
    //         this.permit.permits = [];
    //         for (const item of response.data.items) {
    //           const permit: Permit = {
    //             type: 'permit',
    //             permitNumber: item.permit_number,
    //             certificateStartDate: item.certificate_start_date,
    //             permitType: 'NOAA Fisheries',
    //             certificateEndDate: item.certificate_end_date,
    //             owner: {
    //               firstName: item.permit_owner,
    //               addressLine1: item.permit_owner_address,
    //               city: item.permit_owner_city,
    //               state: item.permit_owner_state,
    //               zipCode: item.permit_owner_zip
    //             },
    //             vessel: {
    //               vesselName: item.vessel_name,
    //               registeredLength: {value: item.vessel_length, units: 'feet'},
    //               coastGuardNumber: item.vessel_registration_number,
    //             },
    //             isTrawlGear: item.trawl_gear === 'Yes' ? true : false,
    //             isLonglineGear: item.longline_gear === 'Yes' ? true : false,
    //             isTrapPotGear: item.trap_pot_gear === 'Yes' ? true : false,
    //             isSmallFleet: item.small_fleet === 'Yes' ? true : false,
    //             endorsedLength: item.endorsed_length,
    //             isSableFishEndorsed: item.sablefish_endorsement === 'Yes' ? true : false,
    //             sableFishTier: item.sablefish_tier ? item.sablefish_tier : null,
    //             isCpEndorsed: item.cp_endorsement === 'Yes' ? true : false,
    //             isMsEndorsed: item.ms_endorsement === 'Yes' ? true : false,
    //             isMothershipCatcherVessel: item.mothership_catcher_vessel === 'Yes' ? true : false,
    //             status: item.status,
    //             goid: item.goid,
    //             ghid: item.ghid,
    //             isOwnerOnBoardExempt: item.owner_on_board_exempt === 'Yes' ? true : false,
    //             whitingAssignment: item.whiting_assignment ? item.whiting_assignment : null,
    //             whitingPercent: item.whiting_assignment ? item.whiting_assignment : null
    //           };
    //           this.permit.permits.push(permit);
    //         }
    //     })
    //     .catch( (error) => {
    //       this.errorAlert(error);
    //       this.errorAlert(error.response);
    //     });
  }

  private created() {
    // this.couch();
    this.getPermits();
    this.getUserFromUserDB();
  }

}
</script>

<style>
.hero-logo {
  width: 40%;
}

@media screen and (orientation: portrait) {
  .hero-logo {
    width: 80%;
  }
}

</style>