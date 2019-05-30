<template>
  <q-page class="flex flex-center">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>

    <img alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">

  </q-page>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action } from 'vuex-class';
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
  @State('alert') private alert!: AlertState;
  @State('auth') private auth!: AuthState;
  @State('user') private user!: UserState;

  @State('permit') private permit!: PermitState;
  @Action('updatePermits', { namespace: 'permit' }) private updatePermits: any;

  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

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
                if (row.doc.type === 'person' && row.doc.userName) {
                    if (row.doc.userName === authService.getCurrentUser()!.username) {

                        this.user.newUser = false;
                        this.user.activeUser = row.doc;
                    }
                }
            }
        } catch (err) {
            this.errorAlert(err);
        }
    }

  private getPermits() {

    axios.get('https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500' )
        .then( (response) => {
            // this.$store.dispatch('updatePermits', response.data.items);
            console.log(response.data.items);
            this.permit.permits = [];
            for (const item of response.data.items) {
              console.log(item);
              const permit: Permit = {
                type: 'permit',
                permitNumber: item.permit_number,
                certificateStartDate: item.certificate_start_date,
                permitType: 'NOAA Fisheries',
                certificateEndDate: item.certificate_end_date,
                owner: {
                  firstName: item.permit_owner,
                  addressLine1: item.permit_owner_address,
                  city: item.permit_owner_city,
                  state: item.permit_owner_state,
                  zipCode: item.permit_owner_zip
                },
                vessel: {
                  vesselName: item.vessel_name,
                  registeredLength: {value: item.vessel_length, units: 'feet'},
                  coastGuardNumber: item.vessel_registration_number,
                },
                isTrawlGear: item.trawl_gear === 'Yes' ? true : false,
                isLonglineGear: item.longline_gear === 'Yes' ? true : false,
                isTrapPotGear: item.trap_pot_gear === 'Yes' ? true : false,
                isSmallFleet: item.small_fleet === 'Yes' ? true : false,
                endorsedLength: item.endorsed_length,
                isSableFishEndorsed: item.sablefish_endorsement === 'Yes' ? true : false,
                sableFishTier: item.sablefish_tier ? item.sablefish_tier : null,
                isCpEndorsed: item.cp_endorsement === 'Yes' ? true : false,
                isMsEndorsed: item.ms_endorsement === 'Yes' ? true : false,
                isMothershipCatcherVessel: item.mothership_catcher_vessel === 'Yes' ? true : false,
                status: item.status,
                goid: item.goid,
                ghid: item.ghid,
                isOwnerOnBoardExempt: item.owner_on_board_exempt === 'Yes' ? true : false,
                whitingAssignment: item.whiting_assignment ? item.whiting_assignment : null,
                whitingPercent: item.whiting_assignment ? item.whiting_assignment : null
              };
              this.permit.permits.push(permit);
            }
            console.log(this.permit.permits);
        })
        .catch( (error) => {
          console.log(error);
          console.log(error.response);
        });
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