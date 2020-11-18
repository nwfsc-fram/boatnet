<template>
  <div>
    <br />
    <div class="centered-page-item">{{vessel.activeVessel['vesselName']}}</div>

    <div class="centered-page-item row no-wrap">
      <q-btn
        class="bg-primary text-white q-ma-md"
        color="primary"
        to="/new-declaration"
      >Add Declaration to Cart</q-btn>
      <q-btn class="bg-green text-white q-ma-md" @click="submitDeclarations">Submit Declaration/s</q-btn>
    </div>

    <br />
    <div class="centered-page-item">Declarations Cart</div>

    <div
      v-if="cartEmpty"
      class="text-primary centered-page-item"
    >The declarations cart is currently empty. To add a declaration click "ADD DECLARATION TO CART" above.</div>

    <div v-if="Object.keys(oleVessel).length > 0">
      <div class="q-pa-md column">
        <q-card
          v-for="(obj, index) in oleVessel.cartDeclarations"
          :key="index"
          class="my-card bg-green text-white"
        >
          <q-card-section>
            <div class="row no-wrap">
              <div class="text-h6">{{ obj["declarationCode"] }}</div>
              <q-btn
                class="offset-9 items-start"
                style="font-size: 18px; line-height: 4px; margin-top: -20px; margin-bottom: 10px"
                flat
                round
                icon="close"
                @click="deleteFromCart(index)"
              />
            </div>
            <div style="font-size: 14px">{{ obj['declarationDescrip'] }}</div>
            <div v-show="obj['observerStatus'] !== 'N/A'" style="font-size: 14px">Observer Status: {{ obj["observerStatus"] }}</div>
            <div v-if="'activityDescrip' in obj" style="font-size: 14px" class="text-overflow: ellipsis">Note: {{ obj["activityDescrip"] }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script  lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { VesselState, UserState, AlertState } from '../_store/types/types';

import moment from 'moment';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';
import { AuthState, authService } from '@boatnet/bn-auth';
import { Notify } from 'quasar';
import { Vessel, OLEVessel, Declaration } from '@boatnet/bn-models';

@Component
export default class DeclarationCart extends Vue {
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private userRoles: string[] = [];
  private oleVessel: OLEVessel = {};
  private activeVesselId: string = '';
  private cartEmpty: boolean = true;
  private dbReturn: any = null;

  // TODO: right now this just writes to couch
  // will need section that synchs/writes to OLE
  // database tables
  private async submitDeclarations() {
    const masterDB = couchService.masterDB;

    if (this.oleVessel.cartDeclarations!.length > 0) {
      for (const dec of this.oleVessel.cartDeclarations!) {
        dec.transactionDate = this.formatDateTime(new Date());
      }

      this.oleVessel.deactivatedDeclarations = this.oleVessel.activeDeclarations!.concat(
        this.oleVessel.deactivatedDeclarations
      );
      this.oleVessel.activeDeclarations = this.oleVessel.cartDeclarations;
      this.oleVessel.cartDeclarations = [];

      const out = await masterDB.post(this.oleVessel).then(
        setTimeout(() => {
          this.$router.push({ path: '/declaration-receipt' });
        }, 500)
      );
    } else {
      this.$q.notify({
        color: 'red-5',
        textColor: 'white',
        icon: 'warning',
        message: 'Cart is empty'
      });
    }
  }

  private async deleteFromCart(index: number) {
    const masterDB = couchService.masterDB;
    this.oleVessel.cartDeclarations!.splice(index, 1);

    if (this.oleVessel.cartDeclarations!.length < 1) {
      this.cartEmpty = true;
    }

    // Could probably do something with all these signals
    // coming back from masterDB.post
    const out = await masterDB.post(this.oleVessel);

    // Refetch doc
    try {
      this.dbReturn = this.getOleVessel();
    } catch (err) {
      console.log('failed couch attempt');
    }
  }

  private async getOleVessel() {
    console.log('attempting to fetch cart from couch');
    try {
      const masterDB: Client<any> = couchService.masterDB;

      const options = {
        include_docs: true,
        key: this.activeVesselId
      };
      const vessels: any = await masterDB.view<any>(
        'OLEDeclarations',
        'all_ole_vessels',
        options
      );
      this.oleVessel = [];
      for (const v of vessels.rows) {
        this.oleVessel = v.doc;
      }
      if (this.oleVessel.cartDeclarations!.length < 1) {
        this.cartEmpty = true;
      } else {
        this.cartEmpty = false;
      }
      return vessels;
    } catch (err) {
      this.errorAlert(err);
    }
  }

  private formatDateTime(date: any) {
    return moment(date).format('MM/DD/YYYY, HH:mm');
  }

  // Added to cart success
  private notifySuccess(message: string) {
    Notify.create({
      message: 'Success: ' + message,
      position: 'top-right',
      color: 'green',
      timeout: 2000,
      icon: 'check',
      multiLine: true
    });
  }

  private created() {
    this.activeVesselId = this.vessel.activeVessel.coastGuardNumber;
    if (authService.getCurrentUser()) {
      this.userRoles = JSON.parse(
        JSON.stringify(authService.getCurrentUser()!.roles)
      );
    }
    try {
      const dbReturn = this.getOleVessel();
    } catch (err) {
      console.log('failed couch attempt');
    }
  }
}
</script>
