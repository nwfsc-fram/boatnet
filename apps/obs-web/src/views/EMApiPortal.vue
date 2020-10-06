<template>
    <div class="q-ma-md q-pa-md">
        <span class="portal-heading">API Catch (logbook/em review) Submission Portal</span>
        <div class="row">
            <q-input
                v-model="tripNum"
                outlined
                dense
                autogrow
                label="Trip Number (6 digits)"
                title="6 digit trip number"
                class="portal-element"
                :rules="[val => (/^((?![a-zA-Z]).)*$/.test(val) || !val) || 'weight must be a number']"
            ></q-input>
            <q-select
                v-model="catchType"
                outlined
                dense
                :options="['logbook', 'em review']"
                label="submission type"
                class="portal-element"
                :rules="[val => val.length > 0 || 'submission type is required']"
            ></q-select>
        </div>

        <label class="fileInput shadow-2 bg-primary text-white">Load JSON file
            <q-input
                v-model="inputFile"
                type="file"
                accept="application/JSON"
                style="display: none"
                ></q-input>
        </label>

        <q-btn
            color="primary"
            label="load logbook example"
            @click="loadLogbook"
            class="q-ma-md"
        ></q-btn>

        <q-btn
            color="primary"
            label="load review example"
            @click="loadReview"
        ></q-btn>

        <q-scroll-area style="height: 400px; max-width: 100%">
            <q-input
                v-model="submissionText"
                outlined
                filled
                rows="20"
                autocomplete="off"
                spellcheck="false"
                debounce="1000"
                label="paste logbook data or em review JSON here:"
                type="textarea"
                style="height: 400px"
            ></q-input>
        </q-scroll-area>
        <p :style="[jsonValid === 'Valid' ? {'color': 'green'} : {'color': 'red'}]">{{ jsonValid }}</p>

        <q-btn
            color="red"
            label="submit"
            @click="submitEMCatch"
            :disable="disableSubmit"
        ></q-btn>

    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';
import { Vue, Watch } from 'vue-property-decorator';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { WatchOptions } from 'vue';

import { Notify } from 'quasar';
import moment from 'moment';

import { getTripsApiTrip, getCatchApiCatch, newApiCatch, updateApiCatch } from '@boatnet/bn-common';
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const tripNum = ref('');
        const submissionText = ref('');
        const catchType = ref('');
        const jsonValid = ref('Valid');
        const inputFile: any = ref([]);
        const disableSubmit = ref(false);

        const watcherOptions: WatchOptions = {
        immediate: false, deep: true
        };

        const submitEMCatch = async () => {
            disableSubmit.value = true;
            if (tripNum.value.length > 0 && catchType.value.length > 0 && submissionText.value.length > 0) {
                const apiTrip = await getTripsApiTrip(parseInt(tripNum.value, 10));
                if (typeof apiTrip === 'string') {
                    Notify.create({
                        message: 'Trip with the specified trip number not found.  Trip must exist before catch can be submitted.',
                        position: 'center',
                        color: 'red',
                        timeout: 3000,
                        icon: 'warning'
                    });
                    disableSubmit.value = false;
                    return;
                }
                const apiCatch: any = await getCatchApiCatch(parseInt(tripNum.value));
                console.log(apiCatch)

                const parsedCatch = JSON.parse(submissionText.value);

                parsedCatch.tripNum = parseInt(tripNum.value,10);
                parsedCatch.source = catchType.value === 'logbook' ? 'logbook': 'thirdParty';
                switch (catchType.value) {
                    case 'logbook':
                        parsedCatch.source = 'logbook';
                        break;
                    case 'em review':
                        parsedCatch.source = 'thirdParty';
                        break;
                    case 'audit':
                        parsedCatch.source = 'nwfscAudit';
                        break;
                }

                if (parsedCatch._id ) {delete parsedCatch._id;}
                if (parsedCatch._rev) {delete parsedCatch._rev;}
                const catchSources = apiCatch.map( (row: any) => row.source)
                if (typeof apiCatch === 'string' || !catchSources.includes(parsedCatch.source)) {
                    console.log('catch does not include catch type');
                    // no existing catch found - use newApiCatch
                    parsedCatch.createdBy = authService.getCurrentUser()!.username;
                    parsedCatch.createdDate = moment().format();
                    console.log(parsedCatch)
                    await newApiCatch(parsedCatch).then( (res) => {
                        console.log(res);
                        Notify.create({
                            message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase">' + catchType.value + ' Data Successfully Updated</div>',
                                position: 'top',
                                color: 'green',
                                timeout: 3000,
                                icon: 'warning',
                                html: true,
                                multiLine: true
                            });
                        disableSubmit.value = false;
                        return;
                        });
                } else if (apiCatch.map( (row: any) => row.source).includes(parsedCatch.source)) {
                    console.log('catch includes catch type');
                    // existing catch of catchType found - use updateApiCatch
                    parsedCatch.updatedBy = authService.getCurrentUser()!.username;
                    parsedCatch.updatedDate = moment().format();
                    parsedCatch.resubmission = true;
                    await updateApiCatch(parsedCatch).then( (res) => {
                        console.log(res);
                        Notify.create({
                            message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase">' + catchType.value + ' Data Successfully Updated</div>',
                                position: 'top',
                                color: 'green',
                                timeout: 3000,
                                icon: 'warning',
                                html: true,
                                multiLine: true
                            });
                        disableSubmit.value = false;
                        return;
                    });
                }
            } else {
                Notify.create({
                    message: 'Missing required info',
                    position: 'center',
                    color: 'red',
                    timeout: 3000,
                    icon: 'warning',
                });
                disableSubmit.value = false;
                return;
            }

        };

        const loadLogbook = () => {
            submissionText.value = JSON.stringify(require('../assets/logbookExample.json'), null, 2);
        }

        const loadReview = () => {
            submissionText.value = JSON.stringify(require('../assets/reviewExample.json'), null, 2);
        }

        const reviewExample = '';

        watch(
        () => submissionText.value,
        (newVal, oldVal) => {
            let parsedJson = '';
            try {
                parsedJson = JSON.parse(newVal);
                jsonValid.value = 'Valid';
            } catch (err) {
                jsonValid.value = 'Invalid JSON: ' + JSON.stringify(err.message);
            }
        },
        watcherOptions
        );

        watch(
        () => inputFile.value,
        (newVal, oldVal) => {
            if (inputFile.value.length > 0) {
                const reader: any = new FileReader();
                reader.readAsText(inputFile.value[0]);
                reader.onload = () => {
                    submissionText.value = reader.result;
                };
            }
        },
        watcherOptions
        );

        onMounted( () => {
            tripNum.value = context.root.$route.params.id;
            catchType.value = context.root.$route.params.type;
        })

        return {tripNum, submissionText, catchType, jsonValid, inputFile, submitEMCatch, disableSubmit, loadLogbook, loadReview};

        }
});
</script>

<style scoped>

    label.fileInput {
        display: inline-block;
        margin: 10px 0;
        padding: 0.5em;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
    }

    label.fileInput input[accept*="application/json"] {
        display: none;
    }

    .portal-element {
        width: 100%;
        max-width: 350px;
        margin: 5px !important;
    }

    .portal-heading {
        font-size: 20px;
        font-weight: bold;
    }

</style>
