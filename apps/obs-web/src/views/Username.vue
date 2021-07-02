<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="absolute-center"  style="width: 100%;">
      <div class="q-pa-sm column justify-center items-center full-height" style="margin-top: 150px">
        <q-form class="q-gutter-xs" style="width: 100%; max-width: 500px" @submit="handleSubmit">
          <div class="q-ma-md" style="text-align: center">
            <img alt="noaa logo" src="../assets/NOAA_logo.svg" style="height: 80px">
              &nbsp;
              <div
                class="text-h6 text-primary"
                style="font-size: 24px; display: inline; line-height: 80px; vertical-align: top"
              >
                Enter username
              </div>
            <br><br>
          </div>

          <q-input
                outlined
                ref="username"
                v-model="username"
                dense
                autocorrect="off" autocapitalize="off" spellcheck="false"
                label="Username"/>
            <q-banner v-if="showDialog" class="bg-grey-3">
              CHECK YOUR EMAIL. If you have not received the reset password email after a short period of time, please check your spam folder.
              <template v-slot:action>
                <q-btn flat color="primary" label="Return to sign in" to="/login"/>
              </template>
            </q-banner>
            <div style="text-align: center">
              <q-btn
                v-if="!submitted"
                class="full-width"
                color="primary"
                label="Submit"
                dense
                type="submit"
                align="center"
              />
            </div>
        </q-form>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
// https://github.com/kaorun343/vue-property-decorator

import Vue from 'vue';
import Component from 'vue-class-component';
import { authService } from '@boatnet/bn-auth/lib';
import { dropRight } from 'lodash';

@Component
export default class Username extends Vue {

  private username = '';
  private showDialog = false;
  private submitted = false;

  private async handleSubmit() {
    let path: string = window.location.pathname;
    const pathArr: string[] = path.split('/');
    path = dropRight(pathArr).join('/');

    const resetPasswordURL = window.origin + path + '/password?username=' + this.username;
    const usernamePage = window.origin + path + '/username';
    this.showDialog = true;
    this.submitted = true;

    const appName: string = 'Observer Web';
    const appShortName = 'BOATNET_OBSERVER';

    try {
      await authService.sendPasswordResetEmail(this.username, appName, appShortName,
        resetPasswordURL, usernamePage);
    } catch (error) {
      console.log(error);
    }
  }
}
</script>
