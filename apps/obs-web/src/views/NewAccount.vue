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
                Boatnet Account Creation
              </div>
            <br><br>
          </div>
            <b>A vessel ID and corresponding passcode are required to create an account.</b>
            <q-input
                outlined
                type="text"
                v-model="vesselId"
                label="Vessel ID"
                dense
                :rules="[
                  val => !! val || 'Vessel Id is required'
                ]"
            >
            </q-input>
            <q-input
                outlined
                type="text"
                v-model="passcode"
                label="Passcode"
                dense
                :rules="[
                    val => !! val || 'Passcode is required',
                    val => /\d/.test(val) || 'Must be a number'
                ]"
            >
            </q-input>

            <q-input
                outlined
                type="text"
                v-model="username"
                label="Username (valid email address)"
                dense
                :rules="[
                    val => new RegExp('[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+').test(val) || 'Must be a valid email address'
                ]"
            >
            </q-input>

            <div v-if="errorMsg" style="color: red">{{errorMsg}}</div>
            <div v-else style="color: green">{{successMsg}}</div>

          <q-input
          label="First Name"
          v-model="firstName"
          :rules="[
            val => !! val || 'Field is required'
          ]"
          dense
          outlined
          ></q-input>

          <q-input
          label="Last Name"
          v-model="lastName"
          :rules="[
            val => !! val || 'Field is required'
          ]"
          dense
          outlined
          ></q-input>

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
            <q-banner v-if="showDialog" class="bg-grey-3">
              CHECK YOUR EMAIL. If you have not received the reset password email after a short period of time, please check your spam folder.
              <template v-slot:action>
                <q-btn flat color="primary" label="Return to sign in" to="/login"/>
              </template>
            </q-banner>
        </q-form>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { authService } from '@boatnet/bn-auth/lib';
import {
  createComponent,
  ref,
} from '@vue/composition-api';

import { Notify } from 'quasar';

import { checkVesselPasscode } from '@boatnet/bn-common';
import dbConfig from '../config/dbConfig';
import axios from 'axios';
import { dropRight } from 'lodash';

export default createComponent({
    setup(props, context) {
        const errorMsg = ref('');
        const firstName = ref('');
        const lastName = ref('');
        const passcode = ref(null);
        const submitted = ref(false);
        const successMsg = ref('');
        const username = ref('');
        const vesselId = ref('');
        const showDialog = ref(false);

        const handleSubmit = async () => {
            if (
                // new RegExp("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+").test(username.value) &&
                vesselId.value &&
                passcode.value &&
                firstName.value &&
                lastName.value
            ) {
              await checkVesselPasscode(vesselId.value, passcode.value).then(
                async (res: any) => {
                  if (res === 'true') {
                    await createAccount(username.value, firstName.value, lastName.value);

                    let path: string = window.location.pathname;
                    const pathArr: string[] = path.split('/');
                    path = dropRight(pathArr).join('/');

                    const resetPasswordURL = window.origin + path + '/password?username=' + username.value;
                    const usernamePage = window.origin + path + '/username';

                    const appName: string = 'Observer Web';
                    const appShortName = 'BOATNET_OBSERVER';

                    console.log(path);
                    console.log(usernamePage);
                    console.log(resetPasswordURL);

                    try {
                      await authService.sendPasswordResetEmail(username.value, appName, appShortName, resetPasswordURL, usernamePage);
                      showDialog.value = true;
                    } catch (error) {
                      Notify.create({
                        message: '<b>Unable to create user</b>',
                            position: 'center',
                            color: 'primary',
                            timeout: 2000,
                            icon: 'warning',
                            html: true,
                            multiLine: true
                        });
                      }
                  }
                }
              );
            } else {
                Notify.create({
                    message: '<b>Unable to create user</b>',
                        position: 'center',
                        color: 'primary',
                        timeout: 2000,
                        icon: 'warning',
                        html: true,
                        multiLine: true
                    });
            }
        };

        const createAccount = async (newusername: string, firstname: string, lastname: string) => {
          const apiUrl = dbConfig && dbConfig.apiUrl ? dbConfig.apiUrl : '';
          const creationResponse = await axios
          .post(apiUrl + '/api/v1/addUser', {username: newusername, lastName: lastname, firstName: firstname, emailAddress: newusername, comment: 'placeholder comment'}).catch((err: any) => {
            if (err.response && err.response.status === 401) {
              console.error('[Auth Service]', err.response);
              Notify.create({
                message: '<b>' + err.response.data.message + '</b>',
                    position: 'center',
                    color: 'primary',
                    timeout: 2000,
                    icon: 'warning',
                    html: true,
                    multiLine: true
                });
              throw new Error(err.response.data.message);
            } else if (err.response && err.response.status === 404) {
              Notify.create({
                message: '<b>' + err.response.data.message + '</b>',
                    position: 'center',
                    color: 'primary',
                    timeout: 2000,
                    icon: 'warning',
                    html: true,
                    multiLine: true
                });
              throw new Error(err.response.data.message);
            }
          });
        };

        return {
            errorMsg,
            firstName,
            handleSubmit,
            lastName,
            passcode,
            showDialog,
            submitted,
            successMsg,
            username,
            vesselId
        };
    }
});
</script>
