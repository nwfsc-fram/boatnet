<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="absolute-center"  style="width: 100%;">
      <div class="q-pa-sm column justify-center items-center full-height" style="margin-top: 150px">
        <q-form ref="passwordForm" class="q-gutter-xs" style="width: 100%; max-width: 500px" @submit="handleSubmit">
          <div class="q-ma-md" style="text-align: center">
            <img alt="noaa logo" src="../assets/NOAA_logo.svg" style="height: 80px">
              &nbsp;
              <div
                class="text-h6 text-primary"
                style="font-size: 24px; display: inline; line-height: 80px; vertical-align: top"
              >
                Set/Reset Password
              </div>
            <br><br>
          </div>

            <q-input
                outlined
                type="text"
                v-model="username"
                label="Username"
                dense
            >
            </q-input>

            <q-input
                outlined
                ref="password"
                :type="isPwd ? 'password' : 'text'"
                v-model="newPassword"
                label="New Password"
                dense
                autocorrect="off" autocapitalize="off" spellcheck="false"
                :rules="[ val => !! val || 'Field is required',
                          val => val.length >= 12 || 'Please use minimum 12 characters',  
                          val => /\d/.test(val) || 'Must contain a number',
                          val => /[a-z]/.test(val) || 'Must contain a lower case character',
                          val => /[A-Z]/.test(val) || 'Must contain an upper case character',
                          val => /[!#$%&()`*+,-./:;<=>?_]/.test(val) || 'Must contain a special character: !#$%&()`*+,-./:;<=>?_',
                          val => newPassword === val || 'Must match previously entered new password']"
            >
                <template v-slot:append>
                <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                />
                </template>
            </q-input>
            <q-input
                outlined
                ref="password"
                :type="isPwd ? 'password' : 'text'"
                v-model="confirmedPassword"
                label="Confirm New Password"
                dense
                :rules="[ val => !! val || 'Field is required',
                          val => val.length >= 12 || 'Please use minimum 12 characters',  
                          val => /\d/.test(val) || 'Must contain a number',
                          val => /[a-z]/.test(val) || 'Must contain a lower case character',
                          val => /[A-Z]/.test(val) || 'Must contain an upper case character',
                          val => /[!#$%&()`*+,-./:;<=>?_]/.test(val) || 'Must contain a special character: !#$%&()`*+,-./:;<=>?_',
                          val => newPassword === val || 'Must match previously entered new password']"
            >
                <template v-slot:append>
                <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                />
                </template>
          </q-input>
            <div v-if="errorMsg" style="color: red">{{errorMsg}}</div>
            <div v-else style="color: green">{{successMsg}}</div>
            <div>Password must contain:</div>
          <ul>
              <li>12 characters</li>
              <li>No words</li>
              <li>Upper case character</li>
              <li>Lower case character</li>
              <li>Numeric character</li>
              <li>Special case character among !#$%&()`*+,-./:;<=>?_</li>
          </ul>
          
            <div style="text-align: center">
              <q-btn
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
import { authService } from '@boatnet/bn-auth/lib';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Password extends Vue {
  @Prop({ default: undefined }) public username!: string;
  @Prop({ default: undefined }) public SESS!: string;

  private newPassword = '';
  private confirmedPassword = '';
  private isPwd = true;
  private errorMsg = '';
  private successMsg = '';

  private async handleSubmit() {
    this.errorMsg = "";
    this.successMsg = "";

    const appShortName = 'BOATNET_OBSERVER';
    const appName = 'Research Catch';

    try {
      const e = await authService.resetPassword(this.username, this.newPassword,
        this.confirmedPassword, appShortName, this.SESS, appName);
    } catch (error) {
      this.errorMsg = error;
    }
    if (!this.errorMsg) {
      this.successMsg = 'Success';
      this.$router.push({ path: '/' });
    }
  }

}
</script>
