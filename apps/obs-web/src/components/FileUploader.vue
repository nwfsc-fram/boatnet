<template>
    <div style="text-align: center; display: flex; justify-content: center; align-items: center;">
        <div style="width: 320px;">
            <div class="text-h6">{{ label }}</div>

            <label class="cameraButton shadow-2 bg-primary text-white">Capture
                <input @change="handleImage($event)" type="file" accept="image/*;capture=camera" capture="user">
                <!-- <input @change="handleImage($event)" type="file" accept="image/*" capture="user"> -->
            </label>&nbsp;
            <br>
            <div class="container" v-for="file of files" :key="files.indexOf(file)">
                <img :src="getImageUrl(file)" :alt="file.name" style="width: 320px">
                <q-btn class="button" size="sm" icon="clear" round color="red" @click="removeAtIndex(files.indexOf(file))"></q-btn>
            </div>
            <span>
                <q-btn v-if="files.length > 0 && !applied" class="submitButton" color="primary" @click="submitImage()">{{ submitAction }}</q-btn>
                <q-spinner-radio v-if="transferring" color="primary" size="3em"/>
                <q-btn v-if="files.length > 0 && !applied && submitAction === 'Add Image(s)'" flat color="red" icon="error">not added yet</q-btn>
                <q-btn v-if="files.length > 0 && applied && submitAction === 'Add Image(s)'" flat color="primary" icon="check_circle">added to trip</q-btn>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
    import { createComponent, ref, reactive, computed, onMounted } from '@vue/composition-api';
    import Compressor from 'compressorjs';
    import { Emit } from 'vue-property-decorator';
    import { newTripsApiTrip } from '@boatnet/bn-common';
    import { AuthState, authService } from '@boatnet/bn-auth';
    import moment from 'moment';
    import { Notify } from 'quasar';
    import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
    import { Client, CouchDoc, ListOptions } from 'davenport';

    export default createComponent({
        props: {
            label: String,
            trip: Object,
            submitAction: String
        },
        setup(props, context) {

            const files: any = ref([]);
            const fileUrls: any = ref([]);

            const store = context.root.$store;
            const state = store.state;
            const transferring: any = ref(false);
            const applied: any = ref(true);

            const handleImage = (event: any) => {
                const newFile = new Compressor(event!.target!.files[0], {
                    quality: 0.6,
                    maxWidth: 1200,
                    maxHeight: 1200,
                    success(result) {
                        files.value.push(result);
                        const newItemIndex = files.value.length - 1;
                        fileUrls.value[newItemIndex] = URL.createObjectURL(files.value[newItemIndex]);
                        applied.value = false;
                    }
                });
            };

            const getImageUrl = (file: any) => {
                return URL.createObjectURL(file);
            };

            const removeAtIndex = (index: number) => {
                files.value.splice(index, 1);
                applied.value = false;
                props.trip!._attachments = {};
            };

            let tripsApiNum: any;
            const submitImage = async () => {

                props.trip!.vesselId = state.vessel.activeVessel.coastGuardNumber ? state.vessel.activeVessel.coastGuardNumber : state.vessel.activeVessel.stateRegulationNumber;

                if ( props.trip!.tripNum === 0) {
                    await newTripsApiTrip(props.trip).then( (res: any) => tripsApiNum = res.tripNum);
                    props.trip!.tripNum = tripsApiNum;
                }

                props.trip!._attachments = {};

                for (const file of files.value) {
                    const fileName = props.label! + ' ' + (files.value.indexOf(file) + 1) + ' - ' + authService.getCurrentUser()!.username + ' - ' + moment().format();

                    let result: any;
                    const reader = new FileReader();
                    reader.readAsDataURL(file);

                    reader.onload = async () => {
                        result = reader.result;
                        props.trip!._attachments[fileName] = {
                            content_type: file.type,
                            data: result.split(',')[1]
                        };
                        props.trip!.changeLog.unshift(
                            {
                                updatedBy: authService.getCurrentUser()!.username,
                                updateDate: moment().format('MM/DD/YYYY HH:mm A'),
                                change: 'added/updated logbook capture'
                            }
                        );
                    };
                }

                const masterDB: Client<any> = couchService.masterDB;
                const postToCouch = async () => {
                    transferring.value = true;
                    await masterDB.post(
                        props.trip
                        ).then( () => {
                            transferring.value = false;
                            Notify.create({
                                message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>' + props.label + '(s) Successfully Transferred<br>&nbsp;<br>&nbsp;</div>',
                                position: 'top',
                                color: 'primary',
                                timeout: 7000,
                                html: true,
                                multiLine: true
                            });
                            context.root.$router.push({ path: '/home' });
                        });
                    };

                if (props.submitAction! === 'Submit Image(s)') {
                    setTimeout(postToCouch, 500 );
                }
                applied.value = true;
                return;
            };

            const getAttachments = async () => {
                if (Object.keys(props.trip!._attachments).length > 0) {
                    transferring.value = true;
                    const masterDb: Client<any> = couchService.masterDB;
                    const queryOptions: any = {
                        include_docs: true,
                        attachments: true,
                        key: props.trip!._id
                    };

                    const tripWithAttachment: any = await masterDb.view<any>(
                        'obs_web',
                        'ots_trips_by_id',
                        queryOptions
                    );

                    props.trip!._attachments = tripWithAttachment.rows[0].doc._attachments;

                    for (const attachment of Object.keys(props.trip!._attachments)) {
                        const filename = attachment;

                        const byteCharacters = atob(props.trip!._attachments[filename].data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], {type: props.trip!._attachments[filename].content_type});
                        files.value.push(blob);
                        fileUrls.value.push(URL.createObjectURL(files.value[files.value.indexOf(blob)]));
                    }
                    transferring.value = false;
                }
            };
            onMounted( () => {
                getAttachments();
            });

            return {
                handleImage, files, getImageUrl, removeAtIndex, transferring, submitImage, applied
            };
        }
    });
</script>

<style scoped>

    label.cameraButton {
        display: inline-block;
        margin: 10px 0;
        padding: 0.5em;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
    }

    label.cameraButton input[accept*="image"] {
        display: none;
    }

    .submitButton {
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: bold;
    }

    label {
        margin: 0
    }

    .container {
        position: relative;
        width: 100%;
    }

    .container img {
        width: 100%;
        height: auto;
    }

    .container .button {
        position: absolute;
        top: 35px;
        left: 290px;
        transform: translate(-20%, -90%);
        -ms-transform: translate(-20%, -90%);
        cursor: pointer;
    }

</style>